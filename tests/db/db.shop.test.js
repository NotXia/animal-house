require("dotenv").config();
const CategoryModel = require("../../models/shop/category");
const ItemModel = require("../../models/shop/item");
const OrderModel = require("../../models/shop/order");
const SpeciesModel = require("../../models/animals/species");

const ValidationError = require("mongoose").Error.ValidationError;

function randomOf(array) {
    return array[Math.floor(Math.random() * array.length)]
}

describe("Database - gestione shop", function () {
    let species_id = [];
    let categories_id = [];
    let items_id = [];
    let tmp = undefined;

    test("Popolazione database", async function () {
        tmp = await new SpeciesModel({ type: "Cane", race: "Jack Russell terrier" }).save();
        species_id.push(tmp._id);
        tmp = await new SpeciesModel({ type: "Gatto", race: "Sacro di Birmania" }).save();
        species_id.push(tmp._id);

        tmp = await new CategoryModel({ name: "Cibo" }).save();
        categories_id.push(tmp._id);
        tmp = await new CategoryModel({ name: "Abbigliamento" }).save();
        categories_id.push(tmp._id);

        tmp = await new ItemModel({ 
            name: "Item1", 
            category_id: randomOf(categories_id), 
            products: [{ name: "Prodotto1", price: 1000, quantity: 5, barcode: "12345" }]
        }).save();
        items_id.push(tmp._id);
    });

    test("Validazione", async function () {
        expect(async function () {
            await new ItemModel({ 
                name: "ItemSbagliato1", 
                category_id: randomOf(categories_id), 
                products: [{ name: "ProdottoSbagliato1", price: -1, quantity: 5, barcode: "1" }] 
            }).save();
        }).rejects.toThrow(ValidationError);

        expect(async function () {
            await new ItemModel({
                name: "ItemSbagliato2",
                category_id: randomOf(categories_id),
                products: [{ name: "ProdottoSbagliato2" }]
            }).save();
        }).rejects.toThrow(ValidationError);

        expect(async function () {
            await new ItemModel({
                name: "ItemSbagliato3",
                category_id: randomOf(categories_id),
                products: [{ name: "ProdottoSbagliato3", price: 1, quantity: -1, barcode: "2" }]
            }).save();
        }).rejects.toThrow(ValidationError);

        expect(async function () {
            await new ItemModel({
                name: "ItemSbagliato4",
                category_id: randomOf(categories_id),
                products: []
            }).save();
        }).rejects.toThrow(ValidationError);
    });

    test("Pulizia database", async function () {
        for (const id of species_id) { await SpeciesModel.findByIdAndDelete(id); }
        for (const id of categories_id) { await CategoryModel.findByIdAndDelete(id); }
        for (const id of items_id) { await ItemModel.findByIdAndDelete(id); }
    });
});

