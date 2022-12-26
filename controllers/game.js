require('dotenv').config();
const utils = require("../utilities");
const error = require("../error_handler");
const axios = require("axios").default;
const { translate, shuffle } = require("../utilities");
const QuizModel = require("../models/games/quiz.js");
const QuizRankModel = require("../models/games/quiz_rank.js");

function randomOfArray(array) {
    return array[Math.floor(Math.random()*array.length)];
}

/**
 * Formato lista di API:
 * { url: "Indirizzo dell'endpoint", get: "Funzione che dato il risultato della chiamata, estrae i dati interessanti"}
 */

const image_apis = {
    "cane": [
        { url: "https://dog.ceo/api/breeds/image/random", get: (res) => res.message },
        { url: "http://shibe.online/api/shibes", get: (res) => res[0] },
        { url: "https://random.dog/woof?filter=mp4,webm", get: (res) => `https://random.dog/${res}` }
    ],
    "gatto": [
        { url: "https://cataas.com/cat?json=true", get: (res) => `https://cataas.com${res.url}` },
        { url: "https://aws.random.cat/meow", get: (res) => res.file }
    ],
    "coniglio": [
        { url: "https://api.bunnies.io/v2/loop/random/?media=gif", get: (res) => res.media.gif }
    ],
    "lucertola": [
        { url: "https://nekos.life/api/v2/img/lizard", get: (res) => res.url }
    ],
    "uccello": [
        { url: "https://some-random-api.ml/img/birb", get: (res) => res.link }
    ],
    "volpe": [
        { url: "https://randomfox.ca/floof/", get: (res) => res.image }
    ],
    "koala": [
        { url: "https://some-random-api.ml/img/koala", get: (res) => res.link }
    ],
    "panda": [
        { url: "https://some-random-api.ml/img/panda", get: (res) => res.link },
        { url: "https://some-random-api.ml/animal/red_panda", get: (res) => res.image }
    ],
    "papera": [
        { url: "https://random-d.uk/api/random", get: (res) => res.url }
    ],
    "canguro": [
        { url: "https://some-random-api.ml/animal/kangaroo", get: (res) => res.image }
    ],
}

const fact_apis = {
    "gatto": [
        { url: "https://meowfacts.herokuapp.com", get: (res) => res.data[0] },
        { url: "https://some-random-api.ml/facts/cat", get: (res) => res.fact }
    ],
    "cane": [
        { url: "https://dog-api.kinduff.com/api/facts", get: (res) => res.facts[0] },
        { url: "https://some-random-api.ml/facts/dog", get: (res) => res.fact }
    ],
    "panda": [
        { url: "https://some-random-api.ml/facts/panda", get: (res) => res.fact }
    ],
    "volpe": [
        { url: "https://some-random-api.ml/facts/fox", get: (res) => res.fact }
    ],
    "koala": [
        { url: "https://some-random-api.ml/facts/koala", get: (res) => res.fact }
    ],
    "uccello": [
        { url: "https://some-random-api.ml/facts/bird", get: (res) => res.fact }
    ],
    "canguro": [
        { url: "https://some-random-api.ml/animal/kangaroo", get: (res) => res.fact }
    ]
}

async function getAvailableFactsAnimals(req, res) {
    return res.status(utils.http.OK).json(Object.keys(fact_apis));
}

// Restituisce un fatto sugli animali
async function getAnimalFact(req, res) {
    let fact = "";
    let animal = "";

    try {
        // Selezione di un animale per cui cercare un fatto
        animal = req.query.animal ? String(req.query.animal).toLowerCase() : randomOfArray(Object.keys(fact_apis));
        if (!fact_apis[animal]) { throw error.generate.NOT_FOUND("Animale non disponibile"); }

        // Scelta API
        const api = randomOfArray(fact_apis[animal]);

        // Estrazione fact
        const res = await axios({ method: "GET", url: api.url });
        fact = await translate(api.get(res.data), "EN", "IT");
    } catch (err) {
        return error.response(err, res);
    }

    return res.status(utils.http.OK).json({ animal: animal, fact: fact });
}

// Restituisce un'immagine di un animali
async function getAnimalImage(req, res) {
    let image_url = "";
    let animal = "";

    try {
        // Selezione di un animale per cui cercare un'immagine
        animal = req.query.animal ? String(req.query.animal).toLowerCase() : randomOfArray(Object.keys(image_apis));
        if (!image_apis[animal]) { throw error.generate.NOT_FOUND("Animale non disponibile"); }

        // Scelta API
        const api = randomOfArray(image_apis[animal]);

        // Estrazione immagine
        const res = await axios({ method: "GET", url: api.url });
        image_url = api.get(res.data);
    } catch (err) {
        return error.response(err, res);
    }

    return res.status(utils.http.OK).json({ animal: animal, image: image_url });
}


const CORRECT_TO_POINTS_RATIO = 25;

function quizInit(is_guest) {
    return async function(req, res) {
        try {
            // Estrazione domande
            let questions = (await axios({
                method: "GET",
                url: "https://opentdb.com/api.php?amount=5&category=27&type=multiple"
            })).data;

            // Parsing formato
            questions = await Promise.all(
                questions.results.map(async (question) => {
                    const correct_answer = await translate(question.correct_answer, "EN", "IT");
                    const answers = [correct_answer]
                    for (const answer of question.incorrect_answers) { answers.push(await translate(answer, "EN", "IT")); }

                    return {
                        text: await translate(question.question, "EN", "IT"),
                        answers: shuffle(answers),
                        correct_answer: correct_answer
                    }
                })
            );

            // Creazione partita
            const quiz_instance = await new QuizModel({
                questions: questions,
                current_question: 0,
                correct_answers: 0,
                player_username: is_guest ? null : req.auth.username
            }).save();

            // Invia prima domanda
            return res.status(utils.http.OK).json({ 
                game_id: quiz_instance._id,
                question: quiz_instance.questions[quiz_instance.current_question].text,
                answers: quiz_instance.questions[quiz_instance.current_question].answers,
                index: quiz_instance.current_question,
                total_questions: quiz_instance.questions.length,
                points: quiz_instance.correct_answers * CORRECT_TO_POINTS_RATIO
            });
        } catch (err) {
            return error.response(err, res);
        }
    }
}

async function quizAnswer(req, res) {
    try {
        let is_correct = false;
        let next_question;

        // Ricerca partita
        const quiz_instance = await QuizModel.findById(req.params.quiz_id);
        if (!quiz_instance) { throw error.generate.NOT_FOUND("Partita inesistente"); }

        // Validazione risposta
        const current_question = quiz_instance.questions[quiz_instance.current_question];
        if (req.body.answer === current_question.correct_answer) {
            quiz_instance.correct_answers++;
            is_correct = true;
        }
        // Passaggio alla domanda successiva
        quiz_instance.current_question++;

        await quiz_instance.save();
        
        if (quiz_instance.current_question < quiz_instance.questions.length) { // Partita ancora in corso
            next_question = {
                question: quiz_instance.questions[quiz_instance.current_question].text,
                answers: quiz_instance.questions[quiz_instance.current_question].answers,
            };
        }
        else { // Fine partita
            next_question = null;
            if (quiz_instance.player_username) { // Non è guest
                let player = await QuizRankModel.findOne({ player: quiz_instance.player_username });
                if (!player) { player = new QuizRankModel({ player: quiz_instance.player_username, points: 0 }); }

                player.points += quiz_instance.correct_answers * CORRECT_TO_POINTS_RATIO;
                await player.save();
            }
        }

        return res.status(utils.http.OK).json({ 
            correct: is_correct,
            points: quiz_instance.correct_answers * CORRECT_TO_POINTS_RATIO,
            correct_answers: quiz_instance.correct_answers,
            index: quiz_instance.current_question,
            total_questions: quiz_instance.questions.length,
            next_question: next_question
        });
    } catch (err) {
        return error.response(err, res);
    }
}


module.exports = {
    getAvailableFactsAnimals: getAvailableFactsAnimals,
    getAnimalFact: getAnimalFact,
    getAnimalImage: getAnimalImage,
    quizInit: quizInit,
    quizAnswer: quizAnswer
}
