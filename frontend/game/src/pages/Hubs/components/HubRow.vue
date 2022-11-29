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
    <div class="d-flex justify-content-between border-top border-bottom py-3 px-2">
        <div class="visually-hidden">
            <p>Hub {{ hub.name }}.</p>
            <p>Indirizzo: {{ hub.address.street }} {{ hub.address.number }}, {{ hub.address.city }}</p>
        </div>

        <div aria-hidden="true">
            <p class="m-0 fw-semibold fs-5">{{ hub.name }}</p>
            <p class="m-0 fs-6">{{ hub.address.city }}</p>
            <p class="m-0 fs-6">{{ hub.address.street }} {{ hub.address.number }}</p>
        </div>

        <div>
            <div class="d-flex justify-content-center align-items-center h-100 w-100">
                <a class="btn btn-outline-primary" :href="`/fo/appointments/book?hub=${hub.code}`">Prenota</a>
            </div>
        </div>
    </div>
</template>