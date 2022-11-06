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
    <div class="container-service container-fluid">
        <div class="row">
            <div class="col-10">
                <h2>{{ service.name }}</h2>
                <p class="m-0 fs-5">Prezzo: {{ centToPrice(service.price) }}€</p>
                <p class="m-0 fs-5">Durata: {{ service.duration }} min.</p>
                <p style="white-space: pre-line" class="m-0">{{ service.description }}</p>
            </div>

            <div class="col-2">
                <div class="d-flex justify-content-center align-items-center h-100 w-100">
                    <button class="btn btn-outline-primary">Prenota ora</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .container-service {
        border: 1px solid #c2c2c2;
        border-radius: 0.5rem;
        padding: 1rem;
    }
</style>
