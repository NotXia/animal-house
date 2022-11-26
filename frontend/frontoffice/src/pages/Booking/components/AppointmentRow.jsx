import React from "react";
import ServiceAPI from "modules/api/service";
import HubAPI from "modules/api/hub";
import AnimalAPI from "modules/api/animals";
import BookingAPI from "modules/api/booking";
import moment from "moment";


class AppointmentCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            animal: null,
            service: null,
            hub: null,

            error_message: "",
        };
    }
    
    async componentDidMount() {
        try {
            const animal = await AnimalAPI.getAnimalById(this.props.appointment.animal_id);
            const service = await ServiceAPI.getServiceById(this.props.appointment.service_id);
            const hub = await HubAPI.getByCode(this.props.appointment.hub);

            this.setState({
                animal: animal,
                service: service,
                hub: hub
            });
        }
        catch (err) {
            this.setState({ error_message: "Non è stato possibile caricare l'appuntamento" });
        }
    }

    render() {
        return (<>
            <div className="w-100 border rounded p-2 py-3">
                <p className="invalid-feedback d-block fs-5 fw-semibold text-center m-0" aria-live="assertive">{this.state.error_message}</p>
                
                <p className="fs-5 fw-semibold text-center mb-1">{ moment(this.props.appointment.time_slot.start).format("DD/MM/YYYY HH:mm") }</p>
                {
                    (this.state.animal && this.state.service && this.state.hub) && 
                    (<>
                        <div className="d-flex justify-content-center align-items-center">
                            <div className="d-flex justify-content-center align-items-center" style={{ height: "2rem", width: "2rem", borderRadius: "50%", overflow: "hidden" }}>
                                <img src={this.state.animal.image_path ? `${process.env.REACT_APP_DOMAIN}${this.state.animal.image_path}` : `${process.env.REACT_APP_DOMAIN}/animals/images/default.png`} alt="" 
                                    style={{ maxHeight: "100%", maxWidth: "100%" }} />
                            </div>

                            <span className="text-truncate fw-semibold ms-2">{ this.state.animal.name }</span>
                        </div>

                        <p className="text-truncate text-center m-0 mt-2"><span className="fw-semibold fs-5">{ this.state.service.name }</span></p>
                        <p className="text-center m-0">
                            {
                                this.state.service.online ?
                                    <span>Online</span>
                                :
                                    <span>Hub in {this.state.hub.address.street} {this.state.hub.address.number}</span>
                            }
                        </p>

                    </>)
                }

                <div className="d-flex justify-content-center">
                    {
                        !this.props.appointment.paid && 
                        <a className="btn btn-sm btn-outline-primary me-2 mt-2" href={`/fo/appointments/book?appointment=${this.props.appointment.id}`}>Completa pagamento</a>
                    }
                    {
                        (!moment(this.props.appointment.time_slot.start).isSame(moment(), "day")) && // Non si possono annullare appuntamenti di oggi
                        <button className="btn btn-sm btn-outline-danger mt-2" data-bs-toggle="modal" data-bs-target={`#__modal-delete-${this.props.appointment.id}`}>Cancella</button>
                    }
                </div>
            </div>

            {/* Modale conferma cancellazione */}
            <div className="modal fade" id={`__modal-delete-${this.props.appointment.id}`} tabIndex="-1" aria-labelledby={`__modal-label-delete-${this.props.appointment.id}`} aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="modal-title fs-5" id={`__modal-label-delete-${this.props.appointment.id}`}>Conferma cancellazione</h2>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Annulla"></button>
                        </div>
                        <div className="modal-body">
                            Stai cancellando l'appuntamento per {this.state.animal?.name} del {moment(this.props.appointment.time_slot.start).format("DD/MM/YYYY")} alle {moment(this.props.appointment.time_slot.start).format("HH:mm")}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">Annulla</button>
                            <button type="button" className="btn btn-outline-danger" data-bs-dismiss="modal" onClick={() => this.deleteAppointment()}>Cancella appuntamento</button>
                        </div>
                    </div>
                </div>
            </div>
        </>);
    }

    async deleteAppointment() {
        try {
            await BookingAPI.deleteAppointmentById(this.props.appointment.id);

            if (this.props.onDelete) {
                this.props.onDelete(this.props.appointment);
            }
        }
        catch (err) {
            this.setState({ error_message: "Non è stato possibile cancellare l'appuntamento" });
        }
    }
}

export default AppointmentCard;