<script>
    import "bootstrap"; 
    import "bootstrap/dist/css/bootstrap.min.css";
    import Navbar from "../../components/Navbar/Navbar.vue";
    import AHFooter from "../../components/AHFooter/AHFooter.vue";

    export default {
        name: "GameView",
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
            <div class="row">
                <h1>Giochi</h1>
            </div>

            <div class="row">
                <div class="col-12 col-md-6">
                    <a class="btn btn-outline-primary w-100 py-4 my-2 fs-4" href="/play/curiosity">
                        <div>
                            <img :src="`${DOMAIN}/img/icons/curiosity.png`" alt="" style="height: 7rem;">
                        </div>
                        Curiosità
                    </a>
                </div>
                
                <div class="col-12 col-md-6">
                    <a class="btn btn-outline-primary w-100 py-4 my-2 fs-4" href="/play/quiz">
                        <div>
                            <img :src="`${DOMAIN}/img/icons/quiz.png`" alt="" style="height: 7rem;">
                        </div>
                        Quiz
                    </a>
                </div>

                <div class="col-12 col-md-6">
                    <a class="btn btn-outline-primary w-100 py-4 my-2 fs-4" href="/play/hangman">
                        <div>
                            <img :src="`${DOMAIN}/img/icons/hangman.png`" alt="" style="height: 7rem;">
                        </div>
                        Impiccato
                    </a>
                </div>

                <div class="col-12 col-md-6">
                    <a class="btn btn-outline-primary w-100 py-4 my-2 fs-4" href="/play/memory">
                        <div>
                            <img :src="`${DOMAIN}/img/icons/memory.png`" alt="" style="height: 7rem;">
                        </div>
                        Memory
                    </a>
                </div>
            </div>
        </div>
    </main>

    <AHFooter />
</template>