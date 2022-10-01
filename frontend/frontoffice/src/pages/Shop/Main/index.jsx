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

class ShopMain extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            shop_categories: [],
            shop_items: [],
            filter_category: null
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
            
            <Navbar/>

            <main>
                <Container>
                    <Row>
                        <Col xs="12" lg="2">
                            <div className="d-flex justify-content-center w-100">
                                <div>
                                    { this.renderFilter() }
                                </div>
                            </div>
                        </Col>

                        <Col xs="12" lg="10">
                            <Row>
                                { this.renderItems() }
                            </Row>
                        </Col>
                    </Row>
                </Container>
            </main>
        </>);
    }

    renderFilter() {
        return (<>
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
        </>)
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

    filterCategory(category) {
        let filter_category = category;
        if (this.state.filter_category == category) { filter_category = undefined; }

        this.updateDisplayedItems("", filter_category);
    }

    async updateDisplayedItems(text_search, category) {
        const items = await $.ajax({ 
            method: "GET", url: `${process.env.REACT_APP_DOMAIN}/shop/items/`,
            data: { page_size: 25, page_number: 0, category: category}
        });

        this.setState({ shop_items: items, filter_category: category });
    }
}

export default ShopMain;