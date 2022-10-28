import React from "react";
import { Helmet } from "react-helmet";
import $ from "jquery";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Navbar from "../../../components/Navbar";
import CreatePost from "./components/CreatePost";
import Post from "./components/Post";
import BlogAPI from "../../../import/api/blog";


class ForumMain extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            posts: [],

            error_message: ""
        };

    }

    componentDidMount() {
    (async () => {
        try {
            const posts = await BlogAPI.getPosts(10, 0);
            this.setState({ posts: posts });
        }
        catch (err) {
            this.setState({ error_message: "Si è verificato un errore mentre cercavo i post" });
        }
    })();
    }

    render() {
        return (<>
            <Helmet>
                <title>Forum</title>
            </Helmet>
            
            <Navbar />

            <main className="mt-3">
                <Container>
                    <Row>
                        <Col xs="12" md={{span: 8, offset: 2}} lg={{span: 4, offset: 4}}>
                            {/* Ricerca */}
                            <Row></Row>

                            {/* Topic */}
                            <Row></Row>


                            {/* Creazione post */}
                            <Row>
                                <section aria-label="Creazione post">
                                    <CreatePost />
                                </section>
                            </Row>

                            {/* Visualizzazione post */}
                            <Row>
                                {
                                    this.state.posts.map((post) => (
                                        <Post post={post} />
                                    ))
                                }
                            </Row>
                        </Col>
                    </Row>
                </Container>
            </main>
        </>);
    }
}

export default ForumMain;