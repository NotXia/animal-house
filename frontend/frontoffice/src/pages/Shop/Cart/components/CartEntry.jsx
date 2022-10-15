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
            cart_entries: [],
            removed_entries: [],

            error_message: ""
        };
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
                    <Col xs="4">
                        <Link to={`/shop/item?id=${cart_entry.source_item.id}`} className="text-decoration-none text-black">
                            <div className={`d-flex align-items-center justify-content-center h-100`}>
                                <div className={`d-flex align-items-center justify-content-center`} style={{ height: "12rem" }}>
                                    <img src={image} alt="" style={{ maxWidth: "100%", maxHeight: "100%" }} />
                                </div>
                            </div>
                        </Link>
                    </Col>
                    
                    <Col xs="6">
                        <div className="d-flex justify-content-start align-items-center h-100">
                            <div>
                                <Link to={`/shop/item?id=${cart_entry.source_item.id}`} className="text-decoration-none text-black">
                                    <span className="fs-4 overflow-hidden">{cart_entry.source_item.name} ({cart_entry.product.name})</span>
                                </Link>

                                {message}
                                <div className="w-50">
                                    <NumberInput type="number" className="form-control" label="Quantità"
                                                defaultValue={cart_entry.quantity} min="1" max={cart_entry.product.quantity} step="1" />
                                    <span>{centToPrice(cart_entry.product.price)}€ cad.</span>
                                </div>
                            </div>
                        </div>
                    </Col>

                    <Col xs="2">
                        <div className="d-flex align-items-center justify-content-center h-100 text-center">
                            <span className="fw-semibold fs-5">{centToPrice(cart_entry.product.price * cart_entry.quantity)}€</span>
                        </div>
                    </Col>
                </Row>
            </Container>
        </>);
    }
}

export default CartEntry;