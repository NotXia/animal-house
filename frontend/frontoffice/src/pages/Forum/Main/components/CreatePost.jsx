import React from "react";
import $ from "jquery";
import TextInput from "../../../../components/form/TextInput";
import BlogAPI from "../../../../import/api/blog";


class CreatePost extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            topics: [],
            
            error_message: ""
        };

        this.input = {
            title: React.createRef(),
            content: React.createRef(),
            topic: React.createRef()
        }
    }

    componentDidMount() {
    (async () => {
        try {
            const topics = await BlogAPI.getTopics();
            this.setState({ topics: topics });
        }
        catch (err) {
            this.setState({ error_message: "Non è stato possibile inizializzare i topic" });
        }
    })();
    }

    render() {
        return (
            <div className="d-flex justify-content-center w-100">
                <form className="w-100" onSubmit={(e) => { e.preventDefault(); this.createPost(); } }>
                    <TextInput ref={this.input.title} id="__createpost-title" name="title" type="text" label="Titolo" required />
                    
                    <textarea ref={this.input.content} className="form-control w-100" placeholder="Scrivi un post" style={{height: "7rem", resize: "none"}}></textarea>
                    
                    <div className="form-floating mt-2">
                        <select ref={this.input.topic} className="form-select" aria-label="Topic del post" defaultValue="null">
                            <option disabled value="null">-</option>
                            {
                                this.state.topics.map((topic) => (
                                    <option key={topic.name} value={topic.name}>{topic.name}</option>
                                ))
                            }
                        </select>
                        <label htmlFor="floatingSelect">Topic</label>
                    </div>

                    <div className="d-flex justify-content-end mt-2">
                        <button className="btn btn-outline-primary">Invia</button>
                    </div>
                </form>
            </div>
        );
    }

    getPostData() {
        return {
            title: this.input.title.current.value(),
            content: this.input.content.current.value,
            topic: this.input.topic.current.value,
        }
    }

    async createPost() {
        const post = await BlogAPI.createPost(this.getPostData());
        console.log(post)
    }
}

export default CreatePost;