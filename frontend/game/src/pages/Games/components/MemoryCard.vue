<script>
    import "bootstrap"; 
    import "bootstrap/dist/css/bootstrap.min.css";

    export default {
        name: "MemoryCard",
        props: {
            url: String,
            reveal: Boolean,
            label: String,
            index: Number
        },
        computed: {
            DOMAIN() { return process.env.VUE_APP_DOMAIN; }
        }
    }
</script>

<template>

    <div class="memory-card">
        <div :class="`card-inner ${reveal ? '' : 'cover'}`">

            <div class="card-front border border-dark rounded">
                <div class="d-flex justify-content-center align-items-center w-100 h-100 overflow-hidden">
                    <div :class="`${reveal ? '' : 'd-none'} visually-hidden`" aria-role="alert" aria-live="assertive" aria-atomic="true">
                        Hai rivelato {{ label }}
                    </div>
                    <img :src="url" alt="" aria-hidden="true" style="max-height: 150%; max-width: 150%">
                </div>
            </div>

            <div class="card-back border border-dark rounded">
                <div class="d-flex justify-content-center align-items-center w-100 h-100 overflow-hidden">
                    <div :class="`${!reveal ? '' : 'd-none'} visually-hidden`" aria-role="alert" aria-live="assertive" aria-atomic="true">
                        Carta {{ index }}
                    </div>
                    <img :src="`${DOMAIN}/logos/logo.png`" alt="" style="max-height: 90%; max-width: 90%">
                </div>
            </div>

        </div>
    </div> 

</template>

<style strict>

.memory-card {
    background-color: transparent;
    border: 0;
    width: 100%;
    height: 100%;
    perspective: 1000px;
}

.card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    text-align: center;
    transition: transform 0.8s;
    transform-style: preserve-3d;
}

.cover {
    transform: rotateY(180deg);
}

.card-front, .card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
}

.card-back {
    background-color: white;
    transform: rotateY(180deg);
} 

</style>