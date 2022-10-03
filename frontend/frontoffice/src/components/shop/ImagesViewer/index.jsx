/**
 * 
 * Visualizza delle immagini
 * Proprietà:
 *  - images      Immagini da visualizzare nel formato [ {path, description} ]
 * 
 */

import React from "react";
import Tab from "bootstrap/js/src/tab";
import $ from "jquery";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Zoom from "react-medium-image-zoom"
import "react-medium-image-zoom/dist/styles.css"

export default class ImagesViewer extends React.Component {
    constructor(props) {
        super(props);

        let images = this.props.images;
        if (!images || images.length === 0) { images = [{ path: `${process.env.REACT_APP_DOMAIN}/shop/images/default.png`, description: "" }] } // Se non ci sono immagini
        
        this.state = {
            images: images,
            selected: "1"
        }
    }
    
    componentDidMount() {
        new Tab(document.querySelector('#tab-product-images'))
    }

    render() {
        return (<>
            <Container fluid>
                <Row>
                    <Zoom>
                        <div className="d-flex justify-content-center align-items-center p-2" style={{height: "25rem", width: "100%"}}>
                                <img src={`${process.env.REACT_APP_DOMAIN}${this.getSelectedImage().path}`} alt={this.getSelectedImage().description} 
                                    style={{maxHeight: "100%", maxWidth: "100%"}} />
                        </div>
                    </Zoom>
                </Row>

                <Row>
                    <div className="d-flex justify-content-center overflow-auto">
                        <ul id="tab-product-images" className="nav nav-pills flex-nowrap mw-100" role="tablist">
                            {
                                this.state.images.map((image, index) => {
                                    let active_class = index === 0 ? "active" : "";
                                    let isActive = index === 0;

                                    return (
                                        <li key={`tab-image-control-${image.path}`} className="nav-item" role="none">
                                            <button type="button" role="tab" data-bs-toggle="pill" aria-selected={isActive}
                                                    className={`btn btn-link ${active_class}`} style={{height: "6rem", width: "6rem"}}
                                                    onClick={()=>this.setState({selected: index})} onMouseEnter={()=>this.setState({selected: index})} onFocus={()=>this.setState({selected: index})} >
                                                <img src={`${process.env.REACT_APP_DOMAIN}${image.path}`} alt="" style={{maxHeight: "100%", maxWidth: "100%"}} />
                                            </button>
                                        </li>
                                    );
                                })
                            }
                        </ul>
                    </div>
                </Row>
            </Container>
        </>);
    }

    getSelectedImage() {
        return this.state.images[this.state.selected];
    }
}

