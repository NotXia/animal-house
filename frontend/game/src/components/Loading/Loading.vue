<template>
    <div class="position-absolute top-0 start-0 w-100 min-vh-100" :style="{ backgroundColor: '#aaaaaa70', zIndex: Number.MAX_SAFE_INTEGER }">
        <div class="d-flex justify-content-center align-items-center w-100 min-vh-100">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Caricamento</span>
            </div>
        </div>
    </div>
</template>

<script>
    import "bootstrap/dist/css/bootstrap.min.css";

    export default {
        name: "loading",
    }
</script>

