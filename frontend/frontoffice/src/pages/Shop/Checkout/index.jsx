import React from "react";
import { Helmet } from "react-helmet";
import Navbar from "../../../components/Navbar";
import $ from "jquery";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from 'react-bootstrap/Button';
import { centToPrice } from "../../../utilities/currency"
import { isAuthenticated, getUsername, api_request } from "../../../import/auth.js"
import css from "./checkout.module.css";
import CheckoutEntry from "./components/CheckoutEntry";

class Checkout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            cart_content: [],
            shipping_method: "delivery",

            error_message: ""
        };

        isAuthenticated().then(is_auth => { if (!is_auth) { window.location = `${process.env.REACT_APP_BASE_PATH}/login?return=${window.location.href}` } } );
    }
    
    componentDidMount() {
        (async () => {
            try {
                const cart = await api_request({ 
                    method: "GET", 
                    url: `${process.env.REACT_APP_DOMAIN}/users/customers/${await getUsername()}/cart/` 
                });
                
                if (cart.length === 0) { return this.setState({ error_message: "Non hai prodotti nel carrello" }); }

                this.setState({ cart_content: cart });
            }
            catch (err) {
                this.setState({ error_message: "Non è stato possibile trovare i prodotti del carrello" });
            }
        })();
    }

    render() {
        return (<>
            <Helmet>
                <title>Checkout</title>
            </Helmet>
            
            <Navbar/>

            <main>
                <Container className="my-3">
                    <Row><h1>Checkout</h1></Row>

                    <Row>
                        <Col xs="12" md="6">
                            <section aria-label="Riepilogo contenuto ordine">
                                <ul className="list-group">
                                    { this.renderOrderContent() }
                                </ul>
                            </section>
                        </Col>

                        <Col xs="12" md="6">
                            <Row>
                                <section aria-label="Totale ordine">
                                    <p className="text-center fs-3">Totale <span className="fw-semibold fs-1">{centToPrice(this.getOrderTotal())}€</span></p>
                                </section>
                            </Row>

                            <Row className="mt-3">
                                <section aria-label="Modalità di consegna">
                                    <fieldset>
                                        <legend className="text-center fw-semibold">Metodo di consegna</legend>
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

                                    <div>
                                        { this.shippingMethodForm() }
                                    </div>
                                </section>
                            </Row>
                        </Col>
                    </Row>
                </Container>
            </main>
        </>);
    }

    renderOrderContent() {
        const rows = [];

        for (const entry of this.state.cart_content) {
            rows.push(                
                <li key={entry.product.barcode} className="list-group-item">
                    <CheckoutEntry entry={entry} />
                </li>
            );
        }

        return rows;
    }

    getOrderTotal() {
        let total = 0;
        for (const entry of this.state.cart_content) { total += entry.product.price * entry.quantity; }
        return total;
    }

    shippingMethodForm() {
        if (this.state.shipping_method === "delivery") {
            return "Form indirizzo";
        }
        else {
            return "Form ricerca hub"
        }
    }
}

export default Checkout;