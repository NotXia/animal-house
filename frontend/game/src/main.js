import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from "vue-router"
import home_routes from "./pages/Homepage/routes.js"

let routes = [];
routes = routes.concat(home_routes);

routes.push({ path: "/:pathMatch(.*)*", beforeEnter: (to, from, next) => { window.location.replace("/not-found.html") } }); // Gestione not found (lasciare come ultimo route)
const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

createApp(App).use(router).mount('#app')