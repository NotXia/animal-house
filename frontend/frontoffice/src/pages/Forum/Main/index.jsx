import React from "react";
import { Helmet } from "react-helmet";
import $ from "jquery";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Navbar from "../../../components/Navbar";
import CreatePost from "./components/CreatePost";


class ForumMain extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

            error_message: ""
        };

    }

    componentDidMount() {

    }

    render() {
        return (<>
            <Helmet>
                <title>Forum</title>
            </Helmet>
            
            <Navbar />

            <main className="mt-3">
                <Container>
                    {/* Ricerca */}
                    <Row>
                    </Row>

                    {/* Topic */}
                    <Row>
                    </Row>

                    {/* Creazione post */}
                    <Row>
                        <Col xs="12" md={{span: 8, offset: 2}} lg={{span: 4, offset: 4}}>
                            <section aria-label="Creazione post">
                                <CreatePost />
                            </section>
                        </Col>
                    </Row>
                    
                    {/* Visualizzazione post */}
                    <Row>
                    </Row>
                </Container>
            </main>
        </>);
    }
}

export default ForumMain;