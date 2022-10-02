import React from "react";
import { Helmet } from "react-helmet";
import $ from "jquery";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from 'react-bootstrap/Button';
import TextInput from "../../../components/form/TextInput";
import GroupInput from "../../../components/form/GroupInput";
import Navbar from "../../../components/Navbar";
import SearchParamsHook from "../../../hooks/SearchParams";
import { centToPrice } from "../../../utilities/currency"
import ImagesViewer from "../../../components/shop/ImagesViewer";

class ShopItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            item: undefined,
            product_index: 0
        };
        
        let item_id = this.props.searchParams.get("id");
        $.ajax({ method: "GET", url: `${process.env.REACT_APP_DOMAIN}/shop/items/${decodeURIComponent(item_id)}` }).then( (item) => this.setState({ item: item }) )
    }

    render() {
        if (!this.state.item) { return (<></>); }
        return (<>
            <Helmet>
                <title>{this.state.item.name}</title>
            </Helmet>
            
            <Navbar/>

            <main>
                <Container>
                    <Row>
                        <Col xs="12" md="6">
                            <div style={{height: "50rem"}}>
                                <ImagesViewer images={this.currProduct().images}/>
                            </div>
                        </Col>
                        <Col xs="12" md="6">
                            <h1>{this.state.item.name}</h1>
                            <h2>{this.currProduct().name}</h2>
                            <p>{`${centToPrice(this.currProduct().price)}€`}</p>
                            <Button>Aggiungi al carrello</Button>
                            <div>
                                <div dangerouslySetInnerHTML={{__html: this.state.item.description}}></div>
                                <div dangerouslySetInnerHTML={{__html: this.currProduct().description}}></div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </main>
        </>);
    }

    currProduct() {
        return this.state.item.products[this.state.product_index];
    }
}

export default SearchParamsHook(ShopItem);