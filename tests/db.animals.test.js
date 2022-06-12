require("dotenv").config();
const SpeciesModel = require("../models/animals/species");
const AnimalModel = require("../models/animals/animal");
const CustomerModel = require("../models/auth/customer");

function randomOf(array) {
    return array[Math.floor(Math.random() * array.length)]
}

describe("Database - gestione animali", function () {
    let species_id = [];
    let animals_id = [];
    let users_id = [];
    let tmp = undefined;

    test("Popolazione database", async function () {
        tmp = await new SpeciesModel({ type: "Cane", race: "Jack Russell terrier" }).save();
        species_id.push(tmp._id);
        tmp = await new SpeciesModel({ type: "Cane", race: "Bichon havanais" }).save();
        species_id.push(tmp._id);
        tmp = await new SpeciesModel({ type: "Gatto", race: "Sacro di Birmania" }).save();
        species_id.push(tmp._id);

        tmp = await new AnimalModel({ species_id: randomOf(species_id), name: "Animale1" }).save();
        animals_id.push(tmp._id);
        tmp = await new AnimalModel({ species_id: randomOf(species_id), name: "Animale2" }).save();
        animals_id.push(tmp._id);
        tmp = await new AnimalModel({ species_id: randomOf(species_id), name: "Animale3" }).save();
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
        for (const id of species_id) { await SpeciesModel.findByIdAndDelete(id); }
        for (const id of animals_id) { await AnimalModel.findByIdAndDelete(id); }
    });
});

