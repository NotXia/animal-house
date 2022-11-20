/**
 * 
 * Selettore del servizio
 * 
 * Attributi:
 * - species        Specie per il quale si vuole prenotare
 * - hub            Hub in cui si vuole prenotare
 * 
 * Callback
 * - onSelected(service)     Richiamato quando viene selezionato un servizio
 * 
 */

import React from "react";
import ServiceAPI from "modules/api/service";
import { centToPrice } from "modules/currency";

class ServiceSelector extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            services: [],

            loading: false,
            error_message: "",
        };
    }
    
    componentDidUpdate(prev_props, prev_states) {
        if (JSON.stringify(prev_props) === JSON.stringify(this.props)) { return; }
    (async () => {
        this.setState({ loading: true });

        try {
            let services = await ServiceAPI.getServices(this.props.hub);
            
            // Se viene specificata la specie, si filtrano i servizi adatti per la specie
            services = services.filter((service) => !this.props.species || (service.target.length === 0 || service.target.includes(this.props.species)));
            
            this.setState({ services: services });
        }
        catch (err) {
            this.setState({ error_message: "Si è verificato un errore" });
        }

        this.setState({ loading: false });
    })()
    }

    render() {
        return (
            <div className="list-group w-100">
                <div className={`d-flex justify-content-center ${this.state.loading ? "" : "d-none"}`}>
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Caricamento dei servizi</span>
                    </div>
                </div>

                {
                    this.state.services.map((service) => (
                        <button key={service.id} type="button" className="list-group-item list-group-item-action" onClick={() => this.handleServiceSelection(service)}>
                            <div className="d-flex align-items-center">
                                <span className="fw-semibold fs-4">{service.name}</span>
                                <span className="mx-1 border-end border-dark">&nbsp;</span>
                                <span className="fs-5 mx-1">{centToPrice(service.price)}€</span>
                                <span className="mx-1 border-end border-dark">&nbsp;</span>
                                <span className="fs-5 mx-1">{service.duration} min.</span>
                            </div>
                            <p className="m-0" style={{ whiteSpace: "pre-line" }}>{service.description}</p>
                        </button>
                    ))
                }
            </div>
        );
    }

    handleServiceSelection(service) {
        if (this.props.onSelected) {
            this.props.onSelected(service);
        }
    }
}

export default ServiceSelector;