/**
 * 
 * Visualizza i dati di un item in una card
 * Proprietà:
 *  - item      Item da rappresentare
 * 
 */

import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import css from "./card.module.css"
import {centToPrice} from "../../../utilities/currency"
import { Link } from "react-router-dom";

export default class ItemCard extends React.Component {
    constructor(props) {
        super(props);

        this.all_products = props.item.products;
        this.available_products = props.item.products.filter((product) => product.quantity > 0);
        this.available = this.available_products.length > 0;
    }
    
    render() {
        let unavailable_class = this.available ? "" : css["card-text-unavailable"];
        let unavailable_text = this.available ? "" : "Non disponibile";
        let price_text = this.getItemPriceString();

        return (<>
            <Link to={`/shop/item?id=${this.props.item.id}`} className={`${css["card-link"]}`} aria-label={`${this.props.item.name}, ${price_text} ${unavailable_text}`}>
                <div className={`${css["card-container"]}`}>
                    <Container>
                        <Row>
                            <div className={`d-flex justify-content-center align-items-center ${css["card-image-container"]}`}>
                                <img src={this.getItemImagePath()} alt="" className={`${css["card-image"]}`}/>
                            </div>
                        </Row>
                        <Row className="mt-2">
                            <p className={`text-center fs-4 m-0 ${unavailable_class}`}>{this.props.item.name}</p>
                            <p className={`fw-semibold text-center fs-6 m-0 text-decoration-underline`}>{unavailable_text}</p>
                            <p className={`fw-semibold text-center fs-5 m-0 ${unavailable_class}`}>{price_text}</p>
                        </Row>
                    </Container>
                </div>
            </Link>
        </>);
    }

    getItemImagePath() {
        /**
         * L'immagine visualizzata è la prima del primo prodotto.
         * - Se ci sono prodotti non disponibili, vengono ignorati nel calcolo.
         * - Se tutti i prodotti sono finiti, si considerano tutti.
         */
        let ref_product = this.available ? this.available_products[0] : this.all_products[0];

        if (ref_product.images.length > 0) { return `${process.env.REACT_APP_DOMAIN}${ref_product.images[0].path}`; }
        else                               { return `${process.env.REACT_APP_DOMAIN}/shop/images/default.png`; }
    }

    getItemPriceString() {
        /**
         * Il prezzo rappresentante è quello del prodotto di minor costo.
         * - Se ci sono prodotti non disponibili, vengono ignorati nel calcolo.
         * - Se tutti i prodotti sono finiti, restituisce stringa vuota.
         */
        if (!this.available) { return ""; }

        let min_cost_product = this.available_products.reduce((prev, curr) => prev.price < curr.price ? prev : curr); // Estrae il prodotto di costo minore
        const price = centToPrice(min_cost_product.price);

        return this.available_products.length > 1 ? `A partire da ${price}€` : `${price}€`;
    }
}

