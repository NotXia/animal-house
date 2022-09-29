import React from "react";
import { Helmet } from "react-helmet";
import css from "./login.module.css";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from 'react-bootstrap/Button';
import TextInput from "../../components/form/TextInput";
import Form from 'react-bootstrap/Form';
import { login, isAuthenticated } from "../../import/auth.js"
import $ from "jquery"

export default class Login extends React.Component {
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
        this.loadAnimal();
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
                                <div className={`${css["background-image"]} ${css["blur"]} position-absolute top-0 start-0 w-100 h-100`} style={{backgroundImage: `url("${this.state.animal_image_path}")`, zIndex: "0"}}></div>
                                <div className="position-absolute top-0 start-0 w-100 h-100">
                                    <div className={`d-flex justify-content-center align-items-end w-100 h-100`} style={{zIndex: "1"}}>
                                        <div className={`mb-5 ${css["fact-container"]} w-75`} style={{display: this.state.animal_fact ? "block" : "none"}}>
                                            <p className="text-center m-0" style={{zIndex: "1"}}>{this.state.animal_fact}</p>
                                        </div>
                                    </div>
                                </div>
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
            window.location.href = "/";
        }
        else {
            this.setState({ error_message: "Credenziali errate" });
        }
    }

    async loadAnimal() {
        const apis = [
            { url: "https://dog.ceo/api/breeds/image/random", getURL: (res) => res.message },
            { url: "https://cataas.com/cat?json=true", getURL: (res) => `https://cataas.com${res.url}`, fact_url: "https://meowfacts.herokuapp.com", getFact: (res) => res.data[0] },
            { url: "https://randomfox.ca/floof/", getURL: (res) => res.image },
            { url: "https://aws.random.cat/meow", getURL: (res) => res.file },
            { url: "https://api.bunnies.io/v2/loop/random/?media=png", getURL: (res) => res.media.poster },
            { url: "https://nekos.life/api/v2/img/lizard", getURL: (res) => res.url },
            { url: "http://shibe.online/api/shibes", getURL: (res) => res[0] },
            { url: "https://some-random-api.ml/img/koala", getURL: (res) => res.link },
            { url: "https://some-random-api.ml/img/panda", getURL: (res) => res.link },
            { url: "https://some-random-api.ml/img/birb", getURL: (res) => res.link }
        ]
        let api = apis[Math.floor(Math.random()*apis.length)];
        let image_path = "", fact = "";

        const res = await $.ajax({ method: "GET", url: api.url });
        image_path = api.getURL(res);

        if (api.fact_url) {
           const res = await $.ajax({ method: "GET", url: api.fact_url });
           fact = api.getFact(res);
        }

        this.setState({ animal_image_path: image_path, animal_fact: fact });
    }
}
