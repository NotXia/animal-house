<script>
    import "bootstrap"; 
    import "bootstrap/dist/css/bootstrap.min.css";
    import Navbar from "../../components/Navbar/Navbar.vue";
    import AHFooter from "../../components/AHFooter/AHFooter.vue";
    import Loading from "../../components/Loading/Loading.vue";
    import "leaflet/dist/leaflet.css";
    import L from "leaflet";
    import CustomerAPI from "modules/api/customer";
    import HubAPI from "modules/api/hub";
    import { getUsername, isAuthenticated } from "modules/auth";
    import $ from "jquery";
    import HubRow from "./components/HubRow.vue";

    const CENTER = { lat: 42.744388161339, lon: 12.0809380292276 }
    const HUB_MARKER_ICON = new L.Icon({
        iconUrl: `${process.env.VUE_APP_DOMAIN}/img/markers/shop.png`,
        iconSize: [30, 30]
    });

    export default {
        name: "hubs",
        components: { Navbar, AHFooter, Loading, HubRow },
        data() {
            return {
                hubs: [],

                map: null,
                marker_layer: null,

                loading: false,
                error_message: ""
            }
        },

        watch: {
            hubs: function () {
                this.marker_layer.clearLayers();

                for (const hub of this.hubs) {
                    const marker = new L.marker(
                        [hub.position.coordinates[1], hub.position.coordinates[0]], 
                        { icon: HUB_MARKER_ICON, keyboard: false }
                    ).on("click", async () => {
                        this.loading = true;
                        
                        // Riorganizza gli hub in base alla posizione di quello cliccato
                        this.hubs = await HubAPI.getNearestFrom(hub.position.coordinates[1], hub.position.coordinates[0], 100);
                        this.map.flyTo([hub.position.coordinates[1], hub.position.coordinates[0]], 13, { duration: 0.8 });

                        this.loading = false;
                    });

                    this.marker_layer.addLayer(marker);
                }
            }
        },

        async mounted() {
            try {
                this.loading = true;

                // Caricamento mappa
                this.map = L.map("map-hub").setView([CENTER.lat, CENTER.lon], 5);
                L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                }).addTo(this.map);

                this.map.on("moveend", async () => {
                    const map_center = this.map.getCenter();
                    this.hubs = await HubAPI.getNearestFrom(map_center.lat, map_center.lng, 100);
                });

                // Creazione livello per i marker
                this.marker_layer = new L.LayerGroup();
                this.marker_layer.addTo(this.map);

                // Per gli utenti autenticati, cerca prima gli hub più vicini
                if (await isAuthenticated()) {
                    try {
                        // Estrazione coordinate cliente
                        const user_data = await CustomerAPI.getAllDataByUsername(await getUsername());
                        const address_data = await $.ajax({
                            method: "GET", url: "https://nominatim.openstreetmap.org/search",
                            data: {
                                street: `${user_data.address.number} ${user_data.address.street}`,
                                city: `${user_data.address.city}`, postalcode: `${user_data.address.postal_code}`, country: "italy",
                                format: "json", limit: 1
                            }
                        });

                        // Caricamento hub ordinati
                        this.hubs = await HubAPI.getNearestFrom(address_data[0].lat, address_data[0].lon, 100);

                        this.map.flyTo([this.hubs[0].position.coordinates[1], this.hubs[0].position.coordinates[0]], 13, { duration: 0.8 });
                    }
                    catch (err) { 
                        this.hubs = await HubAPI.getNearestFrom(CENTER.lat, CENTER.lon, 100);
                    }
                }
                else { // Utente non autenticato
                    this.hubs = await HubAPI.getNearestFrom(CENTER.lat, CENTER.lon, 100);
                }
            }
            catch (err) {
                this.error_message = "Si è verificato un errore durante il caricamento della pagina";
            }
            
            this.loading = false;
        }
    }
</script>

<template>
    <Navbar />
    <Loading v-if="this.loading" />
    
    <main>
        <div class="container">
            <div class="row">
                <h1>Le nostre sedi</h1>
                <p class="text-center text-danger fw-semibold fs-5" v-if="error_message">{{ this.error_message }}</p>
            </div>
            
            <div class="row">
                
                <div class="col-12 col-md-8" aria-hidden="true">
                    <div id="map-hub" style="height: 70vh; width: 100%;"></div>
                </div>

                <div class="col-12 col-md-4 overflow-auto" style="max-height: 70vh">
                    <section aria-label="Lista degli hub">
                        <ul>
                            <li class="list-group-item" v-for="hub in hubs" :key="hub.code">
                                <div class="visually-hidden"><HubRow :hub="hub" /></div>
    
                                <button class="btn button-hub p-0 m-0 w-100 border-top border-bottom" style="border-radius: 0;" aria-hidden="true"
                                        @click="this.map.flyTo([hub.position.coordinates[1], hub.position.coordinates[0]], 13, { duration: 0.8 });">
                                    <HubRow :hub="hub" />
                                </button>
                            </li>
                        </ul>
                    </section>
                </div>

            </div>
        </div>
    </main>

    <AHFooter />
</template>

<style scoped>
    .button-hub:hover {
        background-color: #f0f0f0;
    }
</style>