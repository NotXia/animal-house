import React from "react";
import { Helmet } from "react-helmet";
import $ from "jquery";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Navbar from "../../../components/Navbar";
import SearchParamsHook from "../../../hooks/SearchParams";


class OrderSuccess extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };

        const order_id = this.props.searchParams.get("order_id");
        $.ajax({
            method: "POST", url: `${process.env.REACT_APP_DOMAIN}/shop/orders/${encodeURIComponent(order_id)}/success`
        })
    }

    render() {
        return (<>
            <Helmet>
                <title>Ordine creato con successo</title>
            </Helmet>
            
            <Navbar />

            <main className="mt-3">
                <Container>
                    <Row>
                        Ordine creato con successo
                    </Row>
                </Container>
            </main>
        </>);
    }

}

export default SearchParamsHook(OrderSuccess);