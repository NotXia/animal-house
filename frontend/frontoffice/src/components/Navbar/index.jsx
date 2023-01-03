import React from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { isAuthenticated, getUsername } from "modules/auth"
import UserAPI from "modules/api/user";

export default class NavbarComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: null,
            surname: null,
            username: null
        };
    }

    async componentDidMount() {
        if (await isAuthenticated()) {
            const user = await UserAPI.getProfile(await getUsername());

            this.setState({
                name: user.name,
                surname: user.surname,
                username: user.username,
                picture: user.picture ? `${process.env.REACT_APP_DOMAIN}${user.picture}` : `${process.env.REACT_APP_DOMAIN}/profiles/images/default.png`
            });
        }
    }
    
    render() {
        return (<>
            <nav>
                <Navbar expand="lg" style={{ backgroundColor: "#ffa545" }}>
                    <Container fluid>
                        <Navbar.Brand href="/">
                            <div className="d-flex justify-content-center align-items-center">
                                <img src={`${process.env.REACT_APP_DOMAIN}/logos/logo.png`} alt="" style={{height: "2rem"}} />
                            </div>
                        </Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="me-auto">
                                <Nav.Link className="text-dark" href="/">Home</Nav.Link>
                                <Nav.Link className="text-dark" href="/fo/shop">Shop</Nav.Link>
                                <Nav.Link className="text-dark" href="/services-list">Servizi</Nav.Link>
                                <Nav.Link className="text-dark" href="/hubs-list">Sedi</Nav.Link>
                                <Nav.Link className="text-dark" href="/fo/forum">Forum</Nav.Link>
                            </Nav>

                            <div className="justify-content-end">
                            {
                                this.state.username &&
                                <div className="dropdown d-inline-block">
                                    <button className="btn dropdown-toggle text-dark p-0" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        <div className="d-inline-block">
                                            <div className="d-flex align-items-center">
                                                <span className="align-top me-2">{ this.state.name } { this.state.surname }</span>
                                                <div className="d-flex align-items-center justify-content-center border border-dark rounded-circle overflow-hidden" style={{ height: "2.2rem", width: "2.2rem" }}>
                                                    <div className="d-flex justify-content-center align-items-center">
                                                        <img src={`${this.state.picture}`} alt="Immagine di profilo" style={{ maxHeight: "2.2rem" }} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                    <ul className="dropdown-menu dropdown-menu-end">
                                        <li><span className="dropdown-item-text fw-bold" aria-label="Username corrente">{ this.state.username }</span></li>
                                        <div className="dropdown-divider"></div>
                                        <li><a className="dropdown-item" href={`/fo/profile?username=${this.state.username}`}>Profilo</a></li>
                                        <li><a className="dropdown-item" href="/fo/my-animals">I miei animali</a></li>
                                        <li><a className="dropdown-item" href="/fo/appointments">I miei appuntamenti</a></li>
                                        <li><a className="dropdown-item" href="/fo/shop/orders">I miei ordini</a></li>
                                        <li><a className="dropdown-item" href="/fo/settings">Impostazioni</a></li>
                                        <li><a className="dropdown-item" href="/fo/logout">Logout</a></li>
                                    </ul>
                                </div>
                            }
                            {
                                !this.state.username &&
                                <div>
                                    <a className="btn btn-primary text-decoration-none mx-1" href="/fo/signup">Registrati</a>
                                    <a className="btn btn-primary text-decoration-none mx-1" href={`/fo/login?return=${window.location.href}`}>Login</a>
                                </div>
                            }
                            </div>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
            </nav>
        </>);
    }
}