import React from "react";
import { Helmet } from "react-helmet";
import "./login.css";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from 'react-bootstrap/Button';
import TextInput from "../../components/form/TextInput";
import Form from 'react-bootstrap/Form';
import { login, isAuthenticated } from "../../import/auth.js"

export default class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error_message: ""
        };

        this.input = {
            username: React.createRef(),
            password: React.createRef(),
            remember_me: React.createRef()
        }

        this.loginHandler = this.loginHandler.bind(this);
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
                    <Col lg="7" className="d-none d-lg-block min-vh-100" style={{backgroundColor: "lightgray"}}>
                        <div className="d-flex justify-content-center align-items-center w-100 h-100">
                            <img src={`${process.env.REACT_APP_DOMAIN}/logos/logo.png`} alt="" />
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
}
