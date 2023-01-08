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
        async getLeaderboard() {
            return await $.ajax({ 
                method: "GET", url: `${DOMAIN}/games/quiz/leaderboard`
            });
        }
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
        async getLeaderboard() {
            return await $.ajax({ 
                method: "GET", url: `${DOMAIN}/games/hangman/leaderboard`
            });
        }
    },

    memory: {
        async startGame(is_guest) {
            if (is_guest) {
                return await $.ajax({ method: "POST", url: `${DOMAIN}/games/memory/guest` });
            }
            else {
                return await api_request({ method: "POST", url: `${DOMAIN}/games/memory` });
            }
        },
        async flipCard(game_id, card_index) {
            return await $.ajax({ 
                method: "PUT", url: `${DOMAIN}/games/memory/${encodeURIComponent(game_id)}`,
                data: {
                    index: card_index
                }
            });
        },
        async getLeaderboard() {
            return await $.ajax({ 
                method: "GET", url: `${DOMAIN}/games/memory/leaderboard`
            });
        }
    },

    curiosity: {
        async getAvailableAnimals() {
            return await $.ajax({ method: "GET", url: `${DOMAIN}/games/animals/facts/list` });
        },
        async get(animal) {
            return await $.ajax({ 
                method: "GET", url: `${DOMAIN}/games/animals/facts`,
                data: {
                    animal: animal
                }
            });
        },
    }
}

export default GameAPI;
