/**
 * 
 * Selettore dell'animale
 * 
 * Attributi
 * - species            Specie degli animali da visualizzare
 * 
 * Callback
 * - onSelected(animal)     Richiamato quando viene selezionato un servizio
 * 
 */

import React from "react";
import AnimalAPI from "modules/api/animals";
import { getUsername } from "modules/auth";


class ServiceSelector extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            animals: [],

            error_message: "",
        };
    }
    
    componentDidUpdate() {
    (async () => {
        try {
            let animals = await AnimalAPI.getUserAnimals(await getUsername());
            animals = animals.filter((animal) => !this.props.species || this.props.species.includes(animal.species));
            
            if (JSON.stringify(animals) != JSON.stringify(this.state.animals)) {
                this.setState({ animals: animals });
            }
        }
        catch (err) {
            this.setState({ error_message: "Si è verificato un errore" });
        }
    })()
    }

    render() {
        return (
            <div className="container-fluid">
                <p className="invalid-feedback d-block fs-5 fw-semibold text-center" aria-live="assertive">{this.state.error_message}</p>

                <div className="row">
                    {
                        this.state.animals.map((animal) => {
                            let image_path = animal.image_path ? `${process.env.REACT_APP_DOMAIN}${animal.image_path}` : `${process.env.REACT_APP_DOMAIN}/animals/images/default.png`;

                            return (
                                <div key={animal.id} className="col-12 col-md-6 col-lg-3 my-1">
                                    <button className="w-100 h-100 btn btn-outline-light text-dark border border-secondary py-2" onClick={() => this.handleAnimalSelection(animal)}>
                                        <div className="d-flex justify-content-center">
                                            <div className="d-flex align-items-center justify-content-center" style={{ height: "5rem", width: "5rem", borderRadius: "50%", overflow: "hidden" }} >
                                                <img src={image_path} alt="" style={{ maxHeight: "100%", maxWidth: "100%" }} />
                                            </div>
                                        </div>

                                        <div className="text-center text-truncate">
                                            {animal.name}
                                        </div>
                                    </button>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        );
    }

    handleAnimalSelection(animal) {
        if (this.props.onSelected) {
            this.props.onSelected(animal);
        }
    }
}

export default ServiceSelector;