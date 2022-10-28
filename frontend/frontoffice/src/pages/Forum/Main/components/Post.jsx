import React from "react";
import $ from "jquery";
import BlogAPI from "../../../../import/api/blog";
import css from "./post.module.css";


class CreatePost extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            
            error_message: ""
        };
    }

    componentDidMount() {
    (async () => {
        try {
            const topics = await BlogAPI.getTopics();
            this.setState({ topics: topics });
        }
        catch (err) {
            this.setState({ error_message: "" });
        }
    })();
    }

    render() {
        const post = this.props.post;

        return (
            <div className={`w-100 ${css["card-post"]}`}>
                <article>
                    <h2 className="fs-5 fw-semibold mb-0 text-truncate">{post.title}</h2>
                    <p>@{post.author}</p>
                    <div className={`text-truncate ${css["container-content"]}`}>
                        <p className={`fs-6`}>{post.content}</p>
                    </div>
                </article>
            </div>
        );
    }
}

export default CreatePost;