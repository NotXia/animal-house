import $ from "jquery";
import { api_request } from "../auth.js";
import { DOMAIN } from "../const";

const GameAPI = {
    quiz: {
        async startGame(is_guest) {
            if (is_guest) {
                return await $.ajax({ method: "POST", url: `${DOMAIN}/games/quiz/guest` });
            }
            else {
                return await api_request({ method: "POST", url: `${DOMAIN}/games/quiz` });
            }
        },
        async sendAnswer(game_id, answer) {
            return await $.ajax({ 
                method: "PUT", url: `${DOMAIN}/games/quiz/${encodeURIComponent(game_id)}`,
                data: {
                    answer: answer
                }
            });
        },
    },
    hangman: {
        async startGame(is_guest) {
            if (is_guest) {
                return await $.ajax({ method: "POST", url: `${DOMAIN}/games/hangman/guest` });
            }
            else {
                return await api_request({ method: "POST", url: `${DOMAIN}/games/hangman` });
            }
        },
        async sendLetter(game_id, letter) {
            return await $.ajax({ 
                method: "PUT", url: `${DOMAIN}/games/hangman/${encodeURIComponent(game_id)}`,
                data: {
                    attempt: letter
                }
            });
        },
    }
}

export default GameAPI;
