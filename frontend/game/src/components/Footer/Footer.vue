<template>
    <footer class="mt-3">
        <div class="w-100 text-center">
            <router-link to="/" class="link-dark mx-2">Home</router-link>
            <router-link to="/services" class="link-dark mx-2">Servizi</router-link>
            <hr>
            Animal House
        </div>
    </footer>
</template>

<script>
    import "bootstrap"; 
    import "bootstrap/dist/css/bootstrap.min.css";

    export default {
        name: "footer",
    }
</script>

