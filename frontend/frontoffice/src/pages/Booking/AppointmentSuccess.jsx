import React from "react";
import { Helmet } from "react-helmet";
import "../../scss/bootstrap.scss";
import Navbar from "../../components/Navbar";
import SearchParamsHook from "../../hooks/SearchParams";
import { Link } from "react-router-dom";
import BookingAPI from "modules/api/booking";
import AnimalAPI from "modules/api/animals";
import ServiceAPI from "modules/api/service";
import HubAPI from "modules/api/hub";
import moment from "moment"
import Footer from "../../components/Footer";


class OrderSuccess extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            appointment: null,
            animal: null,
            service: null,
        };

    }

    async componentDidMount() {
        const appointment_id = this.props.searchParams.get("appointment_id");

        try {
            await BookingAPI.confirmPayment(appointment_id);
        }
        catch (err) {}

        try {
            const appointment = await BookingAPI.getAppointmentById(appointment_id);
            const animal = await AnimalAPI.getAnimalById(appointment.animal_id);
            const service = await ServiceAPI.getServiceById(appointment.service_id);
            const hub = await HubAPI.getByCode(appointment.hub);

            this.setState({ 
                appointment: appointment,
                animal: animal,
                service: service,
                hub: hub
            });
        }
        catch (err) {}
    }

    render() {
        return (<>
            <Helmet>
                <title>Appuntamento creato con successo</title>
            </Helmet>
            
            <Navbar />

            <main className="mt-3 w-100">
                <div className="d-flex justify-content-center">
                    <div>
                        <h1 className="text-center">Grazie per aver scelto Animal House</h1>

                        <section aria-label="Promemoria dell'appuntamento">
                            <p className="fs-4 m-0 text-center">
                                Ecco un promemoria dell'appuntamento
                            </p>

                            {
                                (this.state.appointment && this.state.animal && this.state.service && this.state.hub) &&
                                <div className="text-center fs-4 border rounded p-2 py-3">
                                    <p className="m-0">
                                        <span className="fw-semibold">{moment.utc(this.state.appointment?.time_slot.start).format("DD/MM/YYYY")}</span> alle <span className="fw-semibold">{moment.utc(this.state.appointment?.time_slot.start).format("HH:mm")}</span>
                                    </p>
                                    <p className="m-0">
                                        <span className="fw-semibold">{this.state.service?.name}</span> per <span className="fw-semibold">{this.state.animal?.name}</span>
                                    </p>
                                    {
                                        this.state.service?.online ?
                                            <p className="m-0">Riceverai presto una mail con le modalità di svolgimento</p>
                                        :
                                            <p className="m-0">Hub situato in <span className="fw-semibold">{this.state.hub?.address.street} {this.state.hub?.address.number}</span></p>
                                    }
                                </div>
                            }
                        </section>

                    </div>
                </div>
                
                <section aria-label="Vai alla lista degli appuntamenti">
                    <div className="d-flex justify-content-center mt-3">
                        <Link to="/appointments">
                            <button className="btn btn-outline-success p-2 px-4">
                                <span className="fs-5">Controlla i tuoi appuntamenti</span>
                            </button>
                        </Link>
                    </div>
                </section>

            </main>

            <Footer />
        </>);
    }

}

export default SearchParamsHook(OrderSuccess);