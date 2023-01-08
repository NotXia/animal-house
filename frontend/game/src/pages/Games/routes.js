import QuizView from "./QuizView.vue";
import HangmanView from "./HangmanView.vue";
import GameView from "./GameView.vue";
import MemoryView from "./MemoryView.vue";
import CuriosityView from "./CuriosityView.vue";

let routes = [
    {
        path: "/play",
        name: "game",
        component: GameView
    },
    {
        path: "/play/quiz",
        name: "quiz",
        component: QuizView
    },
    {
        path: "/play/hangman",
        name: "hangman",
        component: HangmanView
    },
    {
        path: "/play/memory",
        name: "memory",
        component: MemoryView
    },
    {
        path: "/play/curiosity",
        name: "curiosity",
        component: CuriosityView
    }
]

export default routes;