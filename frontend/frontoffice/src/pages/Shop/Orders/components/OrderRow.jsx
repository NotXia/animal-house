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
import { Link } from "react-router-dom";
import OrderAPI from "../../../../import/api/order.js"
import HubAPI from "../../../../import/api/hub.js"


class OrderRow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            order: this.props.order,
            hub_data: null,
            
            error_message: ""
        };
    }

    componentDidMount() {
    }

    render() {
        const order = this.state.order;

        return (
            <Container className={`${css["container-order"]} p-2 p-lg-3`}>
                <Row>
                    <Col xs={{ span: 12, order: 2 }} md={{ span: 9, order: 1 }}>
                        {/* Dati ordine */}
                        <Row>
                            <div className="d-flex justify-content-between px-3">
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
                    <Col xs={{ span: 12, order: 1 }} md={{ span: 3, order: 2 }} className="mb-3 mb-md-0">
                        <div className="text-center w-100">
                            <OrderStatus status={order.status} type={order.pickup ? "takeway" : "delivery"} />
                        </div>
                        
                        <div>
                            { this.renderOperations(order.status, order.pickup ? "takeway" : "delivery") }
                        </div>
                    </Col>
                </Row>
            </Container>
        );
    }

    renderOperations(order_status, order_type) {
        switch (order_status) {
            case "pending":
                return (
                    <div className="d-flex justify-content-center">
                        <div className="d-grid">
                            <Link to={`/shop/checkout?order_id=${this.state.order.id}`}><button className="btn btn-outline-primary mt-2 text-truncate">Continua con il pagamento</button></Link>
                            <button className="btn btn-outline-danger btn-sm mt-2 text-truncate" onClick={() => { this.deleteOrder(); }}>Cancella ordine</button>
                        </div>
                    </div>
                );
            case "created":  
                return (
                    <div>
                        <p className="m-0">Abbiamo ricevuto il tuo ordine e verrà presto processato.</p>
                        <div className="d-flex justify-content-center"><button className="btn btn-outline-danger btn-sm mt-2 text-truncate" onClick={() => { this.deleteOrder(); }}>Cancella ordine</button></div>
                    </div>
                );
            case "processed":
                return (
                    <div>
                        <p className="m-0">L'ordine è in transito e arriverà presto a destinazione.</p>
                    </div>
                );
            case "ready":
                if (order_type === "delivery") {
                    return (
                        <div>
                            <p className="m-0">L'ordine è in arrivo all'indirizzo:</p>
                            <p className="m-0">{this.state.order.address.street} {this.state.order.address.number} ({this.state.order.address.postal_code})</p>
                        </div>
                    );
                }
                else {
                    if (!this.state.hub_data) { this.loadHubData(this.state.order.hub_code); }
                    return (
                        <div>
                            <p className="m-0">L'ordine è pronto al ritiro</p>
                            <p className="m-0">{this.state.hub_data?.name} - {this.state.hub_data?.address.street} {this.state.hub_data?.address.number}</p>
                        </div>
                    );
                }
            case "delivered":
                return (
                    <div>
                        <p className="m-0">{ order_type === "delivery" ? "L'ordine è stato consegnato all'indirizzo indicato." : "L'ordine è stato ritirato."}</p>
                    </div>
                );
            case "cancelled":
                return (
                    <div>
                        <p className="m-0">L'ordine è stato correttamente cancellato.</p>
                    </div>
                );
        }
    }

    async deleteOrder() {
        try {
            await OrderAPI.deleteOrder(this.state.order.id);

            const deleted_order = this.state.order;
            deleted_order.status = "cancelled";

            this.setState({ order: deleted_order });
        }
        catch (err) {
            console.log(err)
            this.setState({ error_message: "Non è stato possibile cancellare l'ordine" });
        }
    }

    async loadHubData(code) {
        try {
            const hub_data = await HubAPI.getByCode(code);
            this.setState({ hub_data: hub_data });
        }
        catch (err) { }
    }
}

export default OrderRow;