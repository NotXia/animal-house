<template>
    <nav class="navbar navbar-expand-lg bg-light">
        <div class="container-fluid">
            <router-link to="/" class="navbar-brand">Navbar</router-link>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
                <div class="navbar-nav">
                    <router-link to="/" class="nav-link active">Home</router-link>
                    <router-link to="/services" class="nav-link active">Servizi</router-link>
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
    }
</script>

