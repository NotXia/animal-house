import React from "react";
import { Helmet } from "react-helmet";
import "../../../scss/bootstrap.scss";
import Navbar from "../../../components/Navbar";
import LoadingScreen from "../../../components/Loading";
import $ from "jquery";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { centToPrice } from "modules/currency"
import { isAuthenticated, getUsername, api_request } from "modules/auth"
import css from "./checkout.module.css";
import CheckoutEntry from "./components/CheckoutEntry";
import TextInput from "../../../components/form/TextInput";
import UserValidator from "../../../utilities/validation/UserValidation";
import { GeocoderAutocomplete } from '@geoapify/geocoder-autocomplete';
import "@geoapify/geocoder-autocomplete/styles/minimal.css";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../../../components/form/CheckoutForm";
import { updateURLQuery } from "../../../utilities/url"
import SearchParamsHook from "../../../hooks/SearchParams";
import CartAPI from "modules/api/cart";
import CustomerAPI from "modules/api/customer";
import HubAPI from "modules/api/hub";
import OrderAPI from "modules/api/order";
import ItemAPI from "modules/api/item";
import Footer from "../../../components/Footer";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

class Checkout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            order_content: [],
            shipping_method: "delivery", // [ delivery, takeaway ]
            step: "", // [ checkout, payment ]

            curr_selected_hub: null,
            curr_hub_list: [],

            clientSecret: null,

            takeaway_hub_error_message: "",
            error_message: ""
        };

        this.input = {
            delivery: {
                street: React.createRef(),
                number: React.createRef(),
                city: React.createRef(),
                postal_code: React.createRef()
            }
        }
        this.payment = React.createRef();
        this.loading_screen = React.createRef();

        // Id dell'ordine attuale
        this.order_id = this.props.searchParams.get("order_id"); 

        isAuthenticated().then(is_auth => { if (!is_auth) { window.location = `${process.env.REACT_APP_BASE_PATH}/login?return=${window.location.href}` } } );
    }
    
    componentDidMount() {
        this.loading_screen.current.wrap(async () => {
            if (!this.order_id) { /* Nuovo ordine */
                this.setState({ step: "checkout" });

                /* Estrazione dati carrello */
                const cart = await CartAPI.getByUsername(await getUsername()).catch((err) => { this.setState({ error_message: "Non è stato possibile trovare i prodotti del carrello", step: null }); });
                if (cart.length === 0) { return window.location = `${process.env.REACT_APP_BASE_PATH}/shop/cart`; }
                this.setState({ order_content: cart });

                /* Estrazione indirizzo utente */
                try {
                    const user_data = await CustomerAPI.getAllDataByUsername(await getUsername());
    
                    // Autocompletamento indrizzo di consegna
                    this.setDeliveryAddress(user_data.address);
    
                    // Autocompletamento hub di ritiro
                    const address_data = await $.ajax({
                        method: "GET", url: "https://nominatim.openstreetmap.org/search",
                        data: {
                            street: `${user_data.address.number} ${user_data.address.street}`,
                            city: `${user_data.address.city}`, postalcode: `${user_data.address.postal_code}`, country: "italy",
                            format: "json", limit: 1
                        }
                    });

                    await this.setSuggestedHubs(address_data[0].lat, address_data[0].lon);
                }
                catch (err) {
                    await this.setSuggestedHubs(41.89024784119525, 12.492276806383584);
                }

                /* Inizializzazione autocompletamento indirizzi per hub */
                const hub_address_search = new GeocoderAutocomplete(document.getElementById("autocomplete-takeaway"), process.env.REACT_APP_GEOAPIFY_KEY, { lang: "it", placeholder: "Cerca l'hub più vicino a te", bias: "it" });
                hub_address_search.on('select', async (location) => {
                    await this.setSuggestedHubs(location.properties.lat, location.properties.lon);
                });
            }
            else { /* Si tratta di un ordine esistente, si passa direttamente al pagamento */
                this.setState({ step: "payment" });
                
                let order_content = [];

                /* Estrazione contenuto ordine */
                const order = await OrderAPI.getById(this.order_id).catch((err) => { this.setState({ error_message: "Non è stato possibile trovare l'ordine", step: null }) });
                if (order.status != "pending") { window.location = `${process.env.REACT_APP_BASE_PATH}/shop` }

                /* Composizione della entry per ogni prodotto */
                for (const product of order.products) {
                    const source_item = await ItemAPI.getByBarcode(product.barcode);
                    source_item.name = product.item_name;

                    order_content.push({
                        source_item: source_item,
                        product: product,
                        quantity: product.quantity
                    });
                }

                this.setState({ order_content: order_content });

                /* Avvio pagamento */
                await this.startPayment(this.order_id);
            }
        });
    }

    render() {
        return (<>
            <Helmet>
                <title>Checkout</title>
            </Helmet>
            
            <Navbar/>
            <LoadingScreen ref={this.loading_screen} />

            <main>
                <Container className="my-3">
                    <Row><h1>Checkout</h1></Row>
                    <Row><p className="invalid-feedback d-block fs-5 fw-semibold text-center" aria-live="assertive">{this.state.error_message}</p></Row>

                    <Row>
                        <Col xs={{span: 12, order: 2}} md={{span: 6, order: 1}}>
                            <section aria-label="Riepilogo contenuto ordine">
                                {/* Contenuto ordine */}
                                <ul className="list-group">
                                    { 
                                        this.state.order_content.map((entry) => (
                                            <li key={entry.product.barcode} className="list-group-item">
                                                <CheckoutEntry entry={entry} />
                                            </li>
                                        ))
                                    }
                                </ul>
                            </section>
                        </Col>

                        <Col xs={{span: 12, order: 1}} md={{span: 6, order: 2}}>
                            <Row>
                                <section aria-label="Totale ordine">
                                    <p className="text-center fs-3">Totale <span className="fw-semibold fs-1">{centToPrice(this.getOrderTotal())}€</span></p>
                                </section>
                            </Row>
                            
                            {/* -- Step modalità di consegna -- */}
                            <div className={`my-3 ${this.state.step === "checkout" ? "" : "d-none"}`}> 
                                <Row className="mt-3">
                                    <form>
                                        <section aria-label="Modalità di consegna">
                                            {/* Selettore modalità di consegna */}
                                            <fieldset>
                                                <legend className="text-center fw-semibold fs-4">Metodo di consegna</legend>
                                                <div className={`d-flex justify-content-evenly ${css["container-shipping_method"]}`}>
                                                    <div className="d-flex justify-content-center w-50">
                                                        <input id="radio-delivery" className="visually-hidden" type="radio" name="shipping_method" 
                                                            checked={this.state.shipping_method === "delivery"} onChange={(e) => this.setState({ shipping_method: "delivery"}) } />
                                                        <label htmlFor="radio-delivery">
                                                            <img src={`${process.env.REACT_APP_DOMAIN}/img/icons/delivery.png`} alt="" />
                                                            <p className="m-0 fs-5">Consegna a domicilio</p>
                                                        </label>
                                                    </div>
                                                
                                                    <div className="w-50 d-flex justify-content-center">
                                                        <input id="radio-takeaway" className="visually-hidden" type="radio" name="shipping_method" 
                                                            checked={this.state.shipping_method === "takeaway"} onChange={(e) => this.setState({ shipping_method: "takeaway"}) } />
                                                        <label htmlFor="radio-takeaway">
                                                            <img src={`${process.env.REACT_APP_DOMAIN}/img/icons/takeaway.png`} alt="" />
                                                            <p className="m-0 fs-5">Ritiro in negozio</p>
                                                        </label>
                                                    </div>
                                                </div>
                                            </fieldset>

                                            <div className="mt-3">
                                                {/* Form indirizzo di consegna */}
                                                <Container fluid className={this.state.shipping_method === "delivery" ? "" : "d-none"}>
                                                    <Row>
                                                        <Col xs="8">
                                                            <TextInput ref={this.input.delivery.street} id="input-street" type="text" name="street" label="Via" detached required validation={UserValidator.street} />
                                                        </Col>
                                                        <Col xs="4">
                                                            <TextInput ref={this.input.delivery.number} id="input-number" type="text" name="number" label="Civico" detached required validation={UserValidator.number} />
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col xs="6">
                                                            <TextInput ref={this.input.delivery.city} id="input-city" type="text" name="city" label="Città" detached required validation={UserValidator.city} />
                                                        </Col>
                                                        <Col xs="6">
                                                            <TextInput ref={this.input.delivery.postal_code} id="input-postal_code" type="text" name="postal_code" label="CAP" detached required validation={UserValidator.postal_code} />
                                                        </Col>
                                                    </Row>
                                                </Container>

                                                {/* Form indirizzo di ritiro */}
                                                <Container fluid className={this.state.shipping_method === "takeaway" ? "" : "d-none"}>
                                                    <a className="visually-hidden" href="#fieldset-takeaway_hub">Vai alla sezione: lista degli hub vicini</a>
                                                    <a className="visually-hidden" href="#autocomplete-takeaway">Vai alla sezione: Cerca un indirizzo e guarda gli hub più vicini</a>

                                                    <div id="autocomplete-takeaway" style={{ position: "relative" }} className="w-75 mx-auto mb-2"></div>
                                                    <p className="invalid-feedback d-block fw-semibold text-center" aria-live="assertive">{this.state.takeaway_hub_error_message}</p>
                                                    <p><span className="fw-semibold">Consegna a:</span> { !this.state.curr_selected_hub ? "" :
                                                                    `${this.state.curr_selected_hub.name} (${this.state.curr_selected_hub.address.street} ${this.state.curr_selected_hub.address.number}, ${this.state.curr_selected_hub.address.city})` } </p> 
                                                    
                                                    <fieldset id="fieldset-takeaway_hub">
                                                        <legend className="visually-hidden">Hub di consegna</legend>
                                                        <ul className="list-group list-group-flush">
                                                            {
                                                                this.state.curr_hub_list.map((hub) => {
                                                                    const active = this.state.curr_selected_hub?.code === hub.code ? "active" : "";

                                                                    return (
                                                                        <li key={hub.code} className={`list-group-item list-group-item-action list-group-item-light ${active} p-0`}>
                                                                            <label htmlFor={`radio-takeaway-${hub.code}`} className={`w-100 h-100 ${css["container-takeaway-hub"]} p-2`}>
                                                                                <span className="fw-semibold">{hub.name}</span> {hub.address.street} {hub.address.number}, {hub.address.city} ({hub.address.postal_code})
                                                                            </label>
                                                                            <input id={`radio-takeaway-${hub.code}`} className="visually-hidden" type="radio" name="takeaway-hub" value={hub.code}
                                                                                    onChange={ () => this.setTakeawayHub(hub) } />
                                                                        </li>
                                                                    );
                                                                })
                                                            }
                                                        </ul>
                                                    </fieldset>
                                                </Container>
                                            </div>
                                        </section>

                                        <div className="d-flex justify-content-center mt-4">
                                            <button className="btn btn-outline-success" type="submit" onClick={(e) => { e.preventDefault(); this.checkout() }}>Procedi al pagamento</button>
                                        </div>
                                    </form>
                                </Row>
                            </div>

                            {/* -- Step pagamento -- */}
                            <div className={`my-3 ${this.state.step === "payment" ? "" : "d-none"}`}>
                                <Row className="mt-3">
                                    <section aria-label="Pagamento">
                                        <legend className="text-center fw-semibold fs-4">Pagamento</legend>
                                        
                                        <div>
                                        {
                                            this.state.clientSecret && 
                                            (
                                                <Elements options={{ clientSecret: this.state.clientSecret }} stripe={stripePromise}>
                                                    <CheckoutForm ref={this.payment} />
                                                </Elements>
                                            )
                                        }
                                        </div>

                                        <div className="d-flex justify-content-center mt-4">
                                            <button className="btn btn-outline-success" onClick={() => this.completeOrder()}>Completa ordine</button>
                                        </div>
                                    </section>
                                </Row>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </main>

            <Footer />
        </>);
    }


    /* Restituisce il totale dell'ordine */
    getOrderTotal() {
        let total = 0;
        for (const entry of this.state.order_content) { total += entry.product.price * entry.quantity; }
        return total;
    }


    /* Imposta l'indirizzo di consegna (a domicilio) */
    setDeliveryAddress(address) {
        this.input.delivery.street.current.value(address.street);
        this.input.delivery.number.current.value(address.number);
        this.input.delivery.city.current.value(address.city);
        this.input.delivery.postal_code.current.value(address.postal_code);
    }

    /* Imposta gli hub più vicini ad una data posizione per la consegna (ritiro in negozio) */
    async setSuggestedHubs(lat, lon) {
        const hubs = await HubAPI.getNearestFrom(lat, lon, 5, 0);
        this.setState({ curr_hub_list: hubs });
    }

    /* Imposta un dato hub come quello per il ritiro in negozio */
    setTakeawayHub(hub) {
        this.setState({ curr_selected_hub: hub });
        this.setState({ takeaway_hub_error_message: "" });
    }


    /* Valida l'input della modalità di consegna */
    async validateShippingMethod() {
        if (this.state.shipping_method === "delivery") {
            return (
                await this.input.delivery.street.current.validate() &
                await this.input.delivery.number.current.validate() &
                await this.input.delivery.city.current.validate() &
                await this.input.delivery.postal_code.current.validate()
            );
        }
        else {
            if (this.state.curr_selected_hub) {
                return true;
            }
            else {
                this.setState({ takeaway_hub_error_message: "Nessun hub selezionato" });
                return false;
            }
        }
    }

    /* Restituisce i dati dell'ordine */
    getOrderData() {
        const products = this.state.order_content.map((cart_entry) => ({ barcode: cart_entry.product.barcode, quantity: cart_entry.quantity }));
        let order_data = { products: products };

        if (this.state.shipping_method === "takeaway") {
            order_data.pickup = true;
            order_data.hub_code = this.state.curr_selected_hub.code;
        }
        else {
            order_data.pickup = false;
            order_data.address = {
                street: this.input.delivery.street.current.value(),
                number: this.input.delivery.number.current.value(),
                city: this.input.delivery.city.current.value(),
                postal_code: this.input.delivery.postal_code.current.value()
            };
        }

        return order_data;
    }


    /* Crea l'ordine e procede al pagamento */
    async checkout() {
        await this.loading_screen.current.wrap(async () => {
            try {
                if (!await this.validateShippingMethod()) { return; }

                // Creazione ordine
                const order = await OrderAPI.create(this.getOrderData());

                // Svuotamento carrello
                await CartAPI.emptyByUser(await getUsername());
                
                // Aggiornamento URL
                this.order_id = order.id;
                updateURLQuery("order_id", order.id);

                await this.startPayment(order.id);
            }
            catch (err) {
                this.setState({ error_message: "Non è stato possibile creare l'ordine", step: null });
            }
        });
    }

    /* Avvia una sessione per il pagamento */
    async startPayment(order_id) {
        try {
            const payment_data = await api_request({
                method: "POST", url: `${process.env.REACT_APP_DOMAIN}/shop/orders/${encodeURIComponent(order_id)}/checkout`
            });

            this.setState({ clientSecret: payment_data.clientSecret, step: "payment" });
        }
        catch (err) {
            this.setState({ error_message: "Non è stato possibile creare l'ordine", step: null });
        }
    }

    /* Gestisce la transazione */
    async completeOrder() {
        await this.loading_screen.current.wrap(async () => {
            await this.payment.current.handlePayment(`${process.env.REACT_APP_DOMAIN}${process.env.REACT_APP_BASE_PATH}/shop/checkout/success?order_id=${encodeURIComponent(this.order_id)}`);
        });
    }
}

export default SearchParamsHook(Checkout);