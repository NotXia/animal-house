<script>
    import "bootstrap"; 
    import "bootstrap/dist/css/bootstrap.min.css";
import { computed } from "vue";

    export default {
        name: "hub_row",
        props: {
            hub: Object
        }
    }
</script>

<template>
    <div class="d-flex justify-content-between p-3">
        <div class="visually-hidden">
            Hub {{ hub.name }}.
            Indirizzo: {{ hub.address.street }} {{ hub.address.number }}, {{ hub.address.city }}.
        </div>
        <div aria-hidden="true">
            <p class="m-0 fw-semibold fs-5 text-start">{{ hub.name }}</p>
            <p class="m-0 fs-6 text-start">{{ hub.address.city }}</p>
            <p class="m-0 fs-6 text-start">{{ hub.address.street }} {{ hub.address.number }}</p>
        </div>

        <div>
            <div class="d-flex justify-content-center align-items-center h-100 w-100">
                <a class="btn btn-outline-primary" :href="`/fo/appointments/book?hub=${hub.code}`">
                    Prenota <span class="visually-hidden">un servizio all'hub {{hub.name}}</span>
                </a>
            </div>
        </div>
    </div>
</template>