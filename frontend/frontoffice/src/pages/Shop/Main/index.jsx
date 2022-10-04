import React from "react";
import { Helmet } from "react-helmet";
import $ from "jquery";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Navbar from "../../../components/Navbar";
import ItemCard from "../../../components/shop/ItemCard";
import Form from "react-bootstrap/Form";
import Collapse from "react-bootstrap/Collapse";
import category_css from "./category.module.css";

let __initialized = false;
const PAGE_SIZE = 24;

class ShopMain extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            shop_categories: [],
            shop_items: [],

            filter_name: undefined,
            filter_category: undefined,
            price_asc: false, price_desc: false, name_asc: false, name_desc: false,

            curr_page_index: -1,
            pagination_end: false,
            item_fetching: false,

            category_collapse_open: false,
            sort_collapse_open: false,

        };

        this.items_fetch_request = null;

        this.scrollItemUpdate = this.scrollItemUpdate.bind(this);
    }

    componentDidMount() {
        if (!__initialized) {
            // Inizializzazione categorie
            $.ajax({ method: "GET", url: `${process.env.REACT_APP_DOMAIN}/shop/categories/` }).then( (categories) => this.setState({ shop_categories: categories }) );
            
            this.updateDisplayedItems();

            // Per rilevare il l'altezza dello scroll
            window.addEventListener('scroll', this.scrollItemUpdate);

            __initialized = true;
        }
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
                        <Col xs="12" md="4" lg="2">
                            
                            {/* Regola di ordinamento */}
                            <div id="#collapse-sort">
                                <label htmlFor="select-sort" className="form-label fs-5 mb-0 mb-md-1">Ordina per</label>
                                <Form.Select id="select-sort" defaultValue="relevance" onChange={(e) => this.changeOrderRule(e.target.value)} aria-label="Regola di ordinamento dei prodotti" >
                                    <option value="relevance">Rilevanza</option>
                                    <option value="name_asc">Nome</option>
                                    <option value="price_asc">Prezzo crescente</option>
                                    <option value="price_desc">Prezzo decrescente</option>
                                </Form.Select>
                            </div>

                            {/* Selettore categoria */}
                            <div className="mt-2 mt-md-3">
                                <Button variant="secondary" className="d-md-none w-100" 
                                        onClick={() => this.setState({category_collapse_open: !this.state.category_collapse_open })} 
                                        aria-controls="collapse-category" aria-expanded={this.state.category_collapse_open}>
                                    Filtra categoria{ this.state.filter_category ? `: ${this.state.filter_category}` : "" }
                                </Button>
                                <Collapse in={this.state.category_collapse_open}>
                                    <div id="#collapse-category" className="d-md-block">
                                        <fieldset>
                                            <legend className="fs-5 d-none d-md-block" aria-label="Filtra per categoria">Categoria</legend>
                                            <div> <span className="visually-hidden">{this.state.filter_category ? `Attualmente stai guardando la categoria ${this.state.filter_category}` : `Attualmente non stai filtrando per categoria`}</span> </div>
                                            <ul className="nav nav-pills">
                                                {
                                                    this.state.shop_categories.map((category, index) => {
                                                        const active = this.state.filter_category == category.name;
                                                        const active_class = active ? "active" : "";

                                                        return (
                                                            <li className="nav-item w-100 mb-1 mb-md-3" key={category.name}>
                                                                <button className={`${category_css["btn-category"]} w-100 ${active_class}`} type="button" aria-selected={active}
                                                                        onClick={() => this.filterCategory(category.name)}>
                                                                    <div className="d-flex justify-content-start align-items-center">
                                                                        <img src={`data:image/*;base64,${category.icon}`} alt="" className="ah-icon" />
                                                                        <span className="text-truncate">{category.name}</span>
                                                                    </div>
                                                                </button>
                                                            </li>
                                                        );
                                                    })
                                                }
                                            </ul>
                                        </fieldset>
                                    </div>
                                </Collapse>
                            </div>
                        </Col>

                        <Col xs="12" md="8" lg="10">
                            {/* Barra di ricerca */}
                            <Row className="mb-3 mt-4 mt-md-0">
                                <Col xs={{span: 10, offset: 1}} md={{span: 8, offset: 2}} lg={{span: 6, offset: 3}}>
                                    <form onSubmit={(e) => this.handleNameSearch(e)}>
                                        <div className="d-flex justify-content-center w-100">
                                            <input id="input-search-name" name="item_name" type="text" className="form-control" placeholder="Cerca prodotto" role="search" />
                                            <button className="btn btn-link" type="submit">
                                                <img src={`${process.env.REACT_APP_DOMAIN}/img/icons/search.png`} alt="Cerca" style={{height: "1.5rem"}} />
                                            </button>
                                        </div>
                                    </form>
                                </Col>
                            </Row>

                            {/* Item */}
                            <Row>
                                { this.renderItems() }
                            </Row>

                            <Row>
                                {
                                    (() => {
                                        if (this.state.item_fetching) {
                                            return (<>
                                                <div className="d-flex justify-content-center w-100 my-5">
                                                    <div className="spinner-border" role="status">
                                                        <span className="visually-hidden">Caricando la prossima pagina di prodotti</span>
                                                    </div>
                                                </div>
                                            </>);
                                        }
                                        return (<></>);
                                    })()
                                }
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
                    <Col xs="12" md="6" lg="3" key={item.id} className="my-2">
                        <section className="h-100">
                            <ItemCard item={item}/>
                        </section>
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

        this.setState({ filter_category: filter_category, category_collapse_open: false }, this.updateDisplayedItems);
    }

    changeOrderRule(order_method) {
        let order = { price_asc: false, price_desc: false, name_asc: false, name_desc: false }
        order[order_method] = true;

        this.setState(order, this.updateDisplayedItems);
    }

    async updateDisplayedItems() {
        if (!this.state.pagination_end) {
            this.setState({ item_fetching: true });

            const items = await $.ajax({ 
                method: "GET", url: `${process.env.REACT_APP_DOMAIN}/shop/items/`,
                data: { 
                    page_size: PAGE_SIZE, page_number: this.state.curr_page_index+1, 
                    name: this.state.filter_name, 
                    category: this.state.filter_category,
                    price_asc: this.state.price_asc,
                    price_desc: this.state.price_desc,
                    name_asc: this.state.name_asc,
                    name_desc: this.state.name_desc
                }
            });
            
            this.setState({
                shop_items: this.state.shop_items.concat(items), 
                curr_page_index: this.state.curr_page_index + 1,
                pagination_end: items.length < PAGE_SIZE,
                item_fetching: false
            });
        }
    }
    
    async scrollItemUpdate() {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scroll_percentage = winScroll / height;
        
        if (scroll_percentage > 0.7) {
            if (!this.items_fetch_request) { // Per evitare richieste multiple
                this.items_fetch_request = this.updateDisplayedItems();
            }

            await this.items_fetch_request; // Attesa sulla richiesta corrente
            this.items_fetch_request = null;
        }
    }
}

export default ShopMain;