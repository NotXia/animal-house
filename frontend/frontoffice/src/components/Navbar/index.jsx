import React from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";

export default class NavbarComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    
    render() {
        return (<>
            <nav>
                <Navbar bg="light" expand="lg">
                    <Container fluid>
                        <Navbar.Brand href="#home">
                            <div className="d-flex justify-content-center align-items-center">
                                <img src={`${process.env.REACT_APP_DOMAIN}/logos/logo.png`} alt="" style={{height: "2rem"}} />
                            </div>
                        </Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="me-auto">
                                <Nav.Link href="/fo">Home</Nav.Link>
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
            </nav>
        </>);
    }
}

