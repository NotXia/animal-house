import React from "react";
import $ from "jquery";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import BlogAPI from "modules/api/blog";
import moment from "moment";
import { Link } from "react-router-dom";
import Badge from "../../../../components/forum/Badge";


class CreatePost extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            topic: null,
            comment_count: null,

            error_message: ""
        };
    }

    componentDidMount() {
    (async () => {
        try {
            const topic = await BlogAPI.getTopic(this.props.post.topic);
            const comment_count = await BlogAPI.getCommentNumberOf(this.props.post.id);
            this.setState({ topic: topic, comment_count: comment_count });
        }
        catch (err) {
            this.setState({ error_message: "" });
        }
    })();
    }

    render() {
        const post = this.props.post;
        
        let topic_image = null;
        if (this.state.topic?.icon) { topic_image = <img src={`data:image/*;base64,${this.state.topic.icon}`} alt="" style={{ height: "1.5rem" }} /> }

        let comment_count_message;
        if (this.state.comment_count != null) {
            comment_count_message = this.state.comment_count === 1 ? `${this.state.comment_count} commento` : `${this.state.comment_count} commenti`
        }

        return (
            <Link to={`/forum/post?post_id=${post.id}`} style={{ textDecoration: "none", color: "black" }}>
                <div className={`w-100 border border-dark rounded p-4 my-2`}>
                    <article aria-labelledby={`label-post-${post.id}`}>
                        <div className="visually-hidden" id={`label-post-${post.id}`}>
                            Titolo: {post.title}.
                            Autore: {post.author}.
                            Data: {moment(post.creationDate).format("DD/MM/YYYY HH:mm")}.
                            Argomento: {this.state.topic?.name}. 
                            &nbsp;{ post.images.length > 1 ? `${post.images.length} foto.` : "" }
                            &nbsp;{ comment_count_message }.
                            &nbsp;{post.content}.
                        </div>

                        <div aria-hidden="true">
                            <Row>
                                <Col xs={post.images.length > 0 ? "8" : "12"}>
                                    <h2 className="fs-5 fw-semibold mb-0 text-truncate">{post.title}</h2>
                                    <div className="d-flex align-items-center">
                                        <p className="m-0">@{post.author}</p>&nbsp;
                                        <Badge username={post.author} />
                                    </div>

                                    <div className={`text-truncate my-2`}>
                                        <p className={`fs-6 text-truncate`}>{post.content}</p>
                                    </div>
                                </Col>

                                {
                                    (() => {
                                        if (post.images.length > 0) {
                                            return (
                                                <Col xs="4">
                                                    <div className="d-flex justify-content-center">
                                                        <img src={`${process.env.REACT_APP_DOMAIN}${post.images[0].path}`} alt={post.images[0].description} style={{ width: "100%" }} />
                                                    </div>
                                                    <div className="fs-6 text-center fst-italic">{post.images.length > 1 ? `${post.images.length} foto` : ""}</div>
                                                </Col>
                                            );
                                        }
                                        return null;
                                    })()
                                }
                            </Row>


                            <div>
                                { comment_count_message } 
                            </div>
                            <div className="d-flex justify-content-between">
                                <p className="m-0" style={{ fontSize: "0.8rem" }}>{moment(post.creationDate).format("DD/MM/YYYY HH:mm")}</p>
                                
                                <div className="d-flex align-items-center">
                                    {topic_image} <span className="ms-2">{this.state.topic?.name}</span>
                                </div>
                            </div>
                        </div>
                    </article>
                </div>
            </Link>
        );
    }
}

export default CreatePost;