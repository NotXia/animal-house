<script>
    import "bootstrap"; 
    import "bootstrap/dist/css/bootstrap.min.css";
    import Navbar from "../../components/Navbar/Navbar.vue";
    import AHFooter from "../../components/AHFooter/AHFooter.vue";

    export default {
        name: "HomeView",
        components: { Navbar, AHFooter },

        computed: {
            DOMAIN() { return process.env.VUE_APP_DOMAIN; }
        }
    }
</script>

<template>
    <Navbar />

    <main>
        <div class="container">
            
            <div class="row mb-2">
                <h1 class="text-uppercase text-center fw-semibold" style="font-size: 5rem">
                    Animal House
                </h1>
                <div class="text-center fs-5 m-0">
                    <p class="fs-4 m-0">Leader nel settore della cura dei vostri amati animali</p>
                    <p class="m-0">Dal 1978 Animal House offre i migliori servizi per il benessere dei nostri amici a zampe e pinne</p>
                </div>
            </div>

            <div class="row">
                <div class="col-12 col-lg-6 my-2">
                    <a href="/services-list" class="btn btn-outline-light text-dark border border-secondary rounded-3 p-3 h-100">
                        <div class="d-flex justify-content-center">
                            <img :src="`${DOMAIN}/img/icons/service.png`" alt="" class="home-icon-small">
                        </div>
                        <h2 class="text-center fs-1">I servizi</h2>
                        <p class="m-0 fs-5">Il nostro personale qualificato offre servizi per ogni esigenza dei tuoi piccoli e grandi amici</p>
                    </a>
                </div>

                <div class="col-12 col-lg-6 my-2">
                    <a href="/fo/shop" class="btn btn-outline-light text-dark border border-secondary rounded-3 p-3 h-100">
                        <div class="d-flex justify-content-center">
                            <img :src="`${DOMAIN}/img/icons/shop.png`" alt="" class="home-icon-small">
                        </div>
                        <h2 class="text-center fs-1">Lo shop</h2>
                        <p class="m-0 fs-5">Visita il nostro e-commerce fornito con tutto ciò di cui hai bisogno per soddisfare le esigenze dei tuoi fedeli amici</p>
                    </a>
                </div>
            </div>

            <div class="row">
                <div class="col-12 col-lg-4 my-2">
                    <a href="/hubs-list" class="btn btn-outline-light text-dark border border-secondary rounded-3 p-3 h-100">
                        <div class="d-flex justify-content-center">
                            <img :src="`${DOMAIN}/img/icons/store.png`" alt="" class="home-icon">
                        </div>
                        <h2 class="text-center fs-1">Le sedi</h2>
                        <p class="m-0 fs-5">Abbiamo sedi in tutt'Italia attrezzate per offrirti un'esperienza eccellente</p>
                    </a>
                </div>

                <div class="col-12 col-lg-4 my-2">
                    <a href="/fo/forum" class="btn btn-outline-light text-dark border border-secondary rounded-3 p-3 h-100">
                        <div class="d-flex justify-content-center">
                            <img :src="`${DOMAIN}/img/icons/forum.png`" alt="" class="home-icon">
                        </div>
                        <h2 class="text-center fs-1">Il forum</h2>
                        <p class="m-0 fs-5">Unisciti anche tu al nostro forum per conoscere e conversare con altri appassionati</p>
                    </a>
                </div>

                <div class="col-12 col-lg-4 my-2">
                    <a href="/games" class="btn btn-outline-light text-dark border border-secondary rounded-3 p-3 h-100">
                        <div class="d-flex justify-content-center">
                            <img :src="`${DOMAIN}/img/icons/game.png`" alt="" class="home-icon">
                        </div>
                        <h2 class="text-center fs-1">I giochi</h2>
                        <p class="m-0 fs-5">Non sai cosa fare per passare il tempo? Prova i nostri giochi</p>
                    </a>
                </div>
            </div>

        </div>
    </main>

    <AHFooter />
</template>

<style strict>

.home-icon-small {
    width: 25%;
}

.home-icon {
    width: 35%;
}

</style>