<script>
    import "bootstrap"; 
    import "bootstrap/dist/css/bootstrap.min.css";
    import Navbar from "../../components/Navbar/Navbar.vue";
    import AHFooter from "../../components/AHFooter/AHFooter.vue";
    import Loading from "../../components/Loading/Loading.vue";
    import { isAuthenticated } from "modules/auth";
    import GameAPI from "modules/api/games";

    export default {
        name: "HangmanView",
        components: { Navbar, AHFooter, Loading },

        data() {
            return {
                game_id: null,
                game_end: false,
                word: "",
                attempts: [],
                failed_attempts: 0,
                points: 0,

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
                this.failed_attempts = 0;
                this.game_end = false;

                this.is_loading = false;
            },

            async submitLetter(letter) {
                this.is_loading = true;

                const game_data = await GameAPI.hangman.sendLetter(this.game_id, letter);
                this.word = game_data.word;
                this.attempts = game_data.attempts;
                this.failed_attempts = game_data.attempts.length - game_data.correct_attempts;
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
                <div class="row" style="min-height: 20vh; max-height: 40vh;">
                    <div class="col-12 col-md-6 text-center">
                        <div style="height: 35vh; max-width: 35vh;" class="mx-auto my-auto">
                            <svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 350 350" xmlns="http://www.w3.org/2000/svg">
                            <g>
                                <title>Layer 1</title>
                                <line stroke-width="5" stroke-linecap="undefined" stroke-linejoin="undefined" id="svg_1" y2="344.73982" x2="288.52019" y1="344.73982" x1="7.65234" stroke="#000" fill="none"/>
                                <line stroke-width="5" stroke-linecap="undefined" stroke-linejoin="undefined" id="svg_2" y2="6.56216" x2="148.64592" y1="343.00972" x1="148.64592" stroke="#000" fill="none"/>
                                <line stroke-width="5" stroke-linecap="undefined" stroke-linejoin="undefined" id="svg_5" y2="8.61547" x2="299.18802" y1="8.61547" x1="146.25212" stroke="#000" fill="none"/>
                                <line stroke-width="5" stroke-linecap="undefined" stroke-linejoin="undefined" id="svg_7" y2="72.34317" x2="296.56219" y1="7.8114" x1="296.56219" stroke="#000" fill="none"/>
                                <!-- Testa --> <ellipse :class="failed_attempts >= 1 ? '' : 'invisible'" stroke-width="5" ry="30.83844" rx="30.83844" id="svg_9" cy="105.14488" cx="295.82411" stroke="#000" fill="none"/>
                                <!-- Corpo --> <line :class="failed_attempts >= 2 ? '' : 'invisible'" id="svg_10" y2="238.97214" x2="296.16782" y1="138.22215" x1="296.16782" stroke-width="5" stroke="#000" fill="none"/>
                                <!-- Braccio sinistro --> <line :class="failed_attempts >= 3 ? '' : 'invisible'" transform="rotate(89.6184, 319.154, 183.831)" id="svg_16" y2="206.09317" x2="297.68677" y1="161.56777" x1="340.62099" stroke-width="5" stroke="#000" fill="none"/>
                                <!-- Braccio destro --> <line :class="failed_attempts >= 4 ? '' : 'invisible'" id="svg_18" y2="206.59568" x2="252.46072" y1="162.07028" x1="295.39495" stroke-width="5" stroke="#000" fill="none"/>
                                <!-- Gamba sinistra --> <path :class="failed_attempts >= 5 ? '' : 'invisible'" id="svg_11" d="m300.90154,240.58996l-50.00605,50.00605" transform="rotate(169.419, 275.899, 265.593)" opacity="undefined" stroke-width="5" stroke="#000" fill="none"/>
                                <!-- Gamba destra --> <line :class="failed_attempts >= 6 ? '' : 'invisible'" transform="rotate(100, 316.682, 266.274)" id="svg_13" y2="291.27693" x2="291.67921" y1="241.27088" x1="341.68526" stroke-width="5" stroke="#000" fill="none"/>
                            </g>
                            </svg>
                        </div>
                    </div>
                    <div class="col-12 col-md-6 text-center">
                        <div class="d-flex align-items-center justify-content-center h-100">
                            <p class="fs-1 m-0">{{word}}</p>
                        </div>
                    </div>
                </div>

                <div class="row p-1 mt-3">
                    <button v-for="letter in LETTERS" class="col-2 col-md-1 btn btn-outline-primary m-0 m-md-1 fs-5" 
                            :onclick="() => submitLetter(letter)" :disabled="attempts.includes(letter.toLowerCase())">
                        {{ letter }}
                    </button>
                </div>
            </div>

            <div v-if="game_end" class="text-center">
                <div v-if="points === 0" style="height: 20vh; max-width: 20vh;" class="mx-auto my-auto">
                    <svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 350 350" xmlns="http://www.w3.org/2000/svg">
                    <g>
                        <title>Layer 1</title>
                        <line stroke-width="5" stroke-linecap="undefined" stroke-linejoin="undefined" id="svg_1" y2="344.73982" x2="288.52019" y1="344.73982" x1="7.65234" stroke="#000" fill="none"/>
                        <line stroke-width="5" stroke-linecap="undefined" stroke-linejoin="undefined" id="svg_2" y2="6.56216" x2="148.64592" y1="343.00972" x1="148.64592" stroke="#000" fill="none"/>
                        <line stroke-width="5" stroke-linecap="undefined" stroke-linejoin="undefined" id="svg_5" y2="8.61547" x2="299.18802" y1="8.61547" x1="146.25212" stroke="#000" fill="none"/>
                        <line stroke-width="5" stroke-linecap="undefined" stroke-linejoin="undefined" id="svg_7" y2="72.34317" x2="296.56219" y1="7.8114" x1="296.56219" stroke="#000" fill="none"/>
                        <!-- Testa --> <ellipse stroke-width="5" ry="30.83844" rx="30.83844" id="svg_9" cy="105.14488" cx="295.82411" stroke="#000" fill="none"/>
                        <!-- Corpo --> <line id="svg_10" y2="238.97214" x2="296.16782" y1="138.22215" x1="296.16782" stroke-width="5" stroke="#000" fill="none"/>
                        <!-- Braccio sinistro --> <line transform="rotate(89.6184, 319.154, 183.831)" id="svg_16" y2="206.09317" x2="297.68677" y1="161.56777" x1="340.62099" stroke-width="5" stroke="#000" fill="none"/>
                        <!-- Braccio destro --> <line id="svg_18" y2="206.59568" x2="252.46072" y1="162.07028" x1="295.39495" stroke-width="5" stroke="#000" fill="none"/>
                        <!-- Gamba sinistra --> <path id="svg_11" d="m300.90154,240.58996l-50.00605,50.00605" transform="rotate(169.419, 275.899, 265.593)" opacity="undefined" stroke-width="5" stroke="#000" fill="none"/>
                        <!-- Gamba destra --> <line transform="rotate(100, 316.682, 266.274)" id="svg_13" y2="291.27693" x2="291.67921" y1="241.27088" x1="341.68526" stroke-width="5" stroke="#000" fill="none"/>
                    </g>
                    </svg>
                </div>
                <p class="fs-1">{{ points === 0 ? "La prossima volta andrà meglio" : "Congratulazioni!" }}</p>
                <p class="fs-4 m-0">Hai ottenuto {{ points }} punti</p>
                <p class="fs-4 m-0">La parola era {{ word.toUpperCase() }}</p>

                <button class="btn btn-outline-primary mt-3" :onclick="startGame">Gioca di nuovo</button>
            </div>

        </div>
    </main>

    <!-- <AHFooter /> -->
</template>