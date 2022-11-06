<script>
    import "bootstrap"; 
    import "bootstrap/dist/css/bootstrap.min.css";
    import Navbar from "../../components/Navbar/Navbar.vue";
    import AHFooter from "../../components/AHFooter/AHFooter.vue";
    import ServiceAPI from "modules/api/service";
    import SpeciesAPI from "modules/api/species";
    import ServiceRow from "./components/ServiceRow.vue";

    export default {
        name: "services",
        components: { Navbar, AHFooter, ServiceRow },
        data() {
            return {
                services_list: [],
                species_list: [],
                curr_species_filter: null
            }
        },
        mounted() {
            this.fetchServices();
        },

        methods: {
            async fetchServices() {
                try {
                    this.services_list = await ServiceAPI.getServices();
                    this.species_list = await SpeciesAPI.getSpecies();
                }
                catch (err) {
                    console.log(err)
                }
            },

            speciesFilterHandler(e) {
                if (this.curr_species_filter === e.target.value) {
                    this.curr_species_filter = null;
                    e.target.checked = false;
                }
                else {
                    this.curr_species_filter = e.target.value;
                    e.target.checked = true;
                }
            }
        },

        computed: {
            filteredServices() {
                if (!this.curr_species_filter) { return this.services_list; }

                let services = this.services_list.filter((service) => service.target.includes(this.curr_species_filter))
                return services;
            }
        }
    }
</script>

<template>
    <Navbar />

    <main>
        <div class="container">
            <div class="row">
                <h1>Servizi</h1>
            </div>

            <section aria-label="Filtro servizi">
                <div class="row">
                    <fieldset>
                        <div class="d-flex flex-nowrap overflow-auto">
                            <span class="container-species me-2" v-for="species in species_list" :key="species.name">
                                <input type="radio" name="species" :value="species.name" className="visually-hidden" :id="species.name" @click="speciesFilterHandler">
                                <label :for="species.name">
                                    <div class="d-flex align-items-center">
                                        <img :src="`data:image/png;base64,${species.logo}`" alt="" style="height: 1.5rem" class="me-2">
                                        {{ species.name }}
                                    </div>
                                </label>
                            </span>
                        </div>
                    </fieldset>
                </div>
            </section>

            <section aria-label="Lista dei servizi">
                <div class="row">
                    <ul>
                        <li class="list-group-item my-2" v-for="service in filteredServices" :key="service.id">
                            <ServiceRow :service="service" />
                        </li>
                    </ul>
                </div>
            </section>
        </div>

    </main>

    <AHFooter />
</template>

<style scoped>
    .container-species label {
        border: 1px solid #cecece;
        border-radius: 1rem;
        cursor: pointer;
        text-align: center;
        padding: 0.5rem;
        padding-left: 1rem;
        padding-right: 1rem;
        -webkit-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }
    .container-species label:hover {
        border: 1px solid #c2c2c2;
        background-color: #f5f5f5;
    }

    .container-species input[type="radio"]:checked+label {
        border: 1px solid #888888;
        background-color: #f5f5f5;
    }
</style>