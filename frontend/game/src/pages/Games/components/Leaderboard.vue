<script>
    import "bootstrap"; 
    import "bootstrap/dist/css/bootstrap.min.css";

    export default {
        name: "Leaderboard",

        data() {
            return {
                leaderboard: []
            }
        },
        props: {
            get: Object
        },
        computed: {
            DOMAIN() { return process.env.VUE_APP_DOMAIN; }
        },

        async mounted() {
            try {
                this.leaderboard = await this.get();
            }
            catch (err) {

            }
        }
    }
</script>

<template>

    <section aria-label="Classifica" v-if="leaderboard.length > 0">
        <div class="container" style="min-width: 45vw;">
            <div class="row">
                <p class="m-0 fw-semibold fs-5">Top 10</p>
            </div>
    
            <div class="row">
                <div class="col-12 col-md-8 offset-md-2 col-lg-6 offset-lg-3" style="max-height: 35vh; overflow: auto">
    
                    <ol class="list-group">
                        <li v-for="rank, index in leaderboard" class="list-group-item">
                            <p class="visually-hidden">Posizione {{index+1}}: giocatore {{rank.player.username}} con {{rank.points}} punti</p>
                            <div class="d-flex justify-content-between align-items-center w-100"
                                 aria-hidden="true">
                                <div class="d-flex align-items-center w-100">
                                    <span>{{ index+1 }}.&nbsp;</span>
                                    <div class="d-flex align-items-center justify-content-center overflow-hidden border rounded-circle" style="height: 2rem; width: 2rem;">
                                        <img :src="`${DOMAIN}${rank.player.picture}`" alt="" style="width: 100%; height: 100%" />
                                    </div>
                                    &nbsp;
                                    <span>
                                        <a :href="`${DOMAIN}/fo/profile?username=${rank.player.username}`">@{{rank.player.username}}</a>
                                    </span>
                                </div>
    
                                <div>
                                    {{rank.points}} punti
                                </div>
                            </div>
                        </li>
                    </ol>
    
                </div>
            </div>
        </div>
    </section>

</template>