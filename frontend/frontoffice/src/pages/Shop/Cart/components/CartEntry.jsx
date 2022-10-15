/**
 * 
 * Visualizza un elemento del carrello
 * Proprietà:
 *  - entry      Dati dell'elemento del carrello
 * 
 * Listener:
 *  - onDelete              Invocato quando viene premuto il bottone rimuovi
 *  - onQuantityChange      Invocato quando viene modificata la quantità
 */

import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import NumberInput from "../../../../components/form/NumberInput";
import { centToPrice } from "../../../../utilities/currency"
import { Link } from "react-router-dom";

class CartEntry extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            quantity: 0,

            error_message: ""
        };

        this.state.quantity = this.props.entry.quantity;
    }
    
    render() {
        const cart_entry = this.props.entry;

        let image = "";
        let message = "";

        if (cart_entry.product.images[0]) { image = `${process.env.REACT_APP_DOMAIN}${cart_entry.product.images[0].path}`; }
        else { image = `${process.env.REACT_APP_DOMAIN}/shop/images/default.png`; }

        if (cart_entry.message) {
            message = (<div className="alert alert-warning p-2 mt-2 mb-1" role="alert">{cart_entry.message}</div>);
        }

        return (<>
            <Container fluid>
                <Row>
                    <Col xs="3" md="4" className="p-0">
                        <Link to={`/shop/item?id=${cart_entry.source_item.id}&barcode=${cart_entry.product.barcode}`} className="text-decoration-none text-black">
                            <div className={`d-flex align-items-center justify-content-center h-100`}>
                                <div className={`d-flex align-items-center justify-content-center w-100`} style={{ height: "12rem" }}>
                                    <img src={image} alt="" style={{ maxWidth: "100%", maxHeight: "100%" }} />
                                </div>
                            </div>
                        </Link>
                    </Col>

                    <Col xs="7" md="6">
                        <div className="d-flex justify-content-start align-items-center h-100">
                            <div>
                                <Link to={`/shop/item?id=${cart_entry.source_item.id}&barcode=${cart_entry.product.barcode}`} className="text-decoration-none text-black">
                                    <span className="fs-4 overflow-hidden">{cart_entry.source_item.name} ({cart_entry.product.name})</span>
                                </Link>

                                {message}
                                <div className="col-12 col-md-8">
                                    <div className="d-flex justify-content-start align-items-end w-100">
                                        <div className="w-50">
                                            <NumberInput type="number" className="form-control" label="Quantità"
                                                         defaultValue={cart_entry.quantity} min="1" max={cart_entry.product.quantity} step="1" onChange={(e) => this.updateQuantity(e.target.value)} />
                                        </div>
                                        <div className="w-50">
                                            <button className="btn btn-outline-danger mb-1 ms-2 text-truncate" onClick={(e) => this.props.onDelete(e)}>Rimuovi</button>
                                        </div>
                                    </div>
                                    <span>{centToPrice(cart_entry.product.price)}€ cad.</span>
                                </div>
                            </div>
                        </div>
                    </Col>

                    <Col xs="2" md="2">
                        <div className="d-flex align-items-center justify-content-center h-100 text-center">
                            <span className="fw-semibold fs-5">{centToPrice(cart_entry.product.price * this.state.quantity)}€</span>
                        </div>
                    </Col>
                </Row>
            </Container>
        </>);
    }

    updateQuantity(quantity) {
        if (quantity <= 0) { return; } 
        this.setState({ quantity: quantity });

        this.props.onQuantityChange(quantity);
    }
}

export default CartEntry;