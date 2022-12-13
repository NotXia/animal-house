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
import { getUsername, isAdmin } from "modules/auth.js";
import Footer from "../../../components/Footer";


const COMMENT_PAGE_SIZE = 10;

class SinglePost extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            post: {},
            comments: [],
            username: "",
            is_admin: true,

            next_page: 0,

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
            const is_admin = await isAdmin();

            this.setState({ 
                post: post,
                comments: comments,
                username: username,
                is_admin: is_admin,
                next_page: 1
            });
        }
        catch (err) {
            this.setState({ error_message: "Si è verificato un errore mentre cercavo il post" });
        }


        $("#container-comments").on("scroll", (event) => {
            let scroll_percent = ($("#container-comments").scrollTop() / ($("#container-comments")[0].scrollHeight - $("#container-comments").height()));

            if (scroll_percent > 0.6) {
                this.loadNextCommentPage();
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
                    <Row>
                        <div className="col-12 col-md-8">
                            <Row>
                                <section aria-label="Intestazione post">
                                    <div className="d-flex justify-content-between">
                                        {/* Intestazione post */}
                                        <div>
                                            <h1 className="m-0">{this.state.post.title}</h1>
                                            <a href={`/fo/profile?username=${this.state.post.author}`}>@{this.state.post.author}</a>
                                        </div>

                                        {/* Operazioni su post */}
                                        {
                                            ((this.state.post.author === this.state.username) || this.state.is_admin) &&
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
                                </section>
                            </Row>

                            {/* Contenuto */}
                            <Row>
                                <section aria-label="Contenuto post">
                                    <span style={{whiteSpace: "pre-line"}}>{this.state.post.content}</span>
                                </section>
                            </Row>
                            
                            {/* Immagini */}
                            {
                                (this.state.post.images?.length > 0) && 
                                (
                                    <Row>
                                        <section aria-label="Immagini post" aria-labelledby={`label-carousel-${this.state.post.id}`}>
                                            <div id={`label-carousel-${this.state.post.id}`} className="visually-hidden">
                                                {
                                                    this.state.post.images.map((image, index) => (
                                                        <p key={`label-image-${image.path}`}>
                                                            Immagine {index+1}: { image.description ? image.description: "Nessuna descrizione" }
                                                        </p>
                                                    ))
                                                }
                                            </div>

                                            <div id="carousel-images" className="carousel slide" data-bs-ride="false" aria-hidden="true">
                                                <div className="carousel-inner">
                                                    {
                                                        this.state.post.images.map((image, index) => (
                                                            <div key={image.path} className={`carousel-item ${index === 0 ? "active" : ""}`}>
                                                                <div className="d-flex justify-content-center align-items-center" style={{ height: "30rem" }}>
                                                                    <div>
                                                                        <img src={`${process.env.REACT_APP_DOMAIN}${image.path}`} alt={image.description} style={{ maxHeight: "100%", maxWidth: "100%" }} />
                                                                    </div>
                                                                </div>
                                                                {
                                                                    image.description &&
                                                                    (
                                                                        <div className="carousel-caption d-block" style={{ backgroundColor: "#71717195", borderRadius: "1rem" }}>
                                                                            <p className="m-0">{image.description}</p>
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
                                        </section>
                                    </Row>
                                )
                            }
                        </div>

                        <div className="col-12 col-md-4">
                            <section aria-label="Commenti">
                                {/* Form commento */}
                                <Row className="mt-2">
                                    <form onSubmit={(e) => { e.preventDefault(); this.addComment(); }}>
                                        <textarea ref={this.input.comment_text} className="form-control" placeholder="Commenta il post"></textarea>
                                        <button className="btn btn-outline-primary mt-2">Invia</button>
                                    </form>
                                </Row>

                                {/* Commenti */}
                                <Row className="mt-2 overflow-auto" style={{ maxHeight: "30rem" }} id="container-comments">
                                    {
                                        this.state.comments.map((comment) => (
                                            <div key={`comment-${comment.index}-${comment.creationDate}`} className="my-2">
                                                <Comment comment={comment} />
                                            </div>
                                        ))
                                    }
                                </Row>
                            </section>
                        </div>
                    </Row>
                </Container>
            </main>

            <Footer />
        </>);
    }

    async addComment() {
        const comment_content = this.input.comment_text.current.value;
        if (comment_content === "") { return; }

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

    async loadNextCommentPage() {
        try {
            if (this.curr_fetch_request) { // Richiesta già effettuata
                await this.curr_fetch_request;
                this.curr_fetch_request = null;
            }
            else {
                this.curr_fetch_request = BlogAPI.getCommentsOf(this.post_id, COMMENT_PAGE_SIZE, this.state.next_page).then((comments) => {
                    this.setState({ 
                        comments: this.state.comments.concat(comments),
                        next_page: this.state.next_page + 1
                    });
                });
            }
        }
        catch (err) {
            this.setState({ error_message: "Si è verificato un errore mentre cercavo i commenti" });
        }
    }
}

export default SearchParamsHook(SinglePost);