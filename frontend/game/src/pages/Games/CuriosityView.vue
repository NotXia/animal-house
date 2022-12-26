<script>
    import "bootstrap"; 
    import "bootstrap/dist/css/bootstrap.min.css";
    import Navbar from "../../components/Navbar/Navbar.vue";
    import AHFooter from "../../components/AHFooter/AHFooter.vue";
    import Loading from "../../components/Loading/Loading.vue";
    import { isAuthenticated } from "modules/auth";
    import GameAPI from "modules/api/games";
    import SpeciesAPI from "modules/api/species";

    export default {
        name: "CuriosityView",
        components: { Navbar, AHFooter, Loading },

        data() {
            return {
                animals: [],
                fact: "", animal: "",
                is_loading: false
            }
        },

        computed: {
            DOMAIN() { return process.env.VUE_APP_DOMAIN; }
        },

        async mounted() {
            this.loading = true;

            // Estrazione animali disponibili e associazione icona se presente
            let available_animals = await GameAPI.curiosity.getAvailableAnimals();
            const species = await SpeciesAPI.getSpecies();
            this.animals = available_animals.map((animal) => ({
                name: animal,
                logo: species.find((species) => species.name.toLowerCase() === animal.toLowerCase())?.logo
            }));

            this.loading = false;
        },
        
        methods: {
            async getFact(animal) {
                // Estrazione animale casuale se necessario
                if (!animal) { animal = this.animals[Math.floor(Math.random()*this.animals.length)].name; }

                try {
                    this.loading = true;

                    this.fact = (await GameAPI.curiosity.get(animal)).fact;
                    this.animal = animal;

                    this.loading = false;
                }
                catch (err) {

                }
            }
        }
    }

</script>

<template>
    <Navbar />
    <Loading v-if="is_loading" />

    <main>
        <div class="d-flex justify-content-center overflow-auto">
            <div class="d-flex" style="max-width: 100%">
                <button v-for="animal in animals" :class="`btn btn-outline-primary mx-1 ${this.animal === animal.name ? 'active' : ''}`" :onclick="() => this.getFact(animal.name)">
                    <div class="d-flex justify-content-center align-items-center h-100">
                        <img v-if="animal.logo" :src="`data:image/*;base64,${animal.logo}`" alt="" style="height: 1.5rem" class="me-1" />
                        <span class="text-capitalize fs-5">{{ animal.name }}</span>
                    </div>
                </button>

                <button :class="`btn btn-outline-primary mx-1 ${this.animal === animal.name ? 'active' : ''}`" :onclick="() => this.getFact()">
                    <div class="d-flex justify-content-center align-items-center h-100">
                        <img :src="`${DOMAIN}/img/icons/random.png`" alt="" style="height: 1.5rem" class="me-1" />
                        <span class="text-capitalize fs-5">Casuale</span>
                    </div>
                </button>
            </div>
        </div>

        <div v-if="this.fact" class="container mt-4">
            <div class="row">
                <div class="text-center border rounded p-2">
                    <p class="fs-4 m-0">Lo sapevi che:</p>
                    <p class="fs-2 m-0">{{ this.fact }}</p>
                </div>
            </div>

            <div class="row mt-3">
                <div class="d-flex justify-content-center">
                    <button class="btn btn-outline-primary fs-5" :onclick="() => this.getFact(animal)">Prossima curiosità</button>
                </div>
            </div>
        </div>
    </main>

    <AHFooter />
</template>