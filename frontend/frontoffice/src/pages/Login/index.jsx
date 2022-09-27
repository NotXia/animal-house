import React from "react";
import { Helmet } from "react-helmet";
import "./login.css";
import $ from "jquery";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from 'react-bootstrap/Button';
import TextInput from "../../components/form/TextInput";

export default class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error_message: ""
        };

        this.input = {
            username: React.createRef(),
            password: React.createRef(),
        }
    }

    render() {
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
                                <form action="">
                                    <div className="mb-3">
                                        <TextInput ref={this.input.username} name="username" type="text" label="Username" required />
                                    </div>
                                    <div className="mb-3">
                                        <TextInput ref={this.input.password} name="password" type="password" label="Password" required />
                                    </div>
                                    <div className="d-flex justify-content-center">
                                        <Button>Accedi</Button>
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
}
