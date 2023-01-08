import React from "react";
import { Helmet } from "react-helmet";
import "../../scss/bootstrap.scss";
import css from "./signup.module.css";
import $ from "jquery";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from 'react-bootstrap/Button';
import UserValidation from "../../utilities/validation/UserValidation";
import TextInput from "../../components/form/TextInput";
import GroupInput from "../../components/form/GroupInput";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";


class Success extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (<>
            <Helmet>
                <title>Registrazione</title>
            </Helmet>

            <Navbar />
            
            <main className="d-flex justify-content-center align-items-center w-100" style={{ minHeight: "80vh" }}>
                <Container className="my-4">
                    <Row>
                        <Col xs="12" lg={{span: 6, offset: 3}}>
                            <div className={css["form-card"]}>
                                <form>
                                    <Container>
                                        <Row>
                                            <Col lg="12">
                                                <p className="text-center fs-4 mb-0">Account creato correttamente.</p>
                                                <p className="text-center fs-4 mb-1">Ti abbiamo inviato una mail di verifica.</p>
                                            </Col>
                                        </Row>
                                    </Container>
                                </form>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </main>

            <Footer />
        </>);
    }
}

export default Success;