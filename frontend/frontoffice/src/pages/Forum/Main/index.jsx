import React from "react";
import { Helmet } from "react-helmet";
import "../../../scss/bootstrap.scss";
import $ from "jquery";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Navbar from "../../../components/Navbar";
import CreatePost from "./components/CreatePost";
import Post from "./components/Post";
import BlogAPI from "modules/api/blog";
import { Modal } from "bootstrap";
import { isAuthenticated } from "modules/auth.js"
import Footer from "../../../components/Footer";


const PAGE_SIZE = 10;


class ForumMain extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            posts: [],
            topics: [],

            is_logged: false,
            
            next_page: 0,
            selected_topic: undefined,

            error_message: ""
        };

        this.create_form = React.createRef();
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


        window.addEventListener("scroll", (_) => {
            let scroll_percent = ($(window).scrollTop() / ($(document).height() - $(window).height()));

            if (scroll_percent > 0.7) {
                this.loadNextPage();
            }
        });

        this.new_post_modal = new Modal(document.querySelector("#modal-create_post"));
        document.querySelector("#modal-create_post").addEventListener("hidden.bs.modal", event => {
            this.create_form.current.resetForm();
        });
          
        this.setState({ is_logged: await isAuthenticated() })
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
                        <section aria-label="Selettore argomento">
                            <div className="d-flex justify-content-center overflow-auto mb-3">
                                <div className="d-flex" style={{ maxWidth: "100%" }}>
                                {
                                    this.state.topics.map((topic) => (
                                        <label type="radio" key={topic.name} className={`btn btn-outline-primary mx-1 ${topic.name === this.state.selected_topic ? "active" : ""}`}>
                                            <div className="d-flex align-items-center justify-content-center h-100">
                                                <img src={`data:image/*;base64,${topic.icon}`} alt="" style={{ height: "2rem" }} className="me-1" />
                                                <span className="visually-hidden">Argomento: </span>{topic.name}
                                            </div>
                                            <input type="radio" name="topic" className="visually-hidden" onClick={() => this.filterTopic(topic.name)} aria-hidden="true" />
                                        </label>
                                    ))
                                }
                                </div>
                            </div>
                        </section>
                    </Row>

                    <Row>
                        <Col xs="12" md={{span: 8, offset: 2}} lg={{span: 6, offset: 3}}>
                            {/* Ricerca */}
                            <Row></Row>

                            {/* Creazione post */}
                            {
                                this.state.is_logged &&
                                <Row>
                                    <section aria-label="Creazione post" className="w-100">
                                        <div className="d-flex justify-content-center">
                                            <button type="button" className="btn btn-primary w-75" data-bs-toggle="modal" data-bs-target="#modal-create_post">
                                                SCRIVI UN POST
                                            </button>
                                        </div>
                                    </section>
                                </Row>
                            }

                            {/* Visualizzazione post */}
                            <Row>
                                <section aria-label="Lista dei post">
                                    {
                                        this.state.posts.map((post) => (
                                            <Post key={post.id} post={post} />
                                        ))
                                    }
                                </section>
                            </Row>
                        </Col>
                    </Row>
                </Container>
            </main>
            
            <Footer />

            {/* Modale creazione post */}
            <div className="modal fade" id="modal-create_post" tabIndex="-1" aria-labelledby="modal-create_post-label" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
                    <div className="modal-content">
                        <div className="modal-header" style={{ border: "none" }}>
                            <h1 className="modal-title fs-5" id="modal-create_post-label">Scrivi un post</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Chiudi"></button>
                        </div>

                        <div className="p-4 modal-body">
                            <CreatePost ref={this.create_form} onCreate={(post) => this.onPostCreate(post)}/>
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

    onPostCreate(post) {
        this.new_post_modal.hide();

        if (!this.state.selected_topic || post.topic === this.state.selected_topic) {
            let new_posts = this.state.posts;
            new_posts.unshift(post);

            this.setState({ posts: new_posts });
        }
    }
}

export default ForumMain;