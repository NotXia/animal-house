import React from "react";
import { Helmet } from "react-helmet";
import "../../../scss/bootstrap.scss";
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
import { updateURLQuery, removeQueryFromURL } from "../../../utilities/url";
import SearchParamsHook from "../../../hooks/SearchParams";
import Footer from "../../../components/Footer";
import { api_request, isAuthenticated } from "modules/auth";

const PAGE_SIZE = 24;

class ShopMain extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            shop_categories: [],
            shop_species: [],
            shop_items: [],

            filter_name: undefined,
            filter_category: undefined,
            filter_species: undefined,
            price_asc: false, price_desc: false, name_asc: false, name_desc: false,

            item_fetching: false,

            category_collapse_open: false,
            species_collapse_open: false,
            sort_collapse_open: false,

            is_auth: false,

            error_message: ""
        };

        this.items_fetch_request = null;
        this.pagination_end = false;
        this.curr_page_index = -1;

        this.scrollItemUpdate = this.scrollItemUpdate.bind(this);
    }

    componentDidMount() {
        // Inizializzazione categorie
        $.ajax({ method: "GET", url: `${process.env.REACT_APP_DOMAIN}/shop/categories/` })
        .then( (categories) => this.setState({ shop_categories: categories }) )
        .catch((err) => { this.setState({ error_message: "Si è verificato un errore durante il caricamento della pagina" }) });

        // Inizializzazione specie
        $.ajax({ method: "GET", url: `${process.env.REACT_APP_DOMAIN}/animals/species/` })
        .then( (species) => this.setState({ shop_species: species }) )
        .catch((err) => { this.setState({ error_message: "Si è verificato un errore durante il caricamento della pagina" }) });

        isAuthenticated().then(is_auth => this.setState({ is_auth: is_auth }) );
        
        
        const search_query = this.props.searchParams.get("search"),
              category_query = this.props.searchParams.get("category"),
              species_query = this.props.searchParams.get("species"),
              order_query = this.props.searchParams.get("order");

        if (search_query || category_query || order_query || species_query) {
            let filter = {};
            
            // Composizione del filtro
            if (search_query) {
                filter.filter_name = search_query;
                $("#input-search-name").val(search_query);
            }
            if (category_query) { filter.filter_category = category_query; }
            if (order_query) {filter[order_query] = true; }
            if (species_query) {filter.filter_species = species_query; }

            this.setState(filter, this.updateDisplayedItems);
        }
        else {
            // Ordinamento per rilevanza di default
            this.changeOrderRule("relevance");
        }

        // Per rilevare il l'altezza dello scroll
        window.addEventListener('scroll', this.scrollItemUpdate);
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
                            <nav aria-label="Filtri di ricerca dei prodotti">
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
                                    {/* Collapse su schermi < md e lista di bottoni su schermi >= md */}
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

                                {/* Selettore specie */}
                                <div className="mt-2 mt-md-3">
                                    {/* Collapse su schermi < md e lista di bottoni su schermi >= md */}
                                    <Button variant="secondary" className="d-md-none w-100" 
                                            onClick={() => this.setState({species_collapse_open: !this.state.species_collapse_open })} 
                                            aria-controls="collapse-species" aria-expanded={this.state.species_collapse_open}>
                                        Filtra animale{ this.state.filter_species ? `: ${this.state.filter_species}` : "" }
                                    </Button>
                                    <Collapse in={this.state.species_collapse_open}>
                                        <div id="#collapse-species" className="d-md-block">
                                            <fieldset>
                                                <legend className="fs-5 d-none d-md-block" aria-label="Filtra per specie">Specie</legend>
                                                <div> <span className="visually-hidden">{this.state.filter_species ? `Attualmente stai guardando la specie ${this.state.filter_species}` : `Attualmente non stai filtrando per nessuna specie`}</span> </div>
                                                <ul className="nav nav-pills">
                                                    {
                                                        this.state.shop_species.map((species, index) => {
                                                            const active = this.state.filter_species == species.name;
                                                            const active_class = active ? "active" : "";

                                                            return (
                                                                <li className="nav-item w-100 mb-1 mb-md-3" key={species.name}>
                                                                    <button className={`${category_css["btn-category"]} w-100 ${active_class}`} type="button" aria-selected={active}
                                                                            onClick={() => this.filterSpecies(species.name)}>
                                                                        <div className="d-flex justify-content-start align-items-center">
                                                                            <img src={`data:image/*;base64,${species.logo}`} alt="" className="ah-icon" />
                                                                            <span className="text-truncate">{species.name}</span>
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

                            </nav>
                        </Col>

                        <Col xs="12" md="8" lg="10">
                            {/* Barra di ricerca */}
                            <Row className="mb-3 mt-4 mt-md-0">
                                <Col xs={{span: 10, offset: 1}} md={{span: 8, offset: 2}} lg={{span: 6, offset: 3}}>
                                    <form onSubmit={(e) => this.handleNameSearch(e)} role="search" aria-label="Ricerca di prodotti per nome">
                                        <div className="d-flex justify-content-center w-100">
                                            <input id="input-search-name" name="item_name" type="text" className="form-control" placeholder="Cerca prodotto" />
                                            <button className="btn btn-link" type="submit">
                                                <img src={`${process.env.REACT_APP_DOMAIN}/img/icons/search.png`} alt="Cerca" style={{height: "1.5rem"}} />
                                            </button>
                                        </div>
                                    </form>
                                </Col>

                                {/* Carrello */}
                                <Col xs={{span: 1}} md={{span: 2}} lg={{span: 3}}>
                                    {
                                        this.state.is_auth &&
                                        <div className="d-flex justify-content-end align-items-center">
                                            <a href="/fo/shop/cart" className="btn btn-outline-primary p-1">
                                                <img src={`${process.env.REACT_APP_DOMAIN}/img/icons/cart.png`} alt="Carrello" style={{ height: "1.8rem" }} />
                                            </a>
                                        </div>
                                    }
                                </Col>
                            </Row>
                            
                            {/* Messaggio di errore */}
                            <Row>
                                <p className="text-center fs-5 invalid-feedback d-block">{ this.state.error_message }</p>
                            </Row>


                            {/* Item */}
                            <section aria-label="Lista dei prodotti">
                                <Row>
                                    { this.renderItems() }
                                </Row>
                            </section>

                            {/* Caricamento di item */}
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

            <Footer />
        </>);
    }

    renderItems() {
        // Gestione di ricerche vuote (senza errori)
        if (!this.state.item_fetching && this.state.shop_items.length === 0 && this.state.error_message === "") { 
            return (
                <Col xs="12"><p className="text-center fs-5">Nessun prodotto corrisponde ai criteri di ricerca</p></Col>
            ) ;
        }

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

    // Aggiunge un filtro per nome
    filterName(name) {
        this.resetDisplayedItems();
        this.setState({ filter_name: name === "" ? undefined : name }, this.updateDisplayedItems);
        updateURLQuery("search", name);
    }

    // Aggiunge un filtro per categoria
    filterCategory(category) {
        let filter_category = category;
        if (this.state.filter_category == category) { filter_category = undefined; }
        
        this.resetDisplayedItems();
        this.setState({ filter_category: filter_category, category_collapse_open: false }, this.updateDisplayedItems);
        
        // Aggiornamento url
        if (filter_category) { updateURLQuery("category", filter_category); }
        else { removeQueryFromURL("category"); }
    }

    // Aggiunge un filtro per categoria
    filterSpecies(species) {
        let filter_species = species;
        if (this.state.filter_species == species) { filter_species = undefined; }
        
        this.resetDisplayedItems();
        this.setState({ filter_species: filter_species, category_collapse_open: false }, this.updateDisplayedItems);
        
        // Aggiornamento url
        if (filter_species) { updateURLQuery("species", filter_species); }
        else { removeQueryFromURL("species"); }
    }

    // Cambia l'ordinamento
    changeOrderRule(order_method) {
        let order = { price_asc: false, price_desc: false, name_asc: false, name_desc: false }
        order[order_method] = true;

        this.resetDisplayedItems();
        this.setState(order, this.updateDisplayedItems);
        updateURLQuery("order", order_method);
    }

    // Reset della visualizzazione degli item
    resetDisplayedItems() {
        this.curr_page_index = -1;
        this.pagination_end = false;
        this.setState({ shop_items: [] });
    }

    // Aggiunge agli item visualizzati la pagina successiva a quella corrente (se esiste)
    async updateDisplayedItems() {
        if (!this.pagination_end) {
            this.setState({ item_fetching: true });
            this.curr_page_index += 1;

            try {
                const items = await api_request({ 
                    method: "GET", url: `${process.env.REACT_APP_DOMAIN}/shop/items/`,
                    data: { 
                        page_size: PAGE_SIZE, page_number: this.curr_page_index, 
                        name: this.state.filter_name, 
                        category: this.state.filter_category,
                        price_asc: this.state.price_asc,
                        price_desc: this.state.price_desc,
                        name_asc: this.state.name_asc,
                        name_desc: this.state.name_desc,
                        species: this.state.filter_species
                    }
                });

                this.setState({
                    shop_items: this.state.shop_items.concat(items), 
                    item_fetching: false
                });
                this.pagination_end = items.length < PAGE_SIZE;
            }
            catch (err) {
                this.setState({ error_message: "Si è verificato un errore durante la ricerca" });
                this.setState({ item_fetching: false });
            }
        }
    }
    
    // Gestisce il caricamento degli item in base al livello di scroll
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

export default SearchParamsHook(ShopMain);