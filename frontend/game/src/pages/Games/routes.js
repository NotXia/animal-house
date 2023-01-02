import QuizView from "./QuizView.vue";
import HangmanView from "./HangmanView.vue";
import GameView from "./GameView.vue";

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
    }
]

export default routes;