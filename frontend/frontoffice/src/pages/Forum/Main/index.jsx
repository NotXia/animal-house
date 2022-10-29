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
                                {/* <section aria-label="Creazione post">
                                </section> */}
                                <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
                                    SCRIVI UN POST
                                </button>
                            </Row>

                            {/* Visualizzazione post */}
                            <Row>
                                {
                                    this.state.posts.map((post) => (
                                        <Post key={post.id} post={post} />
                                    ))
                                }
                            </Row>
                        </Col>
                    </Row>
                </Container>
            </main>

            <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header" style={{ border: "none" }}>
                            <h1 className="modal-title fs-5" id="exampleModalLabel">Scrivi un post</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>

                        <div className="p-4">
                            <CreatePost />
                        </div>
                    </div>
                </div>
            </div>
        </>);
    }
}

export default ForumMain;