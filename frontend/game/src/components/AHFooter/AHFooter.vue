<template>
    <footer class="mt-5 mb-3">
        <div class="w-100 text-center">
            <router-link to="/" class="link-dark mx-2 d-inline-block">Home</router-link>
            <router-link to="/services-list" class="link-dark mx-2 d-inline-block">Servizi</router-link>
            <a :href="`${DOMAIN}/fo/shop`" className="link-dark mx-2 d-inline-block">Shop</a>
            <router-link to="/hubs-list" class="link-dark mx-2 d-inline-block">Sedi</router-link>
            <a :href="`${DOMAIN}/fo/forum`" className="link-dark mx-2 d-inline-block">Forum</a>
            <router-link to="/play" class="link-dark mx-2 d-inline-block">Giochi</router-link>
            <a v-if="!is_auth" :href="`${DOMAIN}/fo/my-animals`" className="link-dark mx-2 d-inline-block">Presentati</a>
            <a v-if="is_auth" :href="`${DOMAIN}/fo/vip`" className="link-dark mx-2 d-inline-block">VIP</a>
            <hr>
            <p className="m-0">&copy; Animal House {{ moment().format("YYYY") }}</p>
            <p className="m-0" style="font-size: 0.7rem">Questo è un progetto universitario, riferimenti a entità reali sono puramente casuali</p>
        </div>
    </footer>
</template>

<script>
    import "bootstrap"; 
    import moment from "moment";
    import { isAuthenticated } from "modules/auth";

    export default {
        name: "ah_footer",
        methods: { moment },

        data() {
            return {
                is_auth: false,
            }
        },

        async mounted() {
            this.is_auth = await isAuthenticated();
        },

        computed: {
            DOMAIN() { return process.env.VUE_APP_DOMAIN; }
        }
    }
</script>

<style lang="scss">
    @import "../../scss/bootstrap.scss";
</style>

