import React from "react";
import { Helmet } from "react-helmet";
import Navbar from "../../../components/Navbar";
import $ from "jquery";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from 'react-bootstrap/Button';
import NumberInput from "../../../components/form/NumberInput";
import { centToPrice } from "../../../utilities/currency"
import { isAuthenticated, getUsername, api_request } from "../../../import/auth.js"
import css from "./cart.module.css";
import { Link } from "react-router-dom";
import CartEntry from "./components/CartEntry";

class Cart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            cart_entries: [],
            removed_entries: [],

            error_message: ""
        };

        isAuthenticated().then(is_auth => { if (!is_auth) { window.location = `${process.env.REACT_APP_BASE_PATH}/login?return=${window.location.href}` } } );
    }
    
    componentDidMount() {
        (async () => {
            let require_cart_update = false;

            try {
                // Estrazione dei prodotti del carrello
                let cart_entries = await api_request({ 
                    method: "GET", 
                    url: `${process.env.REACT_APP_DOMAIN}/users/customers/${await getUsername()}/cart/` 
                });

                /* Controllo disponibilità prodotti */
                let to_remove_entries = []

                for (let i=0; i<cart_entries.length; i++) {
                    let cart_entry = cart_entries[i];

                    if (cart_entry.product.quantity === 0) { // Prodotto non più disponibile
                        to_remove_entries.push(cart_entry);
                        cart_entries.splice(i, 1); i--; // Rimozione dell'indice e riallineamento iteratore
                        require_cart_update = true;
                    }
                    else if (cart_entry.quantity > cart_entry.product.quantity) { // Prodotto insufficiente rispetto alla richiesta
                        cart_entry.message = `Quantità ridotta rispetto alle disponibilità (era ${cart_entry.quantity})`;
                        cart_entry.quantity = cart_entry.product.quantity;
                        require_cart_update = true;
                    }
                }

                // Aggiornamento carrello
                if (require_cart_update) {
                    await this.updateCart(cart_entries);
                }

                this.setState({ cart_entries: cart_entries, removed_entries: to_remove_entries });
            }
            catch (err) {
                this.setState({ error_message: "Si è verificato un errore durante il caricamento del carrello" });
            }
        })();
    }

    render() {
        return (<>
            <Helmet>
                <title>Carrello</title>
            </Helmet>
            
            <Navbar/>

            <main>
                <Container className="my-3">
                    <Row> <h1>Carrello</h1> </Row>

                    <Row>
                        <Col xs={{ span: 12, order: 2 }} md={{ span: 8, order: 1 }}>
                                {
                                    /* Segnalazione di prodotti rimossi */
                                    (() => {
                                        if (this.state.removed_entries.length === 0) { return; }
                                        
                                        return (
                                            <section aria-label="Avviso cambiamenti al carrello">
                                                <div className="alert alert-danger" role="alert">
                                                    <p>I seguenti prodotti sono stati rimossi dal carrello perché non sono più disponibili:</p>
                                                    <ul className="mb-0" style={{ listStyleType: "none" }}>
                                                        { this.renderRemovedContent() }
                                                    </ul>
                                                </div>  
                                            </section>
                                        );
                                    })()
                                }

                            <section aria-label="Contenuto carrello">
                                {/* Lista dei prodotti nel carrello */}
                                <div>
                                    <ul className="list-group">
                                        { this.renderCartContent() }
                                    </ul>
                                </div>
                            </section>
                        </Col>

                        {/* Totale carrello */}
                        <Col xs={{ span: 12, order: 1 }} md={{ span: 4, order: 2 }} className="mb-3 mb-md-0">
                            <section aria-label="Procedi con ordine">
                                <div className={`${css["container-checkout"]}`}>
                                    <p className="fs-4 text-center">Totale <span className="fw-semibold fs-2">{this.getOrderTotalString()}€</span></p>
                                    <div className="d-flex justify-content-center">
                                        <Button variant="outline-primary" className="mb-1">
                                            <span className="fs-6">Procedi con l'ordine</span>
                                        </Button>
                                    </div>
                                </div>
                            </section>
                        </Col>
                    </Row>
                </Container>
            </main>
        </>);
    }

    renderCartContent() {
        let entries = [];

        if (this.state.cart_entries.length === 0) { return (<li className="list-group-item fs-5">È piuttosto vuoto da queste parti</li>) }

        for (const cart_entry of this.state.cart_entries) {
            entries.push(
                <li key={cart_entry.product.barcode} className="list-group-item">
                    <CartEntry entry={cart_entry} 
                               onDelete={() => this.deleteCartEntryByBarcode(cart_entry.product.barcode)} 
                               onQuantityChange={(quantity) => this.updateCartEntryQuantityByBarcode(cart_entry.product.barcode, quantity)} />
                </li>
            );
        }

        return entries;
    }

    renderRemovedContent() {
        let entries = [];

        for (const cart_entry of this.state.removed_entries) {
            entries.push(
                <li key={cart_entry.product.barcode}>
                    <Link to={`/shop/item?id=${cart_entry.source_item.id}`} className="text-decoration-none text-black">
                        <div className="text-truncate">
                            <span> {cart_entry.source_item.name} ({cart_entry.product.name}) </span>
                        </div>
                    </Link>
                </li>
            );
        }

        return entries;
    }


    /**
     * Gestisce la cancellazione di un elemento del carrello
     */
    async deleteCartEntryByBarcode(barcode) {
        let cart_entries = this.state.cart_entries;
        let to_delete_index = cart_entries.findIndex((entry) => entry.product.barcode === barcode); // Ricerca indice da eliminare

        if (to_delete_index >= 0) {
            cart_entries.splice(to_delete_index, 1);

            cart_entries = await this.updateCart(cart_entries); // Aggiornamento server
            this.setState({ cart_entries: cart_entries });
        }
    }

    /**
     * Gestisce l'aggiornamento di un elemento del carrello
     */
    async updateCartEntryQuantityByBarcode(barcode, quantity) {
        let cart_entries = this.state.cart_entries;
        let to_update_index = cart_entries.findIndex((entry) => entry.product.barcode === barcode); // Ricerca indice da aggiornare

        if (to_update_index >= 0) {
            cart_entries[to_update_index].quantity = quantity;

            cart_entries = await this.updateCart(cart_entries); // Aggiornamento server
            this.setState({ cart_entries: cart_entries });
        }
    }

    /**
     * Aggiorna il carrello sul server
     * @param updated_cart_entries  Entry del carrello nella forma [ { source_item, product, quantity } ]
     */
    async updateCart(updated_cart_entries) {
        return await api_request({
            method: "PUT",
            url: `${process.env.REACT_APP_DOMAIN}/users/customers/${await getUsername()}/cart/`,
            processData: false, contentType: "application/json",
            data: JSON.stringify({ cart: updated_cart_entries.map((entry) => ({ barcode: entry.product.barcode, quantity: entry.quantity })) })
        });
    }

    getOrderTotalString() {
        let total = 0;

        for (const entry of this.state.cart_entries) { total += entry.quantity * entry.product.price; }

        return centToPrice(total);
    }
}

export default Cart;