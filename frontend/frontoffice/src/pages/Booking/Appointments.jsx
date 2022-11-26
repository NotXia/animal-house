import React from "react";
import { Helmet } from "react-helmet";
import Navbar from "../../components/Navbar";
import { getUsername, isAuthenticated } from "modules/auth.js";
import moment from "moment";
import BookingAPI from "modules/api/booking";
import Loading from "../../components/Loading";
import AppointmentRow from "./components/AppointmentRow";


class Appointments extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            appointments_today: [],
            appointments_tomorrow: [],
            appointments_other: [],

            error_message: "",
        };
        
        this.loading = React.createRef();

        isAuthenticated().then(is_auth => { if (!is_auth) { window.location = `${process.env.REACT_APP_BASE_PATH}/login?return=${window.location.href}`; } } );
    }
    
    componentDidMount() {
        this.loading.current.wrap(async () => {
            try {
                let appointments = await BookingAPI.getAppointmentsOf(await getUsername());
                appointments = appointments.filter((appointment) => moment(appointment.time_slot.start).isSameOrAfter(moment(), "day")); // Rimuove gli appuntamenti vecchi
                appointments.sort((a1, a2) => moment(a1.time_slot.start).diff(moment(a2.time_slot.start)));

                this.setState({
                    appointments_today:     appointments.filter((appointment) => moment(appointment.time_slot.start).isSame(moment(), "day")),
                    appointments_tomorrow:  appointments.filter((appointment) => moment(appointment.time_slot.start).isSame(moment().add(1, "days"), "day")),
                    appointments_other:     appointments.filter((appointment) => moment(appointment.time_slot.start).isAfter(moment().add(1, "days"), "day")),
                });
            }
            catch (err) {
                this.setState({ error_message: "Non è stato possibile trovare gli appuntamenti" });
            }
        });
    }

    render() {
        return (<>
            <Helmet>
                <title>I miei appuntamenti</title>
            </Helmet>

            <Navbar />
            <Loading ref={this.loading} />
            
            <main className="mt-3">
                <div className="container">
                    <div className="row">
                        <h1>I miei appuntamenti</h1>
                        <p className="invalid-feedback d-block fs-5 fw-semibold text-center" aria-live="assertive">{this.state.error_message}</p>
                    </div>

                    {/* Appuntamenti di oggi */}
                    {
                        this.state.appointments_today.length > 0 &&
                        <section aria-label="Appuntamenti di oggi">
                            <div className="row"><h2>Oggi</h2></div>
                            <div className="row mb-3">
                                { this.renderAppointments(this.state.appointments_today) }
                            </div>
                        </section>
                    }

                    {/* Appuntamenti di domani */}
                    {
                        this.state.appointments_tomorrow.length > 0 &&
                        <section aria-label="Appuntamenti di domani">
                            <div className="row"><h2>Domani</h2></div>
                            <div className="row mb-3">
                                { this.renderAppointments(this.state.appointments_tomorrow) }
                            </div>
                        </section>
                    }

                    {/* Appuntamenti rimanenti */}
                    {
                        this.state.appointments_other.length > 0 &&
                        <section aria-label="Appuntamenti successivi">
                            <div className="row"><h2>Prossimamente</h2></div>
                            <div className="row mb-3">
                                { this.renderAppointments(this.state.appointments_other) }
                            </div>
                        </section>
                    }
                </div>
            </main>
        </>);
    }

    renderAppointments(appointments) {
        return appointments.map((appointment) => (
            <div key={appointment.id} className="col-12 col-md-6 col-lg-4 mb-3">
                <AppointmentRow appointment={appointment} onDelete={(appointment) => { this.deleteAppointment(appointment) }} />
            </div>
        ))
    }

    deleteAppointment(deleted_appointment) {
        let appointments_today =    this.state.appointments_today.filter((appointment) => appointment.id != deleted_appointment.id);
        let appointments_tomorrow = this.state.appointments_tomorrow.filter((appointment) => appointment.id != deleted_appointment.id);
        let appointments_other =    this.state.appointments_other.filter((appointment) => appointment.id != deleted_appointment.id);

        this.setState({
            appointments_today: appointments_today,
            appointments_tomorrow: appointments_tomorrow,
            appointments_other: appointments_other
        })
    }
}

export default Appointments;