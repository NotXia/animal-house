<script>
    import "bootstrap"; 
    import "bootstrap/dist/css/bootstrap.min.css";
    import { centToPrice } from "modules/currency.js";

    export default {
        name: "service_row",
        methods: { centToPrice },
        props: {
            service: Object
        }
    }
</script>

<template>
    <div class="container-fluid border border-secondary rounded p-4">
        <div class="row">
            <div class="col-8 col-lg-10">
                <h2>{{ service.name }}</h2>
                <p class="m-0 fs-5">Prezzo: {{ centToPrice(service.price) }}€</p>
                <p class="m-0 fs-5">Durata: {{ service.duration }} min.</p>
                <p style="white-space: pre-line" class="m-0 mt-2">{{ service.description }}</p>
            </div>

            <div class="col-4 col-lg-2">
                <div class="d-flex justify-content-center align-items-center h-100 w-100">
                    <a class="btn btn-outline-primary" :href="`/fo/book?service=${service.id}`">Prenota ora</a>
                </div>
            </div>
        </div>
    </div>
</template>