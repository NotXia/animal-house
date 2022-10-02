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
import ItemCard from "../../../components/shop/ItemCard";
import Form from 'react-bootstrap/Form';

class ShopMain extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            shop_categories: [],
            shop_items: [],
            filter_name: undefined,
            filter_category: undefined,
            price_asc: false, price_desc: false, name_asc: false, name_desc: false
        };
    }

    componentDidMount() {
        // Inizializzazione categorie
        $.ajax({ method: "GET", url: `${process.env.REACT_APP_DOMAIN}/shop/categories/` }).then( (categories) => this.setState({ shop_categories: categories }) );
        
        this.updateDisplayedItems();
    }

    render() {
        return (<>
            <Helmet>
                <title>Shop</title>
            </Helmet>
            
            <Navbar />

            <main className="mt-3">
                <Container>
                    <Row>
                        <Col xs="12" lg="2">
                            <div className="d-flex justify-content-center w-100">
                                <div>
                                    {/* Selettore categoria */}
                                    <fieldset>
                                        <legend className="fs-5">Categoria</legend>
                                        <ul className="nav nav-pills">
                                        {
                                            this.state.shop_categories.map((category, index) => {
                                                const active = this.state.filter_category == category.name;
                                                const active_class = active ? "active" : "";

                                                return (
                                                    <li className="nav-item w-100 mb-3" key={category.name}>
                                                        <button className={`btn btn-outline-primary w-100 ${active_class}`} type="button" role="tab" aria-selected={active} 
                                                                onClick={() => this.filterCategory(category.name)}>
                                                            <span className="text-truncate">{category.name}</span>
                                                        </button>
                                                    </li>
                                                );
                                            })
                                        }
                                        </ul>
                                    </fieldset>

                                    {/* Regola di ordinamento */}
                                    <label htmlFor="select-sort" className="form-label fs-5">Ordina per</label>
                                    <Form.Select id="select-sort" defaultValue="relevance" onChange={(e) => this.changeOrderRule(e.target.value)} aria-label="Regola di ordinamento dei prodotti" >
                                        <option value="relevance">Rilevanza</option>
                                        <option value="name_asc">Nome</option>
                                        <option value="price_asc">Prezzo crescente</option>
                                        <option value="price_desc">Prezzo descrescente</option>
                                    </Form.Select>
                                </div>
                            </div>
                        </Col>

                        <Col xs="12" lg="10">
                            <Row className="mb-3">
                                <Col>
                                    <form onSubmit={(e) => this.handleNameSearch(e)} className="w-100">
                                        <div className="d-flex justify-content-center">
                                            <div className="d-flex w-50">
                                                <input id="input-search-name" name="item_name" type="text" className="form-control" placeholder="Cerca prodotto" role="search" />
                                                <button className="btn btn-link" type="submit">
                                                    <img src={`${process.env.REACT_APP_DOMAIN}/img/icons/search.png`} alt="Cerca" style={{height: "1.5rem"}} />
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </Col>
                            </Row>
                            <Row>
                                { this.renderItems() }
                            </Row>
                        </Col>
                    </Row>
                </Container>
            </main>
        </>);
    }

    renderItems() {
        return (<>
            {
                this.state.shop_items.map((item, index) => (
                    <Col lg="3" key={item.id} className="my-2">
                        <ItemCard item={item}/>
                    </Col>
                ))
            }
        </>)
    }

    handleNameSearch(e) {
        e.preventDefault();
        this.filterName(e.target.item_name.value);
    }


    filterName(name) {
        if (name === "") { name = undefined; }
        this.setState({ filter_name: name }, this.updateDisplayedItems);
    }

    filterCategory(category) {
        let filter_category = category;
        if (this.state.filter_category == category) { filter_category = undefined; }

        this.setState({ filter_category: filter_category }, this.updateDisplayedItems);
    }

    changeOrderRule(order_method) {
        let order = { price_asc: false, price_desc: false, name_asc: false, name_desc: false }
        order[order_method] = true;

        this.setState(order, this.updateDisplayedItems);
    }

    async updateDisplayedItems() {
        const items = await $.ajax({ 
            method: "GET", url: `${process.env.REACT_APP_DOMAIN}/shop/items/`,
            data: { 
                page_size: 25, page_number: 0, 
                name: this.state.filter_name, 
                category: this.state.filter_category,
                price_asc: this.state.price_asc,
                price_desc: this.state.price_desc,
                name_asc: this.state.name_asc,
                name_desc: this.state.name_desc
            }
        });

        this.setState({ shop_items: items });
    }
}

export default ShopMain;