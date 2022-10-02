/**
 * 
 * Visualizza delle immagini
 * Proprietà:
 *  - images      Immagini da visualizzare nel formato [ {path, description} ]
 * 
 */

import React from "react";
import "bootstrap/js/src/carousel";

export default class ImagesViewer extends React.Component {
    constructor(props) {
        super(props);
    }
    
    render() {
        let images = this.props.images;
        if (!images) { images = [{ path: `${process.env.REACT_APP_DOMAIN}/shop/images/default.png`, description: "" }] } // Se non ci sono immagini

        return (<>
            <div id="carousel-product-images" className="carousel slide carousel-dark" data-bs-ride="false">
                <div className="carousel-indicators">
                    {
                        this.props.images.map((_, index) => {
                            return (
                                <button key={`carousel-control-${index}`} type="button" data-bs-target="#carousel-product-images" data-bs-slide-to={index} 
                                        className={index === 0 ? "active" : ""} aria-current={index===0} aria-label={`Immagine ${index+1}`}></button>
                            );
                        })
                    }
                </div>
                <div className="carousel-inner">
                    {
                        this.props.images.map((image, index) => {
                            return (
                                <div className={ `carousel-item ${index === 0 ? "active" : ""}` } key={image.path}>
                                    <div className="d-flex justify-content-center align-items-center" style={{height: "30rem", width: "100%"}}>
                                        <img src={`${process.env.REACT_APP_DOMAIN}${image.path}`} alt={image.description} 
                                            style={{maxHeight: "100%", maxWidth: "100%"}} />
                                    </div>

                                    <div className="carousel-caption d-none d-md-block p-1 mb-3" style={{backgroundColor: image.description ? "#fafafac0" : ""}}>
                                        <div className="d-flex justify-content-center align-items-center h-100 w-100">
                                            <span>{image.description}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    }
                </div>

                <button className="carousel-control-prev" type="button" data-bs-target="#carousel-product-images" data-bs-slide="prev">
                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Immagine precedente</span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#carousel-product-images" data-bs-slide="next">
                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Immagine successiva</span>
                </button>
            </div>
        </>);
    }
}

