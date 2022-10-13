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

class Cart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            cart_entries: [],
            removed_entries: [],

            error_message: ""
        };

        isAuthenticated().then(is_auth => { if (!is_auth) { window.location = "/fo/login" } } );
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
                    cart_entries = await api_request({
                        method: "PUT",
                        url: `${process.env.REACT_APP_DOMAIN}/users/customers/${await getUsername()}/cart/`,
                        data: { cart: cart_entries.map((entry) => ({ barcode: entry.product.barcode, quantity: entry.quantity })) }
                    });
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

            <Container>
                <Row>
                    <Col xs={{ span: 12, order: 2 }} md={{ span: 8, order: 1 }}>
                        {
                            (() => {
                                if (this.state.removed_entries.length === 0) { return; }

                                return (
                                    <div className="alert alert-danger" role="alert">
                                        <p>I seguenti prodotti sono stati rimossi dal carrello perché non sono più disponibili:</p>
                                        <ul style={{ listStyleType: "none" }}>
                                            { this.renderRemovedContent() }
                                        </ul>
                                    </div>  
                                );
                            })()
                        }

                        <div className="table-responsive">
                            <table className="table align-middle">
                                <thead>
                                    <tr>
                                        <th className="fs-5" style={{width: "60%"}}>Prodotto</th>
                                        <th className="fs-5 text-center" style={{width: "20%"}}>Quantità</th>
                                        <th className="fs-5 text-center" style={{width: "20%"}}>Prezzo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    { this.renderCartContent() }
                                </tbody>
                            </table>
                        </div>
                    </Col>

                    <Col xs={{ span: 12, order: 1 }} md={{ span: 4, order: 2 }}>
                    </Col>
                </Row>
            </Container>
        </>);
    }

    renderCartContent() {
        let entries = [];

        for (const cart_entry of this.state.cart_entries) {
            let image = "";
            let message = "";

            if (cart_entry.product.images[0]) { image = `${process.env.REACT_APP_DOMAIN}${cart_entry.product.images[0].path}`; }
            else { image = `${process.env.REACT_APP_DOMAIN}/shop/images/default.png`; }

            if (cart_entry.message) {
                message = (<div className="alert alert-warning p-1" role="alert">{cart_entry.message}</div>);
            }

            entries.push(
                <tr key={cart_entry.product.barcode}>
                    <td>
                        <Link to={`/shop/item?id=${cart_entry.source_item.id}`} className="text-decoration-none text-black">
                            <div className="d-flex justify-content-start align-items-center">
                                <div className={`d-flex align-items-center justify-content-center ${css["container-image"]}`}>
                                    <img src={image} alt="" style={{ maxWidth: "100%", maxHeight: "100%" }} />
                                </div>
                                <span className="ms-3 fs-4"> {cart_entry.source_item.name} ({cart_entry.product.name}) </span>
                            </div>
                        </Link>
                    </td>
                    <td className="text-center">
                        {message}
                        <NumberInput type="number" className="form-control" label="Quantità" inline hide-label
                                     defaultValue={cart_entry.quantity} min="1" max={cart_entry.product.quantity} step="1" />
                        <span>{centToPrice(cart_entry.product.price)}€ cad.</span>
                    </td>
                    <td className="text-center">
                        <span className="fw-semibold fs-5">{centToPrice(cart_entry.product.price * cart_entry.quantity)}€</span>
                    </td>
                </tr>
            )
        }

        return entries;
    }

    renderRemovedContent() {
        let entries = [];

        for (const cart_entry of this.state.removed_entries) {
            entries.push(
                <li key={cart_entry.product.barcode}>
                    <Link to={`/shop/item?id=${cart_entry.source_item.id}`} className="text-decoration-none text-black">
                        <span className=""> {cart_entry.source_item.name} ({cart_entry.product.name}) </span>
                    </Link>
                </li>
            );
        }

        return entries;
    }
}

export default Cart;