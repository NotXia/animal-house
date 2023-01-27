import React from "react";
import moment from "moment";
import Badge from "../../../../components/forum/Badge";
import UserAPI from "modules/api/user";

class SinglePost extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: null,
            error_message: ""
        };
    }

    async componentDidMount() {
        try {
            console.log(await UserAPI.getProfile(this.props.comment.author))
            this.setState({
                user: await UserAPI.getProfile(this.props.comment.author)
            });
        }
        catch (err) {
        }
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
                            <div className="d-flex align-items-center justify-content-center overflow-auto border rounded-circle" style={{ height: "2rem", width: "2rem" }}>
                                <img src={`${process.env.REACT_APP_DOMAIN}${this.state.user?.picture}`} alt="" style={{ height: "100%" }} />
                            </div>&nbsp;
                            <span className=" fw-semibold">
                                <a href={`/fo/profile?username=${comment.author}`} className="text-dark text-decoration-none">@{comment.author}</a>
                            </span>
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