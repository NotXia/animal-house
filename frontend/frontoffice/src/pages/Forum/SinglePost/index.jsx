import React from "react";
import { Helmet } from "react-helmet";
import $ from "jquery";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Navbar from "../../../components/Navbar";
import BlogAPI from "../../../import/api/blog";
import SearchParamsHook from "../../../hooks/SearchParams";


class SinglePost extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            post: {},
            error_message: ""
        };
        
    }

    componentDidMount() {
    (async () => {
        try {
            const post = await BlogAPI.getPostById(this.props.searchParams.get("post_id"));
            
            this.setState({ post: post });
        }
        catch (err) {
            this.setState({ error_message: "Si è verificato un errore mentre cercavo il post" });
        }
    })();
    }

    render() {
        console.log(this.state.post)
        return (<>
            <Helmet>
                <title>Forum</title>
            </Helmet>
            
            <Navbar />

            <main className="mt-3">
                <Container>
                    <Row>
                        <h1>{this.state.post.title}</h1>
                    </Row>

                    <Row>
                        <span style={{whiteSpace: "pre-line"}}>{this.state.post.content}</span>
                    </Row>

                    {
                        (this.state.post.images?.length > 0) && 
                        (
                            <Row>
                                <div id="carousel-images" class="carousel slide" data-bs-ride="false">
                                    <div class="carousel-inner">
                                        {
                                            this.state.post.images.map((image, index) => (
                                                <div class={`carousel-item ${index === 0 ? "active" : ""}`}>
                                                    <div className="d-flex justify-content-center align-items-center" style={{ height: "35rem" }}>
                                                        <div>
                                                            <img src={`${process.env.REACT_APP_DOMAIN}${image.path}`} alt={image.description} style={{ maxHeight: "100%", maxWidth: "100%" }} />
                                                        </div>
                                                    </div>
                                                    {
                                                        image.description &&
                                                        (
                                                            <div class="carousel-caption d-block" style={{ backgroundColor: "#71717195", borderRadius: "1rem" }}>
                                                                <p>{image.description}</p>
                                                            </div>
                                                        )
                                                    }
                                                </div>
                                            ))
                                        }
                                    </div>
                                    <button class="carousel-control-prev" type="button" data-bs-target="#carousel-images" data-bs-slide="prev">
                                        <span class="carousel-control-prev-icon p-4" aria-hidden="true" style={{ backgroundColor: "#a1a1a1", borderRadius: "1rem" }}></span>
                                        <span class="visually-hidden">Immagine precedente</span>
                                    </button>
                                    <button class="carousel-control-next" type="button" data-bs-target="#carousel-images" data-bs-slide="next">
                                        <span class="carousel-control-next-icon p-4" aria-hidden="true" style={{ backgroundColor: "#a1a1a1", borderRadius: "1rem" }}></span>
                                        <span class="visually-hidden">Immagine successiva</span>
                                    </button>
                                </div>
                            </Row>
                        )
                    }
                </Container>
            </main>
        </>);
    }
}

export default SearchParamsHook(SinglePost);