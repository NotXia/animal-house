<script>
    import "bootstrap"; 
    import "bootstrap/dist/css/bootstrap.min.css";
    import Navbar from "../../components/Navbar/Navbar.vue";
    import AHFooter from "../../components/AHFooter/AHFooter.vue";
    import Loading from "../../components/Loading/Loading.vue";
    import { isAuthenticated } from "modules/auth";
    import GameAPI from "modules/api/games";
    import MemoryCard from "./components/MemoryCard.vue";

    export default {
        name: "MemoryView",
        components: { Navbar, AHFooter, Loading, MemoryCard },

        data() {
            return {
                game_id: null,
                game_end: false,
                cards: [],
                points: 0,
                flipping: false,
                first_card: true,

                is_loading: false
            }
        },

        computed: {
            DOMAIN() { return process.env.VUE_APP_DOMAIN; },
        },

        methods: {
            async startGame() {
                this.is_loading = true;

                const game_data = await GameAPI.memory.startGame(!await isAuthenticated());
                this.game_id = game_data.game_id;
                this.cards = game_data.cards;
                this.game_end = false;
                this.flipping = false;
                this.first_card = true;

                this.is_loading = false;
            },

            async flipCard(index) {
                const game_data = await GameAPI.memory.flipCard(this.game_id, index);

                if (game_data.points !== undefined) { // Partita terminata
                    this.points = game_data.points;
                    this.cards = game_data.cards;
                    await this.$nextTick();
                    await new Promise(r => setTimeout(r, 1500));
                    this.game_end = true;
                    return;
                }
                
                if (this.first_card) { // Prima carta scoperta
                    this.first_card = false;

                    this.cards = game_data.cards;
                }
                else { // Seconda carta scoperta
                    this.first_card = true;
                    this.flipping = true;

                    this.cards = game_data.cards_prev;
                    await this.$nextTick();
                    await new Promise(r => setTimeout(r, 2000));
                    this.cards = game_data.cards;

                    this.flipping = false;
                }
            }
        }
    }

</script>

<template>
    <Navbar />
    <Loading v-if="is_loading" />

    <main style="height: 80vh">
        <div v-if="!game_id" class="d-flex align-items-center justify-content-center h-100">
            <section aria-label="Gioca a memory">
                <div class="text-center">
                    <h1>Memory</h1>
                    <p class="fs-5">Metti alla prova la tua memoria</p> 
                    <button class="btn btn-outline-primary btn-lg px-4 py-2" :onclick="startGame">Inizia</button>
                </div>
            </section>
        </div>

        <div v-if="game_id" class="d-flex align-items-start align-items-md-center justify-content-center h-100">
            <div v-if="!game_end" class="container">
                <div class="row p-1 mt-3">
                    <section aria-label="Carte da rivelare">
                        <button v-for="(card, index) of cards" :key="index" class="col-6 col-md-2 btn btn-link m-0" 
                                :onclick="() => flipCard(index)" :disabled="card !== null || flipping" style="background-color: #00000000; opacity: 1;">
                            <div style="width: 100%; height: 10rem">
                                <MemoryCard :reveal="card !== null" :url="card?.url" :index="index+1" :label="card?.label"/>
                            </div>
                        </button>
                    </section>
                </div>
            </div>

            <div v-if="game_id" class="d-flex align-items-center justify-content-center h-100" aria-role="alert" aria-live="assertive">
                <div v-if="game_end" class="text-center">
                    <section aria-label="Fine partita">
                        <p class="fs-1">{{ points === 0 ? "La prossima volta andrà meglio" : "Congratulazioni!" }}</p>
                        <p class="fs-4 m-0">Hai ottenuto {{ points }} punti</p>
    
                        <button class="btn btn-outline-primary mt-3" :onclick="startGame">Gioca di nuovo</button>
                    </section>
                </div>
            </div>

        </div>
    </main>

    <!-- <AHFooter /> -->
</template>