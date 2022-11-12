import React from "react";
import { Helmet } from "react-helmet";
import $ from "jquery";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Navbar from "../../../components/Navbar";
import BlogAPI from "../../../import/api/blog";
import SearchParamsHook from "../../../hooks/SearchParams";
import Comment from "./components/Comment";
import { getUsername } from "../../../import/auth"


const COMMENT_PAGE_SIZE = 100;

class SinglePost extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            post: {},
            comments: [],
            username: "",

            error_message: ""
        };
        
        this.post_id = this.props.searchParams.get("post_id");
        this.input = {
            comment_text: React.createRef()
        }
    }

    componentDidMount() {
    (async () => {
        try {
            const post = await BlogAPI.getPostById(this.post_id);
            const comments = await BlogAPI.getCommentsOf(this.post_id, COMMENT_PAGE_SIZE, 0);
            const username = await getUsername().catch((err) => "");

            this.setState({ 
                post: post,
                comments: comments,
                username: username
            });
        }
        catch (err) {
            this.setState({ error_message: "Si è verificato un errore mentre cercavo il post" });
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
                        <div className="col-12 col-md-8">
                            <Row>
                                <div className="d-flex justify-content-between">
                                    <h1>{this.state.post.title}</h1>

                                    {
                                        this.state.post.author === this.state.username &&
                                        (
                                            <span className="dropdown">
                                                <div className="d-flex align-items-center justify-content-center h-100">
                                                    <button className="btn btn-link text-dark" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-three-dots" viewBox="0 0 16 16">
                                                                <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
                                                            </svg>
                                                    </button>
                                                    <ul className="dropdown-menu">
                                                        <li><button className="dropdown-item btn btn-danger" onClick={() => this.deletePost()}>Cancella post</button></li>
                                                    </ul>
                                                </div>
                                            </span>
                                        )
                                    }
                                </div>
                            </Row>

                            <Row>
                                <span style={{whiteSpace: "pre-line"}}>{this.state.post.content}</span>
                            </Row>

                            {
                                (this.state.post.images?.length > 0) && 
                                (
                                    <Row>
                                        <div id="carousel-images" className="carousel slide" data-bs-ride="false">
                                            <div className="carousel-inner">
                                                {
                                                    this.state.post.images.map((image, index) => (
                                                        <div key={image.path} className={`carousel-item ${index === 0 ? "active" : ""}`}>
                                                            <div className="d-flex justify-content-center align-items-center" style={{ height: "35rem" }}>
                                                                <div>
                                                                    <img src={`${process.env.REACT_APP_DOMAIN}${image.path}`} alt={image.description} style={{ maxHeight: "100%", maxWidth: "100%" }} />
                                                                </div>
                                                            </div>
                                                            {
                                                                image.description &&
                                                                (
                                                                    <div className="carousel-caption d-block" style={{ backgroundColor: "#71717195", borderRadius: "1rem" }}>
                                                                        <p>{image.description}</p>
                                                                    </div>
                                                                )
                                                            }
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                            <button className="carousel-control-prev" type="button" data-bs-target="#carousel-images" data-bs-slide="prev">
                                                <span className="carousel-control-prev-icon p-4" aria-hidden="true" style={{ backgroundColor: "#a1a1a1", borderRadius: "1rem" }}></span>
                                                <span className="visually-hidden">Immagine precedente</span>
                                            </button>
                                            <button className="carousel-control-next" type="button" data-bs-target="#carousel-images" data-bs-slide="next">
                                                <span className="carousel-control-next-icon p-4" aria-hidden="true" style={{ backgroundColor: "#a1a1a1", borderRadius: "1rem" }}></span>
                                                <span className="visually-hidden">Immagine successiva</span>
                                            </button>
                                        </div>
                                    </Row>
                                )
                            }
                        </div>
                        
                        <div className="col-12 col-md-4">
                            <Row>
                                <form onSubmit={(e) => { e.preventDefault(); this.addComment(); }}>
                                    <textarea ref={this.input.comment_text} className="form-control" placeholder="Commenta il post"></textarea>
                                    <button className="btn btn-outline-primary mt-2">Invia</button>
                                </form>
                            </Row>

                            <Row className="mt-2 overflow-auto" style={{ maxHeight: "30rem" }}>
                                {
                                    this.state.comments.map((comment) => (
                                        <div key={`comment-${comment.index}-${comment.creationDate}`} className="my-2">
                                            <Comment comment={comment} />
                                        </div>
                                    ))
                                }
                            </Row>
                        </div>
                    </Row>
                </Container>
            </main>
        </>);
    }

    async addComment() {
        const comment_content = this.input.comment_text.current.value;

        try {
            const comment = await BlogAPI.addCommentToPost(this.post_id, comment_content); // Creazione commenti
            
            this.input.comment_text.current.value = ""; // Reset form

            // Inserimento nella lista dei commenti visualizzati
            let curr_comments = this.state.comments;
            curr_comments.unshift(comment);
            this.setState({ comments: curr_comments });
        }
        catch (err) {
            console.log(err)
        }
    }

    async deletePost() {
        try {
            await BlogAPI.deletePostById(this.state.post.id);
            window.location.href = "/fo/forum/";
        }
        catch (err) {

        }
    }
}

export default SearchParamsHook(SinglePost);