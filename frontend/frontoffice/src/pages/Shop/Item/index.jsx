import React from "react";
import { Helmet } from "react-helmet";
import $ from "jquery";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from 'react-bootstrap/Button';
import NumberInput from "../../../components/form/NumberInput";
import Navbar from "../../../components/Navbar";
import SearchParamsHook from "../../../hooks/SearchParams";
import { centToPrice } from "../../../utilities/currency"
import ImagesViewer from "../../../components/shop/ImagesViewer";
import ProductCard from "../../../components/shop/ProductCard";

let __relevance_increased= false;

class ShopItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            item: undefined,
            product_index: 0,
            fetched: false,

            error_message: ""
        };
        
        let item_id = this.props.searchParams.get("id");
        $.ajax({ method: "GET", url: `${process.env.REACT_APP_DOMAIN}/shop/items/${decodeURIComponent(item_id)}` })
        .then((item) => {
            this.setState({ item: item, fetched: true });

            // Incremento rilevanza
            if (!__relevance_increased) {
                $.ajax({ method: "POST", url: `${process.env.REACT_APP_DOMAIN}/shop/items/${decodeURIComponent(item_id)}/click` });
                __relevance_increased = true;
            }
        })
        .catch((err) => {
            switch (err.status) {
                case 404: this.setState({ error_message: "Non ci sono prodotti da queste parti", fetched: true }); break;
                default: this.setState({ error_message: "Si è verificato un errore", fetched: true }); break;
            }
        });
    }

    render() {
        if (!this.state.fetched) { return (<></>); }

        if (this.state.error_message !== "") {
            return (<>
                <Helmet> <title>Shop</title> </Helmet>
                <Navbar/>

                <Container>
                    <Row>
                        <p className="text-center fs-3 mt-3 invalid-feedback d-block">{this.state.error_message}</p>
                    </Row>
                </Container>
            </>); 
        }

        return (<>
            <Helmet>
                <title>{this.state.item.name}</title>
            </Helmet>
            
            <Navbar/>

            <main className="mt-4">
                <Container>
                    <Row>
                        {/* Immagini */}
                        <Col xs="12" md="5">
                            <div>
                                <ImagesViewer key={`images-viewer-${this.state.product_index}`} images={this.currProduct().images}/>
                            </div>
                        </Col>

                        {/* Dati item */}
                        <Col xs="12" md="7" className="mt-4 mt-md-0">
                            <Row>
                                <Col xs="12" md="8">
                                    <div className="">
                                        <h1 className="fs-1 mb-1">{this.state.item.name}</h1>
                                        <h2 className="fs-2 overflow-hidden">{this.currProduct().name}</h2>
                                        <p className="fs-3 fw-semibold">{`${centToPrice(this.currProduct().price)}€`}</p>
                                    </div>
                                </Col>
                                <Col xs="12" md="4">
                                    <div className="d-flex justify-content-center justify-md-content-end align-items-center h-100">
                                        { this.renderAddToCartButton() }
                                    </div>
                                </Col>
                            </Row>

                            {/* Selettore prodotti */}
                            { this.renderProductSelector() }

                            <div className="mt-4">
                                <div dangerouslySetInnerHTML={{__html: this.state.item.description}}></div>
                                <div dangerouslySetInnerHTML={{__html: this.currProduct().description}}></div>
                            </div>
                        </Col>
                    </Row>

                    <Row className="mt-5">
                    </Row>
                </Container>
            </main>
        </>);
    }

    currProduct() {
        return this.state.item.products[this.state.product_index];
    }

    renderProductSelector() {
        if (this.state.item.products.length === 1) { return (<></>); }

        return (                            
            <Container fluid>
                <Row>
                    <p className="fs-5 p-0 mb-0  mt-2">Variante:</p>
                </Row>
                <Row>
                    {
                        this.state.item.products.map((product, index) => {
                            let selected = this.state.product_index === index;
                            
                            return ( <ProductCard key={product.barcode} product={product} onClick={() => this.setState({ product_index: index })} selected={selected} /> )
                        })
                    }  
                </Row>
            </Container>
        );
    }

    renderAddToCartButton() {
        if (this.currProduct().quantity > 0) {
            return (
                <div>
                    <div className="mb-2">
                        <Button variant="outline-primary" className="w-100">Aggiungi al carrello</Button>
                    </div>
                    <div className="d-flex justify-content-center">
                        <div className="w-75">
                            <NumberInput id="product-quantity" min={1} max={this.currProduct().quantity} defaultValue={1} step={1} label="Quantità" required inline no-controls />
                        </div>
                    </div>
                </div>
            )
        }
        else {
            return (
                <div>
                    <div className="mb-2">
                        <Button variant="outline-primary" className="w-100" disabled>Non disponibile</Button>
                    </div>
                </div>
            )
        }
    }

}

export default SearchParamsHook(ShopItem);