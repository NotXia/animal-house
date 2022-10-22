/**
 * 
 * Visualizza un elemento del carrello per il checkout
 * Proprietà:
 *  - entry      Dati dell'elemento del carrello
 * 
 */

import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { centToPrice } from "../../../../utilities/currency"
import { Link } from "react-router-dom";

class CheckoutEntry extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error_message: ""
        };
    }
    
    render() {
        const cart_entry = this.props.entry;

        let image = "";
        const product_full_name = `${cart_entry.source_item.name} (${cart_entry.product.name})`;

        if (cart_entry.product.images[0]) { image = `${process.env.REACT_APP_DOMAIN}${cart_entry.product.images[0].path}`; }
        else { image = `${process.env.REACT_APP_DOMAIN}/shop/images/default.png`; }

        return (<>
            <Container fluid>
                <Row>
                    <Col xs="3" md="4" className="p-0" aria-hidden="true">
                        <Link to={`/shop/item?id=${cart_entry.source_item.id}&barcode=${cart_entry.product.barcode}`} className="text-decoration-none text-black">
                            <div className={`d-flex align-items-center justify-content-center h-100`}>
                                <div className={`d-flex align-items-center justify-content-center w-100`} style={{ height: "8rem" }}>
                                    <img src={image} alt="" style={{ maxWidth: "100%", maxHeight: "100%" }} />
                                </div>
                            </div>
                        </Link>
                    </Col>

                    <Col xs="6" md="6">
                        <div className="d-flex justify-content-start align-items-center h-100">
                            <div>
                                <Link to={`/shop/item?id=${cart_entry.source_item.id}&barcode=${cart_entry.product.barcode}`} className="text-decoration-none text-black">
                                    <span className="fs-4 overflow-hidden">{product_full_name}</span>
                                </Link>

                                <div className="d-flex justify-content-start align-items-end w-100">
                                    <p className="m-0">Quantità: {cart_entry.quantity}</p>
                                </div>
                            </div>
                        </div>
                    </Col>

                    <Col xs="3" md="2">
                        <div className="d-flex align-items-center justify-content-center h-100 text-center"
                             aria-label={`${centToPrice(cart_entry.product.price * cart_entry.quantity)}€ in totale per ${product_full_name}`}>
                            <span className="fw-semibold fs-4" aria-hidden="true">{centToPrice(cart_entry.product.price * cart_entry.quantity)}€</span>
                        </div>
                    </Col>
                </Row>
            </Container>
        </>);
    }
}

export default CheckoutEntry;