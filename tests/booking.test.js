require("dotenv").config();
const app = require("../index.js");
const utils = require("./utils/utils");
const session = require('supertest-session');
const moment = require("moment");

const BookingModel = require("../models/services/booking");
const SpeciesModel = require("../models/animals/species");
const AnimalModel = require("../models/animals/animal");
const CustomerModel = require("../models/auth/customer");
const UserModel = require("../models/auth/user");

let curr_session = session(app);

let admin_token;

let service1, service2;
let operator1, operator2, operator3, operator4;
let customer1, customer2;
let species1;
let animal1;
let appointment1, appointment2;
const RANDOM_MONGOID = "111111111111111111111111";

beforeAll(async function () {
    admin_token = await utils.loginAsAdmin(curr_session);

    service1 = (await curr_session.post('/services/').send({ name: "Pranzo di Pasqua", description: "A", duration: 60, price: 1000 }).set({ Authorization: `Bearer ${admin_token}` })).body;
    service2 = (await curr_session.post('/services/').send({ name: "Pranzo di Natale", description: "A", duration: 25, price: 1000 }).set({ Authorization: `Bearer ${admin_token}` })).body;
    
    operator1 = await utils.loginAsOperatorWithPermission(curr_session, [], [service1.id, service2.id]);
    await curr_session.put(`/users/operators/${operator1.username}`)
    .send({ working_time: { 
        monday: [{ time: {start: moment("9:00", "HH:mm"), end: moment("13:00", "HH:mm")}, hub: "BLQ1" }], 
        tuesday: [], wednesday: [], thursday: [],  friday: [],  saturday: [],  sunday: [] 
    } }).set({ Authorization: `Bearer ${admin_token}` });
    
    operator2 = await utils.loginAsOperatorWithPermission(curr_session, [], [service1.id]);
    await curr_session.put(`/users/operators/${operator2.username}`)
    .send({ working_time: { 
        monday: [{ time: {start: moment("9:00", "HH:mm"), end: moment("13:00", "HH:mm")}, hub: "BLQ1" }], 
        tuesday: [], wednesday: [], thursday: [],  friday: [],  saturday: [],  sunday: [] 
    } }).set({ Authorization: `Bearer ${admin_token}` });
    
    operator3 = await utils.loginAsOperatorWithPermission(curr_session, [], []);
    await curr_session.put(`/users/operators/${operator3.username}`)
    .send({ working_time: { 
        monday: [{ time: {start: moment("9:00", "HH:mm"), end: moment("13:00", "HH:mm")}, hub: "BLQ1" }], 
        tuesday: [], wednesday: [], thursday: [],  friday: [],  saturday: [],  sunday: [] 
    } }).set({ Authorization: `Bearer ${admin_token}` });

    operator4 = await utils.loginAsOperatorWithPermission(curr_session, [], [service1.id, service2.id]);
    await curr_session.put(`/users/operators/${operator4.username}`)
    .send({ working_time: { 
        monday: [{ time: {start: moment("11:00", "HH:mm"), end: moment("16:59", "HH:mm")}, hub: "BLQ2" }], 
        tuesday: [], wednesday: [], thursday: [],  friday: [],  saturday: [],  sunday: [] 
    } }).set({ Authorization: `Bearer ${admin_token}` });

    
    species1 = await new SpeciesModel(
        {
            name: "Felino"
        }
    ).save();

    animal1 = await new AnimalModel(
        {
            species: species1._id,
            name: "Ghepardonono",
        }
    ).save();
    
    customer1 = await utils.loginAsCustomer(curr_session);
    const user1 = await UserModel.findOne({ username: customer1.username }).exec();
    const customer1_db = await user1.findType();
    await CustomerModel.findByIdAndUpdate(customer1_db._id, { "$push": { animals_id: animal1._id } }).exec();

    customer2 = await utils.loginAsCustomer(curr_session);
});

describe("Ricerca disponibilità", function () {
    test("Ricerca corretta (1)", async function () {
        const res = await curr_session.get(`/appointments/availabilities/`)
            .query({ 
                start_date: moment("09/08/2100", "DD/MM/YYYY").format(), 
                end_date: moment("09/08/2100", "DD/MM/YYYY").format(),
                hub_code: "BLQ1", service_id: service1.id
            }).expect(200);
        expect(res.body.length).toEqual(8);
        for (const slot of res.body) {
            expect( moment(slot.time.end).diff(moment(slot.time.start), "minutes") ).toEqual(service1.duration);
            expect(slot.hub).toEqual("BLQ1");
            expect((slot.operator_username==operator1.username) || (slot.operator_username==operator2.username)).toBeTruthy();
        }
    });

    test("Ricerca corretta (2)", async function () {
        const res = await curr_session.get(`/appointments/availabilities/`)
            .query({ 
                start_date: moment("09/08/2100", "DD/MM/YYYY").format(), 
                end_date: moment("09/08/2100", "DD/MM/YYYY").format(),
                hub_code: "BLQ1", service_id: service2.id
            }).expect(200);
        expect(res.body.length).toEqual(9);
        for (const slot of res.body) {
            expect( moment(slot.time.end).diff(moment(slot.time.start), "minutes") ).toEqual(service2.duration);
            expect(slot.hub).toEqual("BLQ1");
            expect(slot.operator_username==operator1.username).toBeTruthy();
        }
    });

    test("Ricerca corretta (3)", async function () {
        const res = await curr_session.get(`/appointments/availabilities/`)
            .query({ 
                start_date: moment("09/08/2100", "DD/MM/YYYY").format(), 
                end_date: moment("09/08/2100", "DD/MM/YYYY").format(),
                hub_code: "BLQ2", service_id: service1.id
            }).expect(200);
        expect(res.body.length).toEqual(5);
        for (const slot of res.body) {
            expect( moment(slot.time.end).diff(moment(slot.time.start), "minutes") ).toEqual(service1.duration);
            expect(slot.hub).toEqual("BLQ2");
            expect(slot.operator_username==operator4.username).toBeTruthy();
        }
    });

    test("Ricerca corretta (4)", async function () {
        const res = await curr_session.get(`/appointments/availabilities/`)
            .query({ 
                start_date: moment("10/08/2100", "DD/MM/YYYY").format(), 
                end_date: moment("10/08/2100", "DD/MM/YYYY").format(),
                hub_code: "BLQ1", service_id: service1.id
            }).expect(200);
        expect(res.body.length).toEqual(0);
    });

    test("Ricerca errata - Parametri mancanti", async function () {
        await curr_session.get(`/appointments/availabilities/`)
            .query({ 
                end_date: moment("09/08/2100", "DD/MM/YYYY").format(),
                hub_code: "BLQ2", service_id: service1.id
            }).expect(400);
    });
});

describe("Creazione degli appuntamenti", function () {
    let availabilities1;
    test("Creazione corretta (1)", async function () {
        availabilities1 = (await curr_session.get(`/appointments/availabilities/`)
            .query({ 
                start_date: moment("09/08/2100", "DD/MM/YYYY").format(), 
                end_date: moment("09/08/2100", "DD/MM/YYYY").format(),
                hub_code: "BLQ2", service_id: service1.id
            }).expect(200)).body;

        const res = await curr_session.post('/appointments/').send({
            time_slot: availabilities1[0].time,
            service_id: service1.id,
            customer: customer1.username,
            animal_id: animal1._id,
            operator: operator4.username,
            hub: "BLQ2"
        }).set({ Authorization: `Bearer ${customer1.token}` }).expect(201);
        expect(res.body).toBeDefined();

        const appointment = await BookingModel.findById(res.body.id).exec();
        expect(appointment).toBeDefined();
        expect(appointment.service_id.toString()).toEqual(service1.id);
        appointment1 = appointment;
    });

    test("Creazione corretta (2)", async function () {
        availabilities2 = (await curr_session.get(`/appointments/availabilities/`)
            .query({ 
                start_date: moment("09/08/2100", "DD/MM/YYYY").format(), 
                end_date: moment("09/08/2100", "DD/MM/YYYY").format(),
                hub_code: "BLQ1", service_id: service2.id
            }).expect(200)).body;

        const res = await curr_session.post('/appointments/').send({
            time_slot: availabilities2[0].time,
            service_id: service2.id,
            customer: customer1.username,
            animal_id: animal1._id,
            operator: operator1.username,
            hub: "BLQ1"
        }).set({ Authorization: `Bearer ${customer1.token}` }).expect(201);
        expect(res.body).toBeDefined();

        const appointment = await BookingModel.findById(res.body.id).exec();
        expect(appointment).toBeDefined();
        expect(appointment.service_id.toString()).toEqual(service2.id);
        appointment2 = appointment;
    });

    test("Creazione con slot impegnato", async function () {
        await curr_session.post('/appointments/').send({
            time_slot: availabilities1[0].time,
            service_id: service1.id,
            customer: customer1.username,
            animal_id: animal1._id,
            operator: operator4.username,
            hub: "BLQ2"
        }).set({ Authorization: `Bearer ${customer1.token}` }).expect(400);
    });

    test("Creazione con parametri mancanti", async function () {
        const res = await curr_session.post('/appointments/').send({
        }).set({ Authorization: `Bearer ${customer1.token}` }).expect(400);
    });

    test("Creazione errata - Creazione per altri", async function () {
        let availabilities = (await curr_session.get(`/appointments/availabilities/`)
            .query({ 
                start_date: moment("09/08/2100", "DD/MM/YYYY").format(), 
                end_date: moment("09/08/2100", "DD/MM/YYYY").format(),
                hub_code: "BLQ1", service_id: service2.id
            }).expect(200)).body;

        await curr_session.post('/appointments/').send({
            time_slot: availabilities[0].time,
            service_id: service2.id,
            customer: customer1.username,
            animal_id: animal1._id,
            operator: availabilities[0].operator_username,
            hub: availabilities[0].hub
        }).set({ Authorization: `Bearer ${customer2.token}` }).expect(403);
    });

    test("Creazione errata - Animale altrui", async function () {
        let availabilities = (await curr_session.get(`/appointments/availabilities/`)
            .query({ 
                start_date: moment("09/08/2100", "DD/MM/YYYY").format(), 
                end_date: moment("09/08/2100", "DD/MM/YYYY").format(),
                hub_code: "BLQ1", service_id: service2.id
            }).expect(200)).body;

        await curr_session.post('/appointments/').send({
            time_slot: availabilities[0].time,
            service_id: service2.id,
            customer: customer2.username,
            animal_id: animal1._id,
            operator: availabilities[0].operator_username,
            hub: availabilities[0].hub
        }).set({ Authorization: `Bearer ${customer2.token}` }).expect(403);
    });
});

describe("Ricerca degli appuntamenti", function() {
    test("Ricerca singola come cliente", async function () {
        const appointment = await curr_session.get(`/appointments/${appointment1.id}`).set({ Authorization: `Bearer ${customer1.token}` }).expect(200);
        expect(appointment).toBeDefined();
        expect(appointment.body.service_id.toString()).toEqual(service1.id);
        expect(appointment.body.customer).toEqual(customer1.username);
    });

    test("Ricerca singola come operatore", async function () {
        const appointment = await curr_session.get(`/appointments/${appointment1.id}`).set({ Authorization: `Bearer ${operator1.token}` }).expect(200);
        expect(appointment.body.service_id).toEqual(service1.id);
        expect(appointment.body.customer).toEqual(customer1.username);
    });

    test("Ricerca singola - Permessi mancanti", async function () {
        await curr_session.get(`/appointments/${appointment1.id}`).set({ Authorization: `Bearer ${customer2.token}` }).expect(403);
    });

    test("Ricerca totale per cliente come cliente", async function () {
        const appointments = await curr_session.get('/appointments/').query({ username: customer1.username }).set({ Authorization: `Bearer ${customer1.token}` }).expect(200);
        expect(appointments).toBeDefined();
        expect(appointments.body.length).toEqual(2);
        expect(appointments.body[0].operator).toEqual(operator4.username);
        expect(appointments.body[0].hub).toEqual("BLQ2");
        expect(appointments.body[1].operator).toEqual(operator1.username);
        expect(appointments.body[1].hub).toEqual("BLQ1");
    });

    test("Ricerca totale per cliente come operatore", async function () {
        const appointments = await curr_session.get('/appointments/').query({ username: customer1.username }).set({ Authorization: `Bearer ${operator1.token}` }).expect(200);
        expect(appointments.body.length).toEqual(2);
    });

    test("Ricerca totale per cliente - Permessi mancanti", async function () {
        await curr_session.get('/appointments/').query({ username: customer1.username }).set({ Authorization: `Bearer ${customer2.token}` }).expect(403);
    });

    test("Ricerca totale per operatore", async function () {
        const appointments = await curr_session.get('/appointments/').query({ username: operator1.username }).set({ Authorization: `Bearer ${operator1.token}` }).expect(200);
        expect(appointments).toBeDefined();
        expect(appointments.body.length).toEqual(1);
        expect(appointments.body[0].customer).toEqual(customer1.username);
        expect(appointments.body[0].hub).toEqual("BLQ1");
    });
});

describe("Cancellazione degli appuntamenti", function () {
    test("Cancellazione errata - Permessi mancanti", async function () {
        await curr_session.delete(`/appointments/${appointment1.id}`).set({ Authorization: `Bearer ${customer2.token}` }).expect(403);
    });

    test("Cancellazione corretta", async function () {
        await curr_session.delete(`/appointments/${appointment1.id}`).set({ Authorization: `Bearer ${customer1.token}` }).expect(204);

        const appointment = await BookingModel.findById(appointment1.id).exec();
        expect(appointment).toBeNull();
    });

    test("Cancellazione corretta", async function () {
        await curr_session.delete(`/appointments/${appointment2.id}`).set({ Authorization: `Bearer ${operator1.token}` }).expect(204);
    });

    test("Cancellazione appuntamento inesistente", async function () {
        await curr_session.delete(`/appointments/${RANDOM_MONGOID}`).set({ Authorization: `Bearer ${admin_token}` }).expect(404);
    });
});

describe("", function () {
    test("Pulizia", async function () {
        await utils.cleanup(curr_session);
        await curr_session.delete(`/services/${service1.id}`).set({ Authorization: `Bearer ${admin_token}` });
        await curr_session.delete(`/services/${service2.id}`).set({ Authorization: `Bearer ${admin_token}` });
        await AnimalModel.findByIdAndDelete(animal1._id);
        await SpeciesModel.findByIdAndDelete(species1._id);
    });
});