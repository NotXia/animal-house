import React from "react";
import $ from "jquery";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
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

        this.form = React.createRef();
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
                <form ref={this.form} className="w-100" onSubmit={(e) => { e.preventDefault(); this.createPost(); } }>
                    <TextInput ref={this.input.title} id="__createpost-title" name="title" type="text" label="Titolo" required />
                    
                    <textarea ref={this.input.content} className="form-control w-100" placeholder="Contenuto del post" style={{height: "7rem", resize: "none"}} defaultValue=""></textarea>
                    
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

                    <div>
                        {
                            this.state.uploaded_images.map((image, index) => (
                                <Row className="my-2" key={`${image.path}.${index}`}>
                                    <Col xs="4">
                                        <div className="d-flex justify-content-center align-items-center w-100" style={{height: "10rem"}}>
                                            <img src={image.path} alt="" style={{maxWidth: "100%", maxHeight: "100%"}} />
                                        </div>
                                    </Col>
                                    <Col xs="7">
                                        <div className="d-flex justify-content-center align-items-center h-100 w-100">
                                            <div className="form-floating h-100 w-100">
                                                <textarea className="form-control h-100 w-100" placeholder="Descrivi immagine" id={`textarea-description-${index}`} 
                                                          onChange={(e) => this.updateDescriptionAtIndex(index, e.target.value)} defaultValue={image.description}></textarea>
                                                <label htmlFor={`textarea-description-${index}`}>Descrizione</label>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col xs="1">
                                        <div className="d-flex justify-content-center align-items-center h-100 w-100">
                                            <button type="button" className="btn-close" aria-label="Close" onClick={() => { this.deleteImageAtIndex(index) }}></button>
                                        </div>
                                    </Col>
                                </Row>
                            ))
                        }
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
            images: this.state.uploaded_images.map((image) => ({ path: image.relative_path, description: image.description ? image.description : " " }))
        }
    }

    async createPost() {
        try {
            const post = await BlogAPI.createPost(this.getPostData());
            this.props.onCreate(post);
            this.resetForm();
        }
        catch (err) {
            this.setState({ error_message: "Si è verificato un errore mentre creavo il post" });
        }
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
                relative_path: image_path,
                path: `${process.env.REACT_APP_DOMAIN}/tmp/${image_path}`,
                description: ""
            })
        });
        this.setState({ uploaded_images: curr_images })

        $("#input-images_file").val("");
    }

    deleteImageAtIndex(index) {
        let curr_images = this.state.uploaded_images;
        curr_images.splice(index, 1);

        this.setState({ uploaded_images: curr_images });
    }

    updateDescriptionAtIndex(index, description) {
        let curr_images = this.state.uploaded_images;
        curr_images[index].description = description;

        this.setState({ uploaded_images: curr_images });
    }

    resetForm() {
        this.form.current.reset();
        this.setState({ uploaded_images: [] });
    }
}

export default CreatePost;