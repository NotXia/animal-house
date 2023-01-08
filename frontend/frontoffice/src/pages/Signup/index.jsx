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


class Signup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            password_confirmed: true,
            error_message: ""
        };

        this.input = {
            name: React.createRef(),
            surname: React.createRef(),
            username: React.createRef(),
            password: React.createRef(),
            email: React.createRef(),
            phone: React.createRef(),
            gender: React.createRef(),
            "address.city": React.createRef(),
            "address.street": React.createRef(),
            "address.number": React.createRef(),
            "address.postal_code": React.createRef(),
        }
        
        this.getUserData = this.getUserData.bind(this);
        this.validateForm = this.validateForm.bind(this);
        this.createUser = this.createUser.bind(this);
    }


    render() {
        return (<>
            <Helmet>
                <title>Registrazione</title>
            </Helmet>

            <Navbar />
            
            <main className="d-flex justify-content-center align-items-center w-100 min-vh-100">
                <Container className="my-4">
                    <Row>
                        <Col xs="12" lg={{span: 6, offset: 3}}>
                            <div className={css["form-card"]}>
                                <form onSubmit={this.createUser}>
                                    <Container>
                                    <Row>
                                        <div className="d-flex justify-content-center">
                                            <img src={`${process.env.REACT_APP_DOMAIN}/logos/logo.png`} alt="" style={{ height: "4rem" }} />
                                        </div>
                                        <Col lg="12"><h1 className="text-center fs-3">Entra in Animal House</h1></Col>
                                        <Col lg="12"><p className="text-center fs-4 mb-1">Crea il tuo account</p></Col>
                                    </Row>

                                    <Row>
                                        <Col lg="12"><p className="invalid-feedback d-block text-center fs-6 mt-0">{this.state.error_message}</p></Col>
                                    </Row>

                                    <section aria-label="Dati anagrafici">
                                        <Row className="mt-2">
                                            <Col lg="6"><TextInput ref={this.input.name} id="data-name" type="text" name="name" label="Nome" validation={UserValidation.name} required/></Col>
                                            <Col lg="6"><TextInput ref={this.input.surname} id="data-surname" type="text" name="surname" label="Cognome" validation={UserValidation.surname} required/></Col>
                                        </Row>

                                        <Row>
                                            <Col lg="12"><TextInput ref={this.input.username} id="data-username" type="text" name="username" label="Username" validation={UserValidation.username} required/></Col>
                                        </Row>

                                        <Row>
                                            <Col lg="12">
                                                <GroupInput ref={this.input.gender} label="Genere" name="gender" type="radio" inline required
                                                            fields={[ {label: "Maschio", value: "M"}, {label: "Femmina", value: "F"}, {label: "Non binario", value: "Non-binary"}, {label: "Altro", value: "Altro"} ]} />
                                            </Col>
                                        </Row>
                                    </section>

                                    <section aria-label="Password">
                                        <Row className="mt-4">
                                            <Col lg="12"><TextInput ref={this.input.password} id="data-password" type="password" name="password" label="Password" validation={UserValidation.password} required/></Col>
                                            
                                            <Col lg="12">
                                                <div className="form-floating w-100">
                                                    <input id="data-password-confirm" className="form-control" type="password" placeholder=" " onChange={(e) => this.checkConfirmPassword(e)} required />
                                                    <label htmlFor="data-password-confirm" aria-hidden="true">Conferma password</label>
                                                </div>
                                                <div className={`${this.state.password_confirmed ? "d-none" : ""} invalid-feedback d-block ms-1`}>Le password non coincidono</div>
                                            </Col>
                                        </Row>
                                    </section>

                                    <section aria-label="Recapiti">
                                        <Row className="mt-4">
                                            <Col lg="12"><TextInput ref={this.input.email} id="data-email" type="email" name="email" label="Email" validation={UserValidation.email} required/></Col>
                                        </Row>
                                        <Row>
                                            <Col lg="12"><TextInput ref={this.input.phone} id="data-phone" type="phone" name="phone" label="Telefono" validation={UserValidation.phone} required/></Col>
                                        </Row>

                                        <Row>
                                            <Col xs="8" lg="6"> <TextInput ref={this.input["address.street"]} id="data-street" type="text" name="street" label="Via" validation={UserValidation.street} required/> </Col>
                                            <Col xs="4" lg="6"> <TextInput ref={this.input["address.number"]} id="data-number" type="text" name="number" label="Civico" validation={UserValidation.number} required/> </Col>
                                        </Row>
                                        <Row>
                                            <Col xs="6" lg="6"> <TextInput ref={this.input["address.city"]} id="data-city" type="text" name="city" label="Città" validation={UserValidation.city} required/> </Col>
                                            <Col xs="6" lg="6"> <TextInput ref={this.input["address.postal_code"]} id="data-postal_code" type="text" name="postal_code" label="CAP" validation={UserValidation.postal_code} required/> </Col>
                                        </Row>
                                    </section>

                                    <Row className="mt-4">
                                        <Col lg="12">
                                            <div className="d-flex justify-content-center">
                                                <Button type="submit" variant="primary">Registrati</Button>
                                            </div>
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

    getUserData() {
        return {
            username: this.input.username.current.value(),
            password: this.input.password.current.value(),
            email: this.input.email.current.value(),
            name: this.input.name.current.value(),
            surname: this.input.surname.current.value(),
            gender: this.input.gender.current.value(),
            phone: this.input.phone.current.value(),
            address: {
                city: this.input["address.city"].current.value(),
                street: this.input["address.street"].current.value(),
                number: this.input["address.number"].current.value(),
                postal_code: this.input["address.postal_code"].current.value()
            }
        }
    }

    async validateForm() {
        let valid = true;

        for (const input of Object.values(this.input)) {
            valid = valid & (await input.current.validate());
        }

        return valid && this.state.password_confirmed;
    }

    async createUser(e) {
        e.preventDefault();

        if (!(await this.validateForm())) { return; }

        const user_data = this.getUserData();
        try {
            await $.ajax({
                method: "POST", url: `${process.env.REACT_APP_DOMAIN}/users/customers/`,
                data: user_data
            });

            window.location.href = "/fo/signup/success";
        }
        catch (err) {
            switch (err.status) {
                case 400: for (const error of err.responseJSON) { this.input[error.field].current.writeError(error.message); } break;
                case 409: this.input[err.responseJSON.field].current.writeError(err.responseJSON.message); break;
                default: this.setState({ error_message: "Si è verificato un errore" }); break;
            }
        }
    }

    checkConfirmPassword(e) {
        this.setState({ 
            password_confirmed: this.input.password.current.value() === e.target.value 
        });
    }
}

export default Signup;