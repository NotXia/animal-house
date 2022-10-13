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

class Cart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            cart_entries: [],

            error_message: ""
        };

        isAuthenticated().then(is_auth => { if (!is_auth) { window.location = "/fo/login" } } );
    }
    
    componentDidMount() {
        // Estrazione dei prodotti del carrello
        (async () => {
            try {
                const cart_products = await api_request({ 
                    method: "GET", 
                    url: `${process.env.REACT_APP_DOMAIN}/users/customers/${await getUsername()}/cart/` 
                });

                this.setState({ cart_entries: cart_products });
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
                        <table className="table align-middle">
                            <thead>
                                <tr>
                                    <th style={{width: "60%"}}>Prodotto</th>
                                    <th style={{width: "15%"}}>Quantità</th>
                                    <th style={{width: "10%"}}>Prezzo</th>
                                    <th style={{width: "15%"}}>Totale</th>
                                </tr>
                            </thead>
                            <tbody>
                                { this.renderCartContent() }
                            </tbody>
                        </table>
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
            if (cart_entry.product.images[0]) { image = `${process.env.REACT_APP_DOMAIN}${cart_entry.product.images[0].path}`; }
            else { image = `${process.env.REACT_APP_DOMAIN}/shop/images/default.png`; }

            entries.push(
                <tr key={cart_entry.product.barcode}>
                    <td>
                        <div className="d-flex justify-content-start align-items-center">
                            <div className={`d-flex align-items-center justify-content-center ${css["container-image"]}`}>
                                <img src={image} alt="" style={{ maxWidth: "100%", maxHeight: "100%" }} />
                            </div>
                            <span className="ms-3 fs-4"> {cart_entry.source_item.name} ({cart_entry.product.name}) </span>
                        </div>
                    </td>
                    <td>
                        <input type="number" className="form-control" defaultValue={cart_entry.quantity} />
                    </td>
                    <td>{centToPrice(cart_entry.product.price)}€</td>
                    <td>
                        <span className="fw-semibold fs-5">{centToPrice(cart_entry.product.price * cart_entry.quantity)}€</span>
                    </td>
                </tr>
            )
        }

        return entries;
    }
}

export default Cart;