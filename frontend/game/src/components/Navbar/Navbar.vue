<template>
    <nav class="navbar navbar-expand-lg mb-3" style="background-color: #9ed700;">
        <div class="container-fluid">
            <router-link to="/" class="navbar-brand">
                <div class="d-flex align-items-center justify-content-center">
                    <img :src="`${DOMAIN}/logos/logo.png`" alt="" style="max-height: 2rem; max-width: 2rem;">
                </div>
            </router-link>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
                <div class="navbar-nav">
                    <router-link to="/" class="nav-link active">Home</router-link>
                    <a :href="`${DOMAIN}/fo/shop`" class="nav-link active">Shop</a>
                    <router-link to="/services-list" class="nav-link active">Servizi</router-link>
                    <router-link to="/hubs-list" class="nav-link active">Sedi</router-link>
                    <a :href="`${DOMAIN}/fo/forum`" class="nav-link active">Forum</a>
                </div>

                <div class="d-flex justify-content-end w-100">
                    <a class="btn btn-outline-primary text-decoration-none mx-1" :href="`${DOMAIN}/fo/signup`">Registrati</a>
                    <a class="btn btn-outline-primary text-decoration-none mx-1" :href="`${DOMAIN}/fo/login?return=${LOCATION_HREF}`">Login</a>
                </div>
            </div>
        </div>
    </nav>
</template>

<script>
    import "bootstrap"; 
    import "bootstrap/dist/css/bootstrap.min.css";

    export default {
        name: "navbar",

        computed: {
            DOMAIN() { return process.env.VUE_APP_DOMAIN; },
            LOCATION_HREF() { return window.location.href; }
        }
    }
</script>

