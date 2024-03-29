/**
 * 
 * Visualizza delle immagini
 * Proprietà:
 *  - images      Immagini da visualizzare nel formato [ {path, description} ]
 * 
 */

import React from "react";
import css from "./image.module.css";
import $ from "jquery";
window.jQuery = window.$ = global.jQuery = $;
const bootstrap = require("bootstrap");
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Zoom from "react-medium-image-zoom"
import "react-medium-image-zoom/dist/styles.css"

export default class ImagesViewer extends React.Component {
    constructor(props) {
        super(props);

        let images = this.props.images;
        if (!images || images.length === 0) { images = [{ path: `/shop/images/default.png`, description: "" }] } // Se non ci sono immagini
        
        this.state = {
            images: images,
            selected: 0
        }
    }
    
    componentDidMount() {
        new bootstrap.Tab(document.querySelector('#tab-product-images'));
    }

    render() {
        let description = <></>
        if (this.getSelectedImage().description) {
            description = (
                <div className={`position-absolute bottom-0 start-0 w-100 ${css["description-box"]}`}>
                    {this.getSelectedImage().description}
                </div>
            )
        }

        return (<>
            <Container fluid>
                {/* Immagine visualizzata */}
                <Row>
                    <figure>
                        <div className="position-relative w-100">
                            {description}

                            <Zoom a11yNameButtonUnzoom="Rimpicciolisci immagine" a11yNameButtonZoom="Ingrandisci immagine">
                                <div className={`d-flex justify-content-center align-items-center ${css["image-box"]}`}>
                                    <img src={`${process.env.REACT_APP_DOMAIN}${this.getSelectedImage().path}`} alt={this.getSelectedImage().description} 
                                        style={{maxHeight: "100%", maxWidth: "100%"}} />
                                </div>
                            </Zoom>
                        </div>
                    </figure>
                </Row>

                {/* Selettore immagine */}
                <Row className="mt-2">
                    <div className="d-flex justify-content-center overflow-auto">
                        <ul id="tab-product-images" className="nav nav-pills flex-nowrap mw-100" role="tablist">
                            {
                                this.state.images.map((image, index) => {
                                    let active_class = index === 0 ? "active" : "";
                                    let isActive = index === 0;

                                    return (
                                        <li key={`tab-image-control-${image.path}`} className="nav-item mx-1" role="none">
                                            <button type="button" role="tab" data-bs-toggle="pill" aria-selected={isActive}
                                                    className={`${css["image-selector-button"]} ${active_class}`}
                                                    onClick={(e) => this.changeImage(e, index)} onMouseEnter={(e) => this.changeImage(e, index)} onFocus={(e) => this.changeImage(e, index)} >
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

    changeImage(e, index) {
        e.preventDefault();

        this.setState({selected: index});
        $(`#tab-product-images li:nth-child(${index+1}) button`).tab("show");
    }
}

