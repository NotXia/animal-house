import React from "react";
import { Helmet } from "react-helmet";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Navbar from "../../../components/Navbar";
import { isAuthenticated } from "../../../import/auth.js"
import OrderAPI from "../../../import/api/order.js"
import OrderRow from "./components/OrderRow"
import Footer from "../../../components/Footer";

const PAGE_SIZE = 10;
const AH_OPENING_YEAR = 2015;

class OrdersPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            orders: [],
            selected_year: new Date().getFullYear(),

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
                        <p className="text-center fs-5 invalid-feedback d-block m-0">{ this.state.error_message }</p>
                    </Row>
                    <Row>
                        <h1>Ordini effettuati</h1>
                    </Row>

                    <section aria-label="Selettore anno ordine">
                        <Row className="my-2 mb-4">
                            <Col xs="12" md="4" lg="2">
                                <label htmlFor="select-order-year">Ordini dell'anno</label>
                                <select id="select-order-year" className="form-select" defaultValue={new Date().getFullYear()} onChange={(e) => { this.fetchOrdersOfYear(e.target.value) }}>
                                    <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                                    {
                                    (() => {
                                        let years = [];
                                        const curr_year = new Date().getFullYear();

                                        for (let year=curr_year-1; year>=AH_OPENING_YEAR; year--) {
                                            years.push(<option key={year} value={year}>{year}</option>);
                                        }

                                        return years;
                                    })()
                                    }
                                </select>
                            </Col>
                        </Row>
                    </section>
                    
                    <section aria-label="Lista degli ordini">
                    {
                        this.state.orders.map((order) => (
                            <Row key={order.id} className="mb-3">
                                <OrderRow order={order} />
                            </Row>
                        ))
                    }
                    </section>
                    
                    <Row className={this.state.fetching ? "d-block" : "d-none"}>
                        <div className="d-flex justify-content-center mb-4">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Caricamento degli ordini successivi</span>
                            </div>
                        </div>
                    </Row>

                    <Row className={!this.state.fetching && this.state.orders.length === 0 ? "d-block" : "d-none"}>
                        <div className="d-flex justify-content-center mb-4">
                            <p className="fs-4">Non hai fatto ordini nel {this.state.selected_year}</p>
                        </div>
                    </Row>
                </Container>
            </main>

            <Footer />
        </>);
    }

    async fetchOrdersOfYear(year) {
        if (year === this.state.selected_year) { return; }

        this.setState({ 
            orders: [], 
            curr_page: -1, 
            pagination_end: false,
            selected_year: year
        }, this.fetchOrders);
    }

    async fetchOrders() {
        if (this.state.pagination_end) { return; } // Evita richieste vuote

        try {
            this.setState({ fetching: true });
            
            const orders = await OrderAPI.getMyOrdersOfYear(PAGE_SIZE, this.state.curr_page+1, this.state.selected_year);
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