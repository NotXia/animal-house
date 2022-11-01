import React from "react";
import { Helmet } from "react-helmet";
import $ from "jquery";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Navbar from "../../../components/Navbar";
import { isAuthenticated, getUsername, api_request } from "../../../import/auth.js"
import OrderAPI from "../../../import/api/order.js"
import OrderRow from "./components/OrderRow"


class OrdersPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            orders: [],
            error_message: ""
        };

        isAuthenticated().then(is_auth => { if (!is_auth) { window.location = `${process.env.REACT_APP_BASE_PATH}/login?return=${window.location.href}` } } );
    }

    componentDidMount() {
    (async () => {
        try {
            const orders = await OrderAPI.getMyOrders(20, 0);
            this.setState({ orders: orders });
        }
        catch (err) {
            console.log(err)
            this.setState({ error_message: "Non è stato possibile caricare gli ordini" });
        }
    })()
    }

    render() {
        return (<>
            <Helmet>
                <title>Ordini</title>
            </Helmet>
            
            <Navbar />

            <main className="mt-3">
                <Container>
                    <Row>
                        <h1>Ordini effettuati</h1>
                    </Row>
                    {
                        this.state.orders.map((order) => (
                            <Row key={order.id} className="mb-5">
                                <OrderRow order={order} />
                            </Row>
                        ))
                    }
                </Container>
            </main>
        </>);
    }
}

export default OrdersPage;