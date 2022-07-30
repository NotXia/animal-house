require("dotenv").config();
const SpeciesModel = require("../models/animals/species");
const AnimalModel = require("../models/animals/animal");
const CustomerModel = require("../models/auth/customer");

function randomOf(array) {
    return array[Math.floor(Math.random() * array.length)]
}

describe("Database - gestione animali", function () {
    let species = [];
    let animals_id = [];
    let users_id = [];
    let tmp = undefined;

    test("Popolazione database", async function () {
        tmp = await new SpeciesModel({ name: "Cane" }).save();
        species.push(tmp);
        tmp = await new SpeciesModel({ name: "Criceto" }).save();
        species.push(tmp);
        tmp = await new SpeciesModel({ name: "Gatto" }).save();
        species.push(tmp);

        tmp = await new AnimalModel({ species: randomOf(species).name, name: "Animale1" }).save();
        animals_id.push(tmp._id);
        tmp = await new AnimalModel({ species: randomOf(species).name, name: "Animale2" }).save();
        animals_id.push(tmp._id);
        tmp = await new AnimalModel({ species: randomOf(species).name, name: "Animale3" }).save();
        animals_id.push(tmp._id);

        tmp = await new CustomerModel({ username: "user1", password: "a", email: "user1@test.it", name: "User1", surname: "Uno" }).save();
        users_id.push(tmp._id);
        tmp = await new CustomerModel({ username: "user2", password: "a", email: "user2@test.it", name: "User2", surname: "Due" }).save();
        users_id.push(tmp._id);
        tmp = await new CustomerModel({ username: "user3", password: "a", email: "user3@test.it", name: "User3", surname: "Tre" }).save();
        users_id.push(tmp._id);
    });

    test("Verifica duplicati", async function () {
        const animal_id = randomOf(animals_id);
        await CustomerModel.findByIdAndUpdate(users_id[0], { $addToSet: { animals_id: animal_id } });
        await CustomerModel.findByIdAndUpdate(users_id[0], { $addToSet: { animals_id: animal_id } });

        const user = await CustomerModel.findById(users_id[0]).exec();
        expect(user.animals_id.length).toBe(1);
    });

    test("Pulizia database", async function () {
        for (const id of users_id) { await CustomerModel.findByIdAndDelete(id); }
        for (const s of species) { await SpeciesModel.findByIdAndDelete(s._id); }
        for (const id of animals_id) { await AnimalModel.findByIdAndDelete(id); }
    });
});

