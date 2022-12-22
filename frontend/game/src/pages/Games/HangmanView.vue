<script>
    import "bootstrap"; 
    import "bootstrap/dist/css/bootstrap.min.css";
    import Navbar from "../../components/Navbar/Navbar.vue";
    import AHFooter from "../../components/AHFooter/AHFooter.vue";
    import Loading from "../../components/Loading/Loading.vue";
    import { isAuthenticated } from "modules/auth";
    import GameAPI from "modules/api/games";
    import he from "he";

    export default {
        name: "HangmanView",
        components: { Navbar, AHFooter, Loading },

        data() {
            return {
                game_id: null,
                game_end: false,
                word: "",
                attempts: [],

                is_loading: false
            }
        },

        computed: {
            DOMAIN() { return process.env.VUE_APP_DOMAIN; },
            LETTERS() { return ("ABCDEFGHIJKLMNOPQRSTUVWXYZ").split(""); }
        },

        methods: {
            async startGame() {
                this.is_loading = true;

                const game_data = await GameAPI.hangman.startGame(!await isAuthenticated());
                this.game_id = game_data.game_id;
                this.word = game_data.word;
                this.attempts = [];
                this.game_end = false;

                this.is_loading = false;
            },

            async submitLetter(letter) {
                this.is_loading = true;

                const game_data = await GameAPI.hangman.sendLetter(this.game_id, letter);
                console.log(game_data)
                this.word = game_data.word;
                this.attempts = game_data.attempts;
                if (game_data.points !== undefined) {
                    this.points = game_data.points;
                    this.game_end = true;
                }

                this.is_loading = false;
            }
        }
    }

</script>

<template>
    <Navbar />
    <Loading v-if="is_loading" />

    <main style="height: 80vh">
        <div v-if="!game_id" class="d-flex align-items-center justify-content-center h-100">
            <div class="text-center">
                <h1>Gioco dell'impiccato</h1>
                <p class="fs-5">Metti alla prova la tua capacità di indovinare gli animali</p> 
                <button class="btn btn-outline-primary btn-lg px-4 py-2" :onclick="startGame">Inizia</button>
            </div>
        </div>

        <div v-if="game_id" class="d-flex align-items-center justify-content-center h-100">
            <div v-if="!game_end" class="container">
                <div class="row" style="min-height: 20vh">
                    <div class="col-12 col-md-6 text-center">
                        X_X
                    </div>
                    <div class="col-12 col-md-6 text-center">
                        <p class="fs-1 m-0">{{word}}</p>
                    </div>
                </div>

                <div class="row p-1">
                    <button v-for="letter in LETTERS" class="col-2 col-md-1 btn btn-outline-primary m-0 m-md-1 fs-5" 
                            :onclick="() => submitLetter(letter)" :disabled="attempts.includes(letter.toLowerCase())">
                        {{ letter }}
                    </button>
                </div>
            </div>

            <div v-if="game_end" class="text-center">
                <p class="fs-1">{{ points === 0 ? "La prossima volta andrà meglio" : "Congratulazioni!" }}</p>
                <p class="fs-4 m-0">Hai ottenuto {{ points }} punti</p>
                <p class="fs-4 m-0">La parola era {{ word.toUpperCase() }}</p>

                <button class="btn btn-outline-primary mt-3" :onclick="startGame">Gioca di nuovo</button>
            </div>

        </div>
    </main>

    <!-- <AHFooter /> -->
</template>