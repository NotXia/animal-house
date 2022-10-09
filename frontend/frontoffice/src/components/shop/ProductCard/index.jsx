/**
 * 
 * Visualizza i dati di un prodotto in una card
 * Proprietà:
 *  - product      Prodotto da rappresentare
 *  - selected     Se la card è selezionata
 * 
 * Listener
 *  - onClick
 *  - onMouseEnter
 * 
 */

import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

export default class ProductCard extends React.Component {
    constructor(props) {
        super(props);

        this.product = props.product;
        this.selected = props.selected;
    }
    
    render() {
        let image = this.product.images.length > 0 ? this.product.images[0].path : "/shop/images/default.png";
        let active_class = this.props.selected ? "active" : "";

        return (<>
            <Col xs="6" md="4" lg="3" className="px-1 pb-1">
                <button className={`btn btn-outline-secondary ${active_class} w-100 h-100`} onClick={this.props.onClick} onMouseEnter={this.props.onMouseEnter}
                        aria-label={`Seleziona la variante ${this.product.name}`} aria-selected={this.props.selected}>
                    <Container fluid>
                        <Row>
                            <div className="text-truncate">
                                <p className="my-0 text-truncate">{ this.product.name }</p>
                            </div>
                        </Row>
                        {/* <Row className="d-flex justify-content-center align-items-center">
                            <div style={{height: "5rem", width: "100%"}}>
                                <img src={`${process.env.REACT_APP_DOMAIN}${image}`} alt="" style={{maxHeight: "100%", maxWidth: "100%"}} />
                            </div>
                        </Row> */}
                    </Container>
                </button>
            </Col>
        </>);
    }
}

