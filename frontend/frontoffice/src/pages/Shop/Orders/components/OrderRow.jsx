import React from "react";
import { Helmet } from "react-helmet";
import $ from "jquery";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import { centToPrice } from "../../../../utilities/currency";
import moment from "moment";
import OrderStatus from "./OrderStatus"
import ProductEntry from "./ProductEntry"


class OrderRow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

            error_message: ""
        };
    }

    componentDidMount() {
    }

    render() {
        const order = this.props.order;

        return (
            <Container>
                <Row>
                    <Col xs="12">
                        <span className="fs-6">Ordinato il {moment(order.creationDate).format("DD/MM/YYYY HH:MM")}</span>
                    </Col>
                </Row>

                <Row>
                    {/* Prodotti */}
                    <Col xs={{ span: 12, order: 2 }} md={{ span: 8, order: 1 }}>
                        <ul className="list-group">
                            { 
                                order.products.map((product) => (
                                    <li key={product.barcode} className="list-group-item">
                                        <ProductEntry product={product} />
                                    </li>
                                ))
                            }
                        </ul>
                    </Col>

                    {/* Operazioni */}
                    <Col xs={{ span: 12, order: 1 }} md={{ span: 4, order: 2 }}>
                        <p className="fs-5 m-0">{centToPrice(order.total)}€</p>
                        <OrderStatus status={order.status} type={order.pickup ? "takeway" : "delivery"} />
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default OrderRow;