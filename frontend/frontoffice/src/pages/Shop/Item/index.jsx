/*
    URL query
        id     Id dell'item da visualizzare
        [barcode]   Barcode del prodotto dell'item da visualizzare (se esiste)
*/

import React from "react";
import { Helmet } from "react-helmet";
import $ from "jquery";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from 'react-bootstrap/Button';
import NumberInput from "../../../components/form/NumberInput";
import Navbar from "../../../components/Navbar";
import SearchParamsHook from "../../../hooks/SearchParams";
import { centToPrice } from "../../../utilities/currency"
import ImagesViewer from "../../../components/shop/ImagesViewer";
import ProductCard from "../../../components/shop/ProductCard";
import { isAuthenticated, getUsername, api_request } from "../../../import/auth.js"
import { updateURLQuery } from "../../../utilities/url";

let __relevance_increased= false;

class ShopItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            item: undefined,
            product_index: 0,
            fetched: false,
            cart_data: null,

            logged: false,

            error_message: ""
        };

        this.input = {
            quantity: React.createRef(),
        }
    }

    componentDidMount() {
        /* Estrazione dati item */
        let item_id = this.props.searchParams.get("id");
        let to_search_barcode = this.props.searchParams.get("barcode");

        // Estrazione dati item
        $.ajax({ method: "GET", url: `${process.env.REACT_APP_DOMAIN}/shop/items/${decodeURIComponent(item_id)}` })
        .then((item) => {
            let product_index = 0;
            
            // Ricerca eventuale indice da visualizzare per barcode
            if (to_search_barcode) {
                product_index = item.products.findIndex((product) => product.barcode === to_search_barcode);
                if (product_index < 0) { product_index = 0; }
            }

            this.setState({ item: item, fetched: true }, () => { this.viewProductAtIndex(product_index); });

            // Incremento rilevanza
            if (!__relevance_increased) {
                $.ajax({ method: "POST", url: `${process.env.REACT_APP_DOMAIN}/shop/items/${decodeURIComponent(item_id)}/click` });
                __relevance_increased = true;
            }
        })
        .catch((err) => {
            switch (err.status) {
                case 404: this.setState({ error_message: "Non ci sono prodotti da queste parti", fetched: true }); break;
                default: this.setState({ error_message: "Si è verificato un errore", fetched: true }); break;
            }
        });

        /* Controllo autenticazione */
        isAuthenticated().then(async (is_logged) => { 
            this.setState({ logged: is_logged });

            if (is_logged) {
                /* Estrazione carrello */
                api_request({
                    method: "GET", url: `${process.env.REACT_APP_DOMAIN}/users/customers/${await getUsername()}/cart/`
                })
                .then(cart_data => {
                    this.setState({ cart_data: cart_data });
                });
            }
        });
    }

    render() {
        if (!this.state.fetched) { return (<></>); }

        if (this.state.error_message !== "") {
            return (<>
                <Helmet> <title>Shop</title> </Helmet>
                <Navbar/>

                <Container>
                    <Row>
                        <p className="text-center fs-3 mt-3 invalid-feedback d-block">{this.state.error_message}</p>
                    </Row>
                </Container>
            </>); 
        }

        let product_name_aria_label = this.state.item.products.length === 1 ? this.currProduct().name : `Variante ${this.state.product_index+1} di ${this.state.item.products.length}: ${this.currProduct().name}`

        return (<>
            <Helmet>
                <title>{this.state.item.name}</title>
            </Helmet>
            
            <Navbar/>

            <main className="mt-4 mb-4">
                <Container>
                    <Row>
                        {/* Dati item */}
                        <Col xs={{ span: 12, order: 2 }} md="7" className="mt-4 mt-md-0">
                            <Row>
                                <Col xs="12" md="8">
                                    <section aria-label="Dati del prodotto">
                                        <h1 className="fs-1 mb-1">{this.state.item.name}</h1>
                                        <h2 className="fs-2 overflow-hidden" aria-label={product_name_aria_label}>{this.currProduct().name}</h2>
                                        <p className="fs-3 fw-semibold">{`${centToPrice(this.currProduct().price)}€`}</p>
                                    </section>
                                </Col>
                                <Col xs="12" md="4">
                                    { this.renderAddToCartButton() }
                                </Col>
                            </Row>

                            {/* Selettore prodotti */}
                            { this.renderProductSelector() }

                            <div className="mt-4">
                                <section aria-label="Descrizione del prodotto">
                                    <div dangerouslySetInnerHTML={{__html: this.state.item.description}}></div>
                                    <div dangerouslySetInnerHTML={{__html: this.currProduct().description}}></div>
                                </section>
                            </div>
                        </Col>

                        {/* Immagini */}
                        <Col xs={{ span: 12, order: 1 }} md="5">
                            <section aria-label="Immagini del prodotto">
                                <div>
                                    <ImagesViewer key={`images-viewer-${this.state.product_index}`} images={this.currProduct().images}/>
                                </div>
                            </section>
                        </Col>
                    </Row>
                </Container>
            </main>
        </>);
    }

    currProduct() {
        return this.state.item.products[this.state.product_index];
    }

    renderProductSelector() {
        if (this.state.item.products.length === 1) { return (<></>); }

        return (                
            <section aria-label="Selettore variante">            
                <Container fluid>
                    <Row>
                        <p className="fs-5 p-0 mb-0  mt-2" aria-hidden="true">Variante:</p>
                    </Row>
                    <Row>
                        {
                            this.state.item.products.map((product, index) => {
                                let selected = this.state.product_index === index;
                                
                                return ( 
                                    <ProductCard key={product.barcode} product={product}  selected={selected}
                                                onClick={() => { this.viewProductAtIndex(index) }} /> 
                                )
                            })
                        }  
                    </Row>
                </Container>
            </section>
        );
    }

    renderAddToCartButton() {
        const in_cart_quantity = this.getQuantityInCartOf(this.currProduct().barcode);
        let in_cart_message = "";
        let user_available_quantity = this.currProduct().quantity - in_cart_quantity;

        if (in_cart_quantity > 0) { in_cart_message = `${in_cart_quantity} unità nel carrello`; } 
        
        return (
            <section aria-label="Aggiungi al carrello" className="w-100 h-100">
            <div className="d-flex justify-content-center justify-md-content-end align-items-center h-100">
                {
                    (() => {
                        if (user_available_quantity > 0 && this.state.logged) {
                            return (
                                <div>
                                    <div className="mb-2">
                                        <Button variant="outline-primary" className="w-100" id="button-add_to_cart"
                                                onClick={() => this.addToCard(this.currProduct().barcode, this.input.quantity.current.value())}>Aggiungi al carrello</Button>
                                    </div>
                                    <div className="d-flex justify-content-center">
                                        <div className="w-75">
                                            <NumberInput ref={this.input.quantity} id="product-quantity" min={0} max={user_available_quantity} defaultValue={1} step={1} label="Quantità" required inline no-controls />
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        {in_cart_message}
                                    </div>
                                </div>
                            );
                        }
                        else if (user_available_quantity === 0) {
                            return (
                                <div>
                                    <div className="mb-2">
                                        <Button variant="outline-primary" className="w-100" disabled>Non disponibile</Button>
                                    </div>
                                    <div className="text-center">
                                        {in_cart_message}
                                    </div>
                                </div>
                            );
                        }
                    })()
                }
            </div>
            </section>
        );
    }

    async addToCard(barcode, quantity) {
        $("#button-add_to_cart").prop("disabled", true);

        await api_request({ 
            method: "POST", url: `${process.env.REACT_APP_DOMAIN}/users/customers/${await getUsername()}/cart/`,
            data: {
                barcode: barcode, quantity: parseInt(quantity)
            }
        });

        window.location = `${process.env.REACT_APP_BASE_PATH}/shop/cart`;
    }

    /* Dato un barcode, restituisce la quantità del prodotto già in carrello */
    getQuantityInCartOf(barcode) {
        if (!this.state.cart_data) { return 0; }

        const product_index = this.state.cart_data.findIndex((cart_entry) => cart_entry.product.barcode === barcode);

        if (product_index < 0) { return 0; }
        else { return this.state.cart_data[product_index].quantity; }
    }
    
    viewProductAtIndex(index) {
        this.setState({ product_index: index });
        updateURLQuery("barcode", this.state.item.products[index].barcode);
    }

}

export default SearchParamsHook(ShopItem);
