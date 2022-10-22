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
                <Container className="mt-4">
                    <Row>
                        <Col xs="12" md="6">
                            <section aria-label="Riepilogo contenuto ordine">
                                <ul className="list-group">
                                    { this.renderOrderContent() }
                                </ul>
                            </section>
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
}

export default Checkout;