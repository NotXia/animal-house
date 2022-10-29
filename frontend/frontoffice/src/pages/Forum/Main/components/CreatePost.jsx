import React from "react";
import $ from "jquery";
import TextInput from "../../../../components/form/TextInput";
import BlogAPI from "../../../../import/api/blog";
import FileAPI from "../../../../import/api/file";


class CreatePost extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            topics: [],
            uploaded_images: [],
            
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
                    
                    <textarea ref={this.input.content} className="form-control w-100" placeholder="Contenuto del post" style={{height: "7rem", resize: "none"}}></textarea>
                    
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

                    <div className="mt-2">
                        <label htmlFor="input-images_file" className="form-label">Carica immagini</label>
                        <input id="input-images_file" className="form-control" type="file" onChange={(e) => this.fileUploadHandler(e)} accept="image/png, image/gif, image/jpeg" multiple />
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
        console.log(post);
    }

    async fileUploadHandler(e) {
        let upload_data = new FormData();
        let uploaded_images;
        
        // Preparazione payload e upload
        for (let i=0; i<$("#input-images_file")[0].files.length; i++) {
            upload_data.append(`file${i}`, $("#input-images_file")[0].files[i]);
        }
        uploaded_images = await FileAPI.upload(upload_data).catch((err) => { this.setState({ error_message: "Non è stato possibile caricare le immagini" }); });

        let curr_images = this.state.uploaded_images;
        uploaded_images.forEach((image_path) => { 
            curr_images.push({
                path: `${process.env.REACT_APP_DOMAIN}/tmp/${image_path}`,
                description: ""
            })
        });
        console.log(curr_images)
        this.setState({ uploaded_images: curr_images })



        $("#input-images_file").val("");
    }
}

export default CreatePost;