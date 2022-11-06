<script>
    import "bootstrap"; 
    import "bootstrap/dist/css/bootstrap.min.css";
    import Navbar from "../../components/Navbar/Navbar.vue";
    import AHFooter from "../../components/AHFooter/AHFooter.vue";
    import ServiceAPI from "../../import/api/service";
    import ServiceRow from "./components/ServiceRow.vue";

    export default {
        name: "services",
        components: { Navbar, AHFooter, ServiceRow },
        data() {
            return {
                services_list: []
            }
        },
        mounted() {
            this.fetchServices();
        },

        methods: {
            async fetchServices() {
                try {
                    const services = await ServiceAPI.getServices();
                    console.log(services)
                    this.services_list = services;
                }
                catch (err) {
                    console.log(err)
                }
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

            <section aria-label="Lista dei servizi">
                <div class="row">
                    <ul>
                        <li class="list-group-item my-2" v-for="service in services_list" :key="service.id">
                            <ServiceRow :service="service" />
                        </li>
                    </ul>
                </div>
            </section>
        </div>

    </main>

    <AHFooter />
</template>
