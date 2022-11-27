/**
 * 
 * Selettore dell'hub
 * 
 * Attributi
 * - service        Id del servizio che l'hub deve poter erogare
 * - visible        Indica se la mappa è attualmente visibile
 * 
 * Callback
 * - onSelected(hub)     Richiamato quando viene selezionato un hub
 * 
 */

import React from "react";
import $ from "jquery";
import HubAPI from "modules/api/hub";
import CustomerAPI from "modules/api/customer";
import { getUsername } from "modules/auth";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import MapPositionController from "./MapController";


const HUB_ICON = new L.icon({
    iconUrl: `${process.env.REACT_APP_DOMAIN}/img/markers/shop.png`,
    iconSize: [35, 35]
});

const SELECTED_HUB_ICON = new L.icon({
    iconUrl: `${process.env.REACT_APP_DOMAIN}/img/markers/shop_orange.png`,
    iconSize: [35, 35]
});

const MAP_CENTER = [42.744388161339, 12.0809380292276]


class HubSelector extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hubs: [],
            user_coordinates: { lat: MAP_CENTER[0], lon: MAP_CENTER[1] },
            selected_hub: "",

            error_message: "",
        };

        this.map = null;
    }
    
    async componentDidMount() {
        try {
            // Estrazione indirizzo cliente
            const user_data = await CustomerAPI.getAllDataByUsername(await getUsername());

            const address_data = await $.ajax({
                method: "GET", url: "https://nominatim.openstreetmap.org/search",
                data: {
                    street: `${user_data.address.number} ${user_data.address.street}`,
                    city: `${user_data.address.city}`, postalcode: `${user_data.address.postal_code}`, country: "italy",
                    format: "json", limit: 1
                }
            });

            this.setState({ user_coordinates: { lat: address_data[0].lat, lon: address_data[0].lon } });
        }
        catch (err) {
            this.setState({ user_coordinates: { lat: MAP_CENTER[0], lon: MAP_CENTER[1] } });
        }
    }

    async componentDidUpdate(prev_props, prev_state) {
        if (!this.props.visible) { return; }

        this.map.invalidateSize(); // Per evitare problemi di render della mappa
        
        $("#__loading-hub-selector").show();
        
        try {
            let hubs = await HubAPI.getNearestFrom(this.state.user_coordinates.lat, this.state.user_coordinates.lon, 1000, 0, this.props.service);

            if (JSON.stringify(prev_props) === JSON.stringify(this.props) &&
                (prev_state.user_coordinates.lat === this.state.user_coordinates.lat && prev_state.user_coordinates.lon === this.state.user_coordinates.lon) &&
                JSON.stringify(prev_state.hubs) === JSON.stringify(hubs)) { 

                return $("#__loading-hub-selector").hide();
            }

            if (hubs.length > 0) {
                this.map.flyTo([hubs[0].position.coordinates[1], hubs[0].position.coordinates[0]], 12, { duration: 1 });
            }
            this.setState({ hubs: hubs });
        }
        catch (err) {
            this.setState({ error_message: "Si è verificato un errore" });
        }

        $("#__loading-hub-selector").hide();
    }

    render() {
        return (
            <div className="container-fluid" style={{ height: this.props.style.height }}>
                <p className="invalid-feedback d-block fs-5 fw-semibold text-center" aria-live="assertive">{this.state.error_message}</p>

                <div className={`d-flex justify-content-center`}>
                    <div id="__loading-hub-selector" className="spinner-border" role="status">
                        <span className="visually-hidden">Caricamento degli hub</span>
                    </div>
                </div>

                <div className="row" style={{ height: this.props.style.height }}>
                    <div className="col-12 col-md-6" aria-hidden="true">
                        <div style={{ height: this.props.style.height, width: "100%" }}>
                            <MapContainer center={MAP_CENTER} zoom={5} style={{ width: "100%", height: "100%" }} >
                                <MapPositionController setMap={(map) => this.map = map} />
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />

                                {
                                    this.state.hubs.map((hub) => (
                                        <Marker key={hub.code} position={[hub.position.coordinates[1], hub.position.coordinates[0]]} 
                                                icon={this.state.selected_hub.code === hub.code ? SELECTED_HUB_ICON : HUB_ICON} eventHandlers={{ click: () => this.handleHubSelection(hub) }} >
                                            <Popup>
                                                <div className="fw-semibold">{hub.name}</div>
                                                <div>{hub.address.street} {hub.address.number}, {hub.address.city}</div>
                                            </Popup>
                                        </Marker>
                                    ))
                                }
                            </MapContainer>
                        </div>
                    </div>

                    <div className="col-12 col-md-6" style={{ height: this.props.style.height, overflow: "auto" }}>
                        <div className="list-group w-100">
                            {
                                this.state.hubs.map((hub) => (
                                    <button key={hub.code} type="button" onClick={() => this.handleHubSelection(hub)}
                                            className={`list-group-item list-group-item-action list-group-item-light ${this.state.selected_hub.code === hub.code ? "active" : ""}`} >
                                        <div className="fw-semibold fs-5">{hub.name}</div>
                                        <div>{hub.address.street} {hub.address.number}, {hub.address.city}</div>
                                    </button>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    handleHubSelection(hub) {
        this.setState({ selected_hub: hub });
        this.map.flyTo([hub.position.coordinates[1], hub.position.coordinates[0]], 12, { duration: 1 });

        if (this.props.onSelected) {
            this.props.onSelected(hub);
        }
    }
}

export default HubSelector;