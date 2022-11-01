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

const PAGE_SIZE = 5;

class OrdersPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            orders: [],

            curr_page: -1,
            pagination_end: false,
            fetching: false,

            error_message: ""
        };

        this.fetch_request = null; // Richiesta di fetch degli ordini attuale

        isAuthenticated().then(is_auth => { if (!is_auth) { window.location = `${process.env.REACT_APP_BASE_PATH}/login?return=${window.location.href}` } } );
    }

    componentDidMount() {
        (async () => {
            this.setState({ fetching: true });
            await this.fetchOrders();
        })();

        window.addEventListener("scroll", () => { this.scrollFetchOrders() });
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
                    
                    <Row className={this.state.fetching ? "d-block" : "d-none"}>
                        <div className="d-flex justify-content-center mb-4">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Caricamento degli ordini successivi</span>
                            </div>
                        </div>
                    </Row>
                </Container>
            </main>
        </>);
    }

    async fetchOrders() {
        if (this.state.pagination_end) { return; } // Evita richieste vuote

        try {
            this.setState({ fetching: true });
            
            const orders = await OrderAPI.getMyOrders(PAGE_SIZE, this.state.curr_page+1);
            this.setState({ 
                orders: this.state.orders.concat(orders), 
                curr_page: this.state.curr_page+1, 
                pagination_end: (orders.length < PAGE_SIZE) 
            });

            this.setState({ fetching: false });
        }
        catch (err) {
            this.setState({ error_message: "Non è stato possibile caricare gli ordini" });
        }
    }

    async scrollFetchOrders() {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scroll_percentage = winScroll / height;
        
        if (scroll_percentage > 0.7) {
            if (!this.fetch_request) { // Per evitare richieste multiple
                this.fetch_request = this.fetchOrders();
            }

            await this.fetch_request; // Attesa sulla richiesta corrente
            this.fetch_request = null;
        }
    }
}

export default OrdersPage;