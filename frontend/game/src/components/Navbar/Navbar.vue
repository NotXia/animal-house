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
                    <a v-if="!is_auth" :href="`${DOMAIN}/fo/my-animals`" class="nav-link active">Presentati</a>
                    <a v-if="is_auth" :href="`${DOMAIN}/fo/vip`" class="nav-link active">VIP</a>
                </div>

                <div class="d-flex justify-content-end w-100">
                    <div v-if="username" class="dropdown d-inline-block">
                        <button class="btn dropdown-toggle text-dark p-0" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <div class="d-inline-block">
                                <div class="d-flex align-items-center">
                                    <span class="align-top me-2">{{ name }} {{ surname }}</span>
                                    <div class="d-flex align-items-center justify-content-center border border-dark rounded-circle overflow-hidden" style="height: 2.2rem; width: 2.2rem">
                                        <div class="d-flex justify-content-center align-items-center">
                                            <img :src="picture" alt="Immagine di profilo" style="max-height: 2.2rem" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li><span class="dropdown-item-text fw-bold" aria-label="Username corrente">{{ username }}</span></li>
                            <div class="dropdown-divider"></div>
                            <li><a class="dropdown-item" :href="`/fo/profile?username=${username}`">Profilo</a></li>
                            <li><a class="dropdown-item" href="/fo/my-animals">I miei animali</a></li>
                            <li><a class="dropdown-item" href="/fo/appointments">I miei appuntamenti</a></li>
                            <li><a class="dropdown-item" href="/fo/shop/orders">I miei ordini</a></li>
                            <li><a class="dropdown-item" href="/fo/settings">Impostazioni</a></li>
                            <li><a class="dropdown-item" href="/fo/logout">Logout</a></li>
                        </ul>
                    </div>

                    <div v-if="!username">
                        <a class="btn btn-primary text-decoration-none mx-1" :href="`${DOMAIN}/fo/signup`">Registrati</a>
                        <a class="btn btn-primary text-decoration-none mx-1" :href="`${DOMAIN}/fo/login?return=${LOCATION_HREF}`">Login</a>
                    </div>
                </div>

            </div>
        </div>
    </nav>
</template>

<script>
    import "bootstrap"; 
    import { isAuthenticated, getUsername } from "modules/auth";
    import UserAPI from "modules/api/user";

    export default {
        name: "navbar",
        
        data() {
            return {
                is_auth: false,
                username: null,
                name: null,
                surname: null,
                picture: null
            }
        },
        
        computed: {
            DOMAIN() { return process.env.VUE_APP_DOMAIN; },
            LOCATION_HREF() { return window.location.href; }
        },

        async mounted() {
            this.is_auth = await isAuthenticated();

            if (this.is_auth) {
                const user = await UserAPI.getProfile(await getUsername());

                this.name = user.name,
                this.surname = user.surname,
                this.username = user.username,
                this.picture = user.picture ? `${process.env.VUE_APP_DOMAIN}${user.picture}` : `${process.env.VUE_APP_DOMAIN}/profiles/images/default.png`
            }
        },
    }
</script>

<style lang="scss">
    @import "../../scss/bootstrap.scss";
</style>