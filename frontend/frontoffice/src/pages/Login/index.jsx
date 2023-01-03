import React from "react";
import { Helmet } from "react-helmet";
import "../../scss/bootstrap.scss";
import css from "./login.module.css";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from 'react-bootstrap/Button';
import TextInput from "../../components/form/TextInput";
import Form from 'react-bootstrap/Form';
import { login, isAuthenticated } from "modules/auth"
import $ from "jquery"
import SearchParamsHook from "../../hooks/SearchParams";

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error_message: "",
            animal_image_path: "",
            animal_fact: "",
        };

        this.input = {
            username: React.createRef(),
            password: React.createRef(),
            remember_me: React.createRef()
        }

        this.loginHandler = this.loginHandler.bind(this);
    }
    
    componentDidMount() {
        if (!this.imageLoaded) {
            this.getSideScreenData().then( (data) => this.setState({animal_image_path: data.image, animal_fact: data.fact}) );
            this.imageLoaded = true;
        }
    }

    render() {
        isAuthenticated().then((is_auth) => { if (is_auth) { window.location.href = "/"; } });

        return (<>
            <Helmet>
                <title>Login</title>
            </Helmet>
            
            <Container fluid>
                <Row className="min-vh-100">
                    <Col xs="12" lg="5" className="min-vh-100">
                        <div className="d-flex justify-content-center align-items-center h-100 w-100">
                            <div className="w-50">
                                <h1 className="text-center mb-4">Animal House</h1>
                                <p className="invalid-feedback d-block text-center" aria-live="assertive">{this.state.error_message}</p>
                                <form onSubmit={this.loginHandler}>
                                    <div className="mb-3">
                                        <TextInput ref={this.input.username} name="username" type="text" label="Username" required />
                                    </div>
                                    <div className="mb-4">
                                        <TextInput ref={this.input.password} name="password" type="password" label="Password" required />
                                    </div>
                                    <div className="mb-2 d-flex justify-content-center">
                                        <Form.Check ref={this.input.remember_me} type="checkbox" id="data-rememeberme" label="Resta connesso" />
                                    </div>
                                    <div className="d-flex justify-content-center">
                                        <Button type="submit">Accedi</Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </Col>
                    <Col lg="7" className="d-none d-lg-block min-vh-100 p-0" style={{backgroundColor: "lightgray"}}>
                        <div className="d-flex justify-content-center align-items-center overflow-hidden w-100 h-100">
                            <div className="position-relative w-100 h-100">
                                {/* Per gestire lo sfondo sfocato */}
                                <div className={`${css["background-image"]} ${css["blur"]} position-absolute top-0 start-0 w-100 h-100`} style={{backgroundImage: `url("${this.state.animal_image_path}")`, zIndex: "0"}}></div>
                                
                                {/* Per contenere il fact */}
                                <div className="position-absolute top-0 start-0 w-100 h-100">
                                    <div className={`d-flex justify-content-center align-items-end w-100 h-100`} style={{zIndex: "1"}}>
                                        <div className={`mb-5 ${css["fact-container"]} w-75`} style={{display: this.state.animal_fact ? "block" : "none"}}>
                                            <p className="text-center m-0" style={{zIndex: "1"}}>{this.state.animal_fact}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Immagine da visualizzare */}
                                <div className={`d-flex justify-content-center align-items-center w-100 h-100`} style={{zIndex: "1"}}>
                                    <div className="position-relative">
                                        <div className={`d-flex justify-content-center align-items-center ${css["image-container"]}`}>
                                            <img src={this.state.animal_image_path} alt="" className={`w-100 h-100 ${css["no-blur"]}`} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </>);
    }

    async loginHandler(e) {
        e.preventDefault();

        const username = this.input.username.current.value();
        const password = this.input.password.current.value();
        const remember_me = this.input.remember_me.current.checked;

        if (await login(username, password, remember_me)) {
            const return_url = this.props.searchParams.get("return") ? this.props.searchParams.get("return") : "/"; // Gestisce l'indirizzo a cui tornare
            window.location.href = return_url;
        }
        else {
            this.setState({ error_message: "Credenziali errate" });
        }
    }

    async getSideScreenData() {
        let image_path = "", fact = "";

        for (let i=0; i<3; i++) { // Ritenta in caso di fallimento
            try {
                // Estrazione immagine
                const image_res = await $.ajax({ method: "GET", url: `${process.env.REACT_APP_DOMAIN}/games/animals/images/` });
                image_path = image_res.image;
    
                // Estrazione fatto sull'animale
                const fact_res = await $.ajax({ method: "GET", url: `${process.env.REACT_APP_DOMAIN}/games/animals/facts/`, data: { animal: image_res.animal } }).catch((err) => {});
                fact = fact_res.fact;

                break; // Interrompe il loop in caso di successo
            } catch (err) {
                image_path = "";
                fact = "";
            }
        }

        return {
            image: image_path,
            fact: fact
        }
    }
}

export default SearchParamsHook(Login);