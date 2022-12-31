import QuizView from "./QuizView.vue";
import HangmanView from "./HangmanView.vue";

let routes = [
    {
        path: "/play/quiz",
        name: "quiz",
        component: QuizView
    },
    {
        path: "/play/hangman",
        name: "quiz",
        component: HangmanView
    }
]

export default routes;