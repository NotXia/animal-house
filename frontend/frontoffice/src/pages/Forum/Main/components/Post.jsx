import React from "react";
import $ from "jquery";
import BlogAPI from "../../../../import/api/blog";
import css from "./post.module.css";
import moment from "moment";


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
            <div className={`w-100 ${css["card-post"]}`}>
                <article>
                    <h2 className="fs-5 fw-semibold mb-0 text-truncate">{post.title}</h2>
                    <p>@{post.author}</p>

                    <div className={`text-truncate ${css["container-content"]} my-2`}>
                        <p className={`fs-6`}>{post.content}</p>
                    </div>

                    <div>
                        { comment_count_message } 
                    </div>
                    <div className="d-flex justify-content-between">
                        <p className="m-0" style={{ fontSize: "0.8rem" }}>{moment(post.creationDate).format("DD/MM/YY HH:mm")}</p>
                        
                        <div className="d-flex align-items-center">
                            {topic_image} <span className="ms-2">{this.state.topic?.name}</span>
                        </div>
                    </div>
                </article>
            </div>
        );
    }
}

export default CreatePost;