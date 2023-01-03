<script>
    import "bootstrap"; 
    import Navbar from "../../components/Navbar/Navbar.vue";
    import AHFooter from "../../components/AHFooter/AHFooter.vue";
    import Loading from "../../components/Loading/Loading.vue";
    import { isAuthenticated } from "modules/auth";
    import GameAPI from "modules/api/games";
    import he from "he";

    export default {
        name: "HomeView",
        components: { Navbar, AHFooter, Loading },

        data() {
            return {
                game_id: null,
                game_end: false,
                question: "",
                answers: [],
                points: 0,
                correct_answers: 0,
                index: 0,
                total_questions: 5,

                is_loading: false
            }
        },

        computed: {
            DOMAIN() { return process.env.VUE_APP_DOMAIN; }
        },

        methods: {
            loadQuestion(question, answers) {
                this.question = question;
                this.answers = answers;
                this.$nextTick(() => {
                    this.$refs.question.focus();
                });
            },

            async startGame() {
                this.is_loading = true;

                const game_data = await GameAPI.quiz.startGame(!await isAuthenticated());
                this.game_id = game_data.game_id;
                this.game_end = false;

                await this.$nextTick(); // Attende l'aggiornamento della pagina

                this.loadQuestion(he.decode(game_data.question), game_data.answers);
                this.points = game_data.points;
                this.correct_answers = 0;
                this.index = game_data.index;
                this.total_questions = game_data.total_questions;

                this.is_loading = false;
            },

            async submitAnswer(answer) {
                this.is_loading = true;

                const game_data = await GameAPI.quiz.sendAnswer(this.game_id, answer);
                this.index = game_data.index;
                this.points = game_data.points;
                this.correct_answers = game_data.correct_answers;
                if (game_data.next_question) {
                    this.loadQuestion(he.decode(game_data.next_question.question), game_data.next_question.answers);
                }
                else {
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
                <h1>Animal Quiz</h1>
                <p class="fs-5">Metti alla prova la tua conoscenza sugli animali rispondendo a queste domande</p> 
                <button class="btn btn-outline-primary btn-lg px-4 py-2" :onclick="startGame">Inizia</button>
            </div>
        </div>

        <div v-if="game_id" class="d-flex align-items-center justify-content-center h-100">
            <div v-if="!game_end" class="container">
                <div class="row" style="min-height: 20vh">
                    <div ref="question" class="text-center" role="alert" aria-live="assertive" aria-atomic="true" :key="question">
                        <p class="fs-5 m-0">Domanda {{ index+1 }}/{{total_questions}}</p>
                        <p class="fs-3">{{ question }}</p>
                    </div>
                </div>

                <div class="row">
                    <div class="col-12 col-md-6" v-for="answer in answers" :key="answer">
                        <button class="btn btn-outline-primary w-100 px-2 py-4 mx-3 my-2 fs-5" :onclick="() => submitAnswer(answer)">
                            {{ answer }}
                        </button>
                    </div>
                </div>
            </div>

            <div v-if="game_end" class="text-center" aria-live="polite" role="alert" aria-atomic="true">
                <p class="fs-1">{{ points === 0 ? "La prossima volta andrà meglio" : "Congratulazioni!" }}</p>
                <p class="fs-4 m-0">Hai ottenuto {{ points }} punti</p>
                <p class="fs-4 m-0">Hai risposto correttamente a {{ correct_answers }} {{ correct_answers === 1 ? "domanda" : "domande" }} su {{ total_questions }}</p>

                <button class="btn btn-outline-primary mt-3" :onclick="startGame">Gioca di nuovo</button>
            </div>

        </div>
    </main>

    <!-- <AHFooter /> -->
</template>

<style lang="scss">
    @import "../../scss/bootstrap.scss";
</style>