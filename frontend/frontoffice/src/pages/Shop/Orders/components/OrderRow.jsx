import React from "react";
import $ from "jquery";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { centToPrice } from "../../../../utilities/currency";
import moment from "moment";
import OrderStatus from "./OrderStatus";
import ProductEntry from "./ProductEntry";
import css from "./orderrow.module.css";


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
            <Container className={css["container-order"]}>
                <Row>
                    <Col xs={{ span: 12, order: 2 }} md={{ span: 9, order: 1 }}>
                        {/* Dati ordine */}
                        <Row>
                            <div class="d-flex justify-content-between px-3">
                                <span className="fs-5">Ordinato il {moment(order.creationDate).format("DD/MM/YYYY")} alle {moment(order.creationDate).format("HH:MM")}</span>
                                <span className="fs-5 m-0">{centToPrice(order.total)}€</span>
                            </div>
                        </Row>
                        {/* Prodotti */}
                        <Row>
                            <ul className={`list-group p-0 ${css["list-product"]}`}>
                                { 
                                    order.products.map((product) => (
                                        <li key={product.barcode} className={`list-group-item ${css["listitem-product"]}`}>
                                            <ProductEntry product={product} />
                                        </li>
                                    ))
                                }
                            </ul>
                        </Row>
                    </Col>

                    {/* Operazioni */}
                    <Col xs={{ span: 12, order: 1 }} md={{ span: 3, order: 2 }}>
                        <OrderStatus status={order.status} type={order.pickup ? "takeway" : "delivery"} />
                        
                        <div className="d-flex justify-content-center">
                            <div>
                                { this.renderOperations(order.status, order.pickup ? "takeway" : "delivery") }
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        );
    }

    renderOperations(order_status, order_type) {
        switch (order_status) {
            case "pending":
                return (<div className="d-grid">
                    <button className="btn btn-outline-primary mt-2 text-truncate">Continua il pagamento</button>
                    <button className="btn btn-outline-primary mt-2 text-truncate">Contin</button>
                    <button className="btn btn-outline-primary mt-2 text-truncate">dassaddsaassdsaddsadsadsaaasdsdasdaasdsad</button>
                </div>);
            case "created":  
            case "processed":
            case "ready":    
            case "delivered":
            case "cancelled":
        }
    }
}

export default OrderRow;