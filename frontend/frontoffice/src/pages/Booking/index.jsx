import React from "react";
import { Helmet } from "react-helmet";
import $ from "jquery"
import Navbar from "../../components/Navbar";
import { getUsername, isAuthenticated } from "modules/auth.js";
import SearchParamsHook from "../../hooks/SearchParams";
import ServiceSelector from "./components/ServiceSelector";
import PetSelector from "./components/PetSelector";
import HubSelector from "./components/HubSelector";
import SlotSelector from "./components/SlotSelector";
import ServiceAPI from "modules/api/service";
import HubAPI from "modules/api/hub";
import moment from "moment";
import { centToPrice } from "modules/currency";
import BookingAPI from "modules/api/booking";


class Booking extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            species: undefined,
            animal: undefined,
            service: undefined,
            hub: undefined,
            slot: undefined,
            

            step: "",
            
            error_message: "",
        };

        isAuthenticated().then(is_auth => { if (!is_auth) { window.location = `${process.env.REACT_APP_BASE_PATH}/login?return=${window.location.href}`; } } );
    }
    
    async componentDidMount() {
        const service_url = this.props.searchParams.get("service");
        const hub_url = this.props.searchParams.get("hub");

        if (service_url) {
            const service = await ServiceAPI.getServiceById(service_url);

            this.setState({ 
                service: service,
                species: service.target 
            });
        }

        if (hub_url) {
            const hub = await HubAPI.getByCode(hub_url);

            this.setState({ hub: hub });
        }

        this.setState({ step: "animal" });
    }

    render() {
        return (<>
            <Helmet>
                <title>Crea appuntamento</title>
            </Helmet>

            <Navbar />
            
            <main className="mt-3">
                <div className="container">
                    <div className="row">
                        <h1>Crea appuntamento</h1>
                    </div>

                    <div className={`row ${this.state.step === "animal" ? "" : "d-none"}`}>
                        <h2>Scegli per chi vuoi prenotare</h2>
                        <PetSelector species={this.state.species} onSelected={(animal) => this.selectAnimal(animal)} />
                    </div>

                    <div className={`row ${this.state.step === "service" ? "" : "d-none"}`}>
                        <h2>Scegli il servizio</h2>
                        <ServiceSelector hub={this.state.hub?.code} species={this.state.species} onSelected={(service) => this.selectService(service)} />
                    </div>

                    <div className={`row ${this.state.step === "hub" ? "" : "d-none"}`}>
                        <h2>Scegli la sede in cui erogare il servizio</h2>
                        <HubSelector service={this.state.service?.id} onSelected={(hub) => this.selectHub(hub)} style={{ height: "20rem" }} />
                    </div>

                    <div className={`row ${this.state.step === "slot" ? "" : "d-none"}`}>
                        <h2>Scegli il giorno in cui vuoi venire</h2>
                        <div className="col-12 col-md-8 offset-md-2 col-lg-6 offset-lg-3">
                            <SlotSelector service={this.state.service?.id} hub={this.state.hub?.code} onSelected={(slot) => this.selectSlot(slot)} />
                        </div>
                    </div>

                    <div className={`row ${this.state.step === "checkout" ? "" : "d-none"}`}>
                        <div className="d-flex justify-content-center">
                            <div>
                                <h2 className="text-center">Riepilogo</h2>
                                <p className="fs-4 m-0 text-center fw-semibold">{moment(this.state.slot?.time.start).format("DD/MM/YYYY")} alle {moment(this.state.slot?.time.start).format("HH:mm")}</p>
                                <p className="fs-5 mb-2">Prenotazione per: <span className="fw-semibold">{this.state.animal?.name}</span></p>
                                <p className="fs-5 m-0">Servizio: <span className="fw-semibold">{this.state.service?.name}</span></p>
                                <p className="fs-5 m-0">Durata: <span className="fw-semibold">{this.state.service?.duration} minuti</span></p>
                                <p className="fs-5 mb-2">Prezzo: <span className="fw-semibold">{centToPrice(this.state.service?.price)}€</span></p>
                                <p className="fs-5 m-0">Modalità: <span className="fw-semibold">{this.state.service?.online ? "Online" : "In sede"}</span></p>
                                {
                                    !this.state.service?.online &&
                                    (
                                        <p className="fs-5 m-0">
                                            Indirizzo hub: <span className="fw-semibold">{this.state.hub?.address.street} {this.state.hub?.address.number} ({this.state.hub?.address.city})</span>
                                        </p>
                                    )
                                }

                                <div className="mt-2 d-flex justify-content-center">
                                    <button className="btn btn-outline-primary" onClick={() => this.createAppointment()}>Procedi al pagamento</button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </>);
    }

    selectAnimal(animal) {
        this.setState({ species: animal.species, animal: animal }, this.gotoServiceStep);
    }

    gotoServiceStep() {
        if (this.state.service) { return this.gotoHubStep(); }
        this.setState({ step: "service" });
    }
    
    selectService(service) {
        this.setState({ service: service }, this.gotoHubStep);
    }

    gotoHubStep() {
        if (this.state.hub) { return this.gotoSlotStep(); }
        this.setState({ step: "hub" });
    }

    selectHub(hub) {
        this.setState({ hub: hub }, this.gotoSlotStep);
    }

    gotoSlotStep() {
        this.setState({ step: "slot" });
    }

    selectSlot(slot) {
        this.setState({ slot: slot }, this.gotoCheckoutStep);
    }

    gotoCheckoutStep() {
        this.setState({ step: "checkout" });
    }
    
    async createAppointment() {
        const appointment_data = {
            time_slot: this.state.slot.time,
            service_id: this.state.service.id,
            customer: await getUsername(),
            animal_id: this.state.animal.id,
            operator: this.state.slot.operator_username,
            hub: this.state.hub.code,
        };

        await BookingAPI.createAppointment(appointment_data);
    }
}

export default SearchParamsHook(Booking);