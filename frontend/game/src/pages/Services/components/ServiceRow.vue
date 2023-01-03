<script>
    import "bootstrap"; 
    import "bootstrap/dist/css/bootstrap.min.css";
    import { centToPrice } from "modules/currency.js";
    import { getUserPreferences } from "modules/preferences";
    import { Tooltip } from "bootstrap";

    export default {
        name: "service_row",
        methods: { centToPrice },
        props: {
            service: Object
        },

        mounted() {
            [...document.querySelectorAll('[data-bs-toggle="tooltip"]')].map(tooltip => new Tooltip(tooltip));
        },

        computed: {
            DOMAIN() { return process.env.VUE_APP_DOMAIN; },
            mayUserBeInterested() {
                const user_preferences = getUserPreferences();
                if (!user_preferences || !user_preferences.species) { return false; }

                if (this.service.target.length === 0) { return true; } // Adatto a tutti gli animali
                
                for (const species of this.service.target) {
                    if (user_preferences.species.includes(species)) { return true; }
                }

                return false;
            }
        }
    }
</script>

<template>
    <div class="container-fluid border border-secondary rounded p-4">
        <div class="row">
            <div class="col-8 col-lg-10">
                <h2>
                    <div class="d-flex align-items-center">
                        <span v-if="mayUserBeInterested" class="visually-hidden">Potrebbe interessarti:</span>
                        {{ service.name }}
                        <img v-if="mayUserBeInterested" :src="`${DOMAIN}/img/icons/star.png`" alt="" style="width: 1.5rem" class="ms-1" aria-hidden="true" 
                             data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Potrebbe interessarti" />
                    </div>
                </h2>
                <p class="m-0 fs-5">Prezzo: {{ centToPrice(service.price) }}€</p>
                <p class="m-0 fs-5">Durata: {{ service.duration }} min.</p>
                <p style="white-space: pre-line" class="m-0 mt-2">{{ service.description }}</p>

            </div>

            <div class="col-4 col-lg-2">
                <div class="d-flex justify-content-center align-items-center h-100 w-100">
                    <a class="btn btn-outline-primary" :href="`/fo/appointments/book?service=${service.id}`">Prenota ora</a>
                </div>
            </div>
        </div>
    </div>
</template>