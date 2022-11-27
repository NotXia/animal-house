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


const PAGE_SIZE = 10;


class ForumMain extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            posts: [],
            topics: [],
            
            next_page: 0,
            selected_topic: undefined,

            error_message: ""
        };
    }

    componentDidMount() {
    (async () => {
        try {
            const posts = await BlogAPI.getPosts(PAGE_SIZE, 0, undefined, this.state.selected_topic);
            const topics = await BlogAPI.getTopics();

            this.setState({ posts: posts, next_page: 1, topics: topics });
        }
        catch (err) {
            this.setState({ error_message: "Si è verificato un errore mentre cercavo i post" });
        }


        window.addEventListener("scroll", (event) => {
            let scroll_percent = ($(window).scrollTop() / ($(document).height() - $(window).height()));

            if (scroll_percent > 0.7) {
                this.loadNextPage();
            }
        });
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
                    {/* Topic */}
                    <Row>
                        <div className="d-flex justify-content-center overflow-auto mb-3">
                            {
                                this.state.topics.map((topic) => (
                                    <label type="radio" key={topic.name} className={`btn btn-outline-primary mx-1 ${topic.name === this.state.selected_topic ? "active" : ""}`} aria-label={`Argomento: ${topic.name}`}>
                                        <div className="d-flex align-items-center justify-content-center">
                                            <img src={`data:image/*;base64,${topic.icon}`} alt="" style={{ height: "2rem" }} className="me-1" />
                                            {topic.name}
                                        </div>
                                        <input type="radio" name="topic" className="visually-hidden" onClick={() => this.filterTopic(topic.name)} />
                                    </label>
                                ))
                            }
                        </div>
                    </Row>

                    <Row>
                        <Col xs="12" md={{span: 8, offset: 2}} lg={{span: 4, offset: 4}}>
                            {/* Ricerca */}
                            <Row></Row>



                            {/* Creazione post */}
                            <section aria-label="Creazione post" className="w-100">
                                <Row>
                                    <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
                                        SCRIVI UN POST
                                    </button>
                                </Row>
                            </section>

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
                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
                    <div className="modal-content">
                        <div className="modal-header" style={{ border: "none" }}>
                            <h1 className="modal-title fs-5" id="exampleModalLabel">Scrivi un post</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>

                        <div className="p-4 modal-body">
                            <CreatePost />
                        </div>
                    </div>
                </div>
            </div>
        </>);
    }

    async loadNextPage() {
        try {
            if (this.curr_fetch_request) { // Richiesta già effettuata
                await this.curr_fetch_request;
                this.curr_fetch_request = null;
            }
            else {
                this.curr_fetch_request = BlogAPI.getPosts(PAGE_SIZE, this.state.next_page, undefined, this.state.selected_topic).then((posts) => {
                    this.setState({ 
                        posts: this.state.posts.concat(posts),
                        next_page: this.state.next_page + 1
                    });

                    this.curr_fetch_request = null;
                });
            }
        }
        catch (err) {
            this.setState({ error_message: "Si è verificato un errore mentre cercavo i post" });
        }
    }

    filterTopic(topic) {
        if (this.state.selected_topic === topic) { topic = undefined; } // Deselezione

        this.setState({
            selected_topic: topic,
            next_page: 0,
            posts: []
        }, () => {
            this.loadNextPage();
        });

    }
}

export default ForumMain;