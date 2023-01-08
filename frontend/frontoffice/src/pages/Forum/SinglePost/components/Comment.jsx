import React from "react";
import moment from "moment";
import Badge from "../../../../components/forum/Badge";

class SinglePost extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error_message: ""
        };
        
    }

    render() {
        const comment = this.props.comment;

        return (
            <div role="comment" aria-labelledby={`label-comment-${comment.index}`}>
                <div id={`label-comment-${comment.index}`} className="visually-hidden">
                    Commento di {comment.author}.
                    Data: {moment(comment.creationDate).format("DD/MM/YYYY HH:mm")}.
                    &nbsp;{comment.content}
                </div>

                <div aria-hidden="true">
                    <p className="m-0">
                        <div className="d-flex align-items-center">
                            <span className=" fw-semibold">@{comment.author}</span>
                            <Badge username={comment.author} />&nbsp;
                            <span className="m-0" style={{ fontSize: "0.8rem" }}>{moment(comment.creationDate).format("DD/MM/YYYY HH:mm")}</span>
                        </div>
                    </p>
                    <p className="m-0">{comment.content}</p>
                </div>
            </div>
        );
    }
}

export default SinglePost;