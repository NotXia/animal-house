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
import {centToPrice} from "modules/currency"
import { Link } from "react-router-dom";
import { getUserPreferences } from "modules/preferences";
import { Tooltip } from "bootstrap";

export default class ItemCard extends React.Component {
    constructor(props) {
        super(props);

        this.all_products = props.item.products;
        this.available_products = props.item.products.filter((product) => product.quantity > 0);
        this.available = this.available_products.length > 0;
    }

    componentDidMount() {
        [...document.querySelectorAll('[data-bs-toggle="tooltip"]')].map(tooltip => new Tooltip(tooltip));
    }

    render() {
        const reference_product = this.getReferenceProduct();
        const price_element = this.getItemPriceElement();
        const user_interested = this.mayUserBeInterested();

        return (<>
            <Link to={`/shop/item?id=${this.props.item.id}`} className={`${css["card-link"]}`} 
                  aria-label={`${user_interested ? "Potrebbe interessarti:" : ""} ${this.props.item.name}, ${reference_product ? reference_product.price : ""} ${this.available ? "" : "Non disponibile"}`}>
                <div className={`${css["card-container"]} position-relative`}>
                    <Container>
                        <Row>
                            <div className={`d-flex justify-content-center align-items-center ${css["card-image-container"]}`}>
                                <img src={this.getItemImagePath()} alt="" className={`${css["card-image"]}`}/>
                            </div>
                        </Row>
                        <Row className="mt-2">
                            {
                                this.available &&
                                <>
                                    <p className={`text-center fs-4 m-0`}>{this.props.item.name}</p>
                                    <p className={`fw-semibold text-center fs-5 m-0`}>{price_element}</p>
                                    <div className={`position-absolute top-0 end-0 p-0 ${user_interested ? "" : "d-none"}`} aria-hidden="true">
                                        <div className="d-flex justify-content-end m-3">
                                            <div style={{ width: "1.5rem" }}>
                                                <img src={`${process.env.REACT_APP_DOMAIN}/img/icons/star.png`} alt="" style={{ width: "95%" }}
                                                     data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Potrebbe interessarti per i tuoi animali" />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            }
                            {
                                !this.available &&
                                <>
                                    <p className={`text-center fs-4 m-0 ${css["card-text-unavailable"]}`}>{this.props.item.name}</p>
                                    <p className={`fw-semibold text-center fs-6 m-0 text-decoration-underline`}>Non disponibile</p>
                                    <p className={`fw-semibold text-center fs-5 m-0 ${css["card-text-unavailable"]}`}>{price_element}</p>
                                </>
                            }
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

    getReferenceProduct() {
        /**
         * Il rappresentante è il prodotto di minor costo.
         * - Se ci sono prodotti non disponibili, vengono ignorati nel calcolo.
         */
        if (!this.available) { return null; }

        return this.available_products.reduce((prev, curr) => prev.price < curr.price ? prev : curr); // Estrae il prodotto di costo minore
    }

    getItemPriceElement() {
        const reference_product = this.getReferenceProduct();
        if (!reference_product) return null;

        const price = centToPrice(reference_product.price);
        const original_price = centToPrice(reference_product.original_price);

        if (reference_product.price === reference_product.original_price) { // Prodotto non scontato
            return this.available_products.length > 1 ? <span>A partire da {price}€</span> : <span>{price}€</span>
        }
        else {
            if (this.available_products.length > 1) {
                return <span>
                    A partire da <span className="text-decoration-line-through fs-6 m-0 fw-normal">{original_price}€</span> {price}€
                </span>
            }
            else {
                return <div>
                    <p className="text-decoration-line-through fs-6 m-0 fw-normal">{original_price}€</p>
                    {price}€
                </div>
            }
        }
    }

    /**
     * Indica se l'utente potrebbe essere interessato all'item
     */
    mayUserBeInterested() {
        const user_preferences = getUserPreferences();
        if (!user_preferences || !user_preferences.species) { return false; }

        // Cerca se l'item contiene un prodotto con target uno di quelli del cliente
        for (const product of this.props.item.products) {
            if (product.quantity <= 0) { continue; }

            for (const species of product.target_species) {
                if (user_preferences.species.includes(species)) {
                    return true;
                }
            }
        }

        return false;
    }
}

