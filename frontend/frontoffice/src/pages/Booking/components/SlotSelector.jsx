/**
 * 
 * Selettore della data
 * 
 * Attributi
 * - hub            Codice dell'hub
 * - service        Id del servizio
 * 
 * Callback
 * - onSelected(slot)     Richiamato quando viene selezionata una data
 * 
 */

import React from "react";
import BookingAPI from "modules/api/booking";
import moment from "moment";


class SlotSelector extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            availabilities: [],
            selected_date: "",

            loading: false,
            error_message: "",
        };
    }

    render() {
        return (
            <div className="w-100">
                <label className="w-100 text-center">
                    Cerca disponibilità per il giorno
                    <input type="date" className="w-100 text-center fs-5" min={new Date().toISOString().split("T")[0]} 
                        onChange={(e) => this.fetchAvailabilities(e.target.value)} />
                </label>

                <div className="d-flex justify-content-center mt-3">
                    <div className={`${this.state.loading ? "" : "d-none"}`}>
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Caricamento dei servizi</span>
                        </div>
                    </div>

                    <div>
                        {
                            this.state.selected_date != "" && this.state.availabilities.length === 0 &&
                            (
                                <p className="fs-4">Non sono presenti disponibilità per questa data</p>
                            )
                        }
                        {
                            this.getAvailableStartTimes().map((slot) => (
                                <button key={slot} className="btn btn-outline-primary fs-5 p-2 px-4 m-2" onClick={() => this.handleSlotSelection(slot)} >
                                    {moment(slot).format("HH:mm")}
                                </button>
                            ))
                        }
                    </div>
                </div>
            </div>
        );
    }

    async fetchAvailabilities(date) {
        this.setState({ loading: true, availabilities: [] });

        try {
            date = moment(date, "YYYY-MM-DD").format()
            const availabilities = await BookingAPI.getAvailabilitiesOfDate(date, this.props.hub, this.props.service);

            this.setState({ availabilities: availabilities, selected_date: date });
        }
        catch (err) {
            this.setState({ error_message: "Non è stato possibile trovare disponibilità" })
        }

        this.setState({ loading: false });
    }

    getAvailableStartTimes() {
        let available_days = new Set();

        this.state.availabilities.forEach((availability) => available_days.add(availability.time.start));

        return Array.from(available_days);
    }

    handleSlotSelection(slot_start) {
        const slots = this.state.availabilities.filter((slot) => slot.time.start === slot_start);
        const selected_slot = slots[Math.floor(Math.random() * slots.length)]; // Se nello slot sono disponibili più operatori, ne viene selezionato uno casualmente

        if (this.props.onSelected) {
            this.props.onSelected(selected_slot);
        }
    }
}

export default SlotSelector;