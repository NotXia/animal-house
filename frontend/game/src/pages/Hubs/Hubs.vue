<script>
    import "bootstrap"; 
    import "bootstrap/dist/css/bootstrap.min.css";
    import Navbar from "../../components/Navbar/Navbar.vue";
    import AHFooter from "../../components/AHFooter/AHFooter.vue";
    import Loading from "../../components/Loading/Loading.vue";

    export default {
        name: "hubs",
        components: { Navbar, AHFooter, Loading },
        data() {
            return {
                loading: false,
                error_message: ""
            }
        },

        async mounted() {
            try {
                this.loading = true;
            }
            catch (err) {
                this.error_message = "Si è verificato un errore durante il caricamento della pagina";
            }
            this.loading = false;
        }
    }
</script>

<template>
    <Navbar />
    <Loading v-if="this.loading" />
    
    <main>
        <div class="container">
            <div class="row">
                <h1>Le nostre sedi</h1>
                <p class="text-center text-danger fw-semibold fs-5" v-if="error_message">{{ this.error_message }}</p>
            </div>

        </div>

    </main>

    <AHFooter />
</template>

<style scoped>
</style>