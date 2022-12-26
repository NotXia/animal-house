import QuizView from "./QuizView.vue";
import HangmanView from "./HangmanView.vue";
import MemoryView from "./MemoryView.vue";

let routes = [
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
    }
]

export default routes;