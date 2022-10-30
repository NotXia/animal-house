/**
 * 
 * Visualizza un prodotto di un ordine
 * 
 * Proprietà:
 * - product        Dati del prodotto
 * 
 */

import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";


class ProductEntry extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const product = this.props.product;

        console.log(product)

        let image_path = `${process.env.REACT_APP_DOMAIN}/shop/images/default.png`;
        if (product.images && product.images[0]) {
            image_path = `${process.env.REACT_APP_DOMAIN}${product.images[0].path}`;
        }

        return (
            <Container>
                <Row>
                    <Col xs="4" md="2">
                        <img src={image_path} alt="" style={{ height: "5rem" }} />
                    </Col>

                    <Col xs="8" md="10">
                        <div className="d-flex align-items-center h-100">
                            <div>
                                <p className="m-0">{product.item_name} ({product.name})</p>
                                <p className="m-0">Quantità: {product.quantity}</p>

                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default ProductEntry;