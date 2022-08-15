require("dotenv").config();
const app = require("../index.js");
const utils = require("./utils/utils");
const session = require('supertest-session');
const moment = require("moment");

const BookingModel = require("../models/services/booking");

let curr_session = session(app);

let admin_token;

let service1, service2;
let operator1, operator2, operator3, operator4;
let customer1;
const RANDOM_MONGOID = "111111111111111111111111";

beforeAll(async function () {
    admin_token = await utils.loginAsAdmin(curr_session);

    service1 = (await curr_session.post('/services/').send({ name: "Pranzo di Pasqua", description: "A", duration: 60, price: 1000 }).set({ Authorization: `Bearer ${admin_token}` })).body;
    service2 = (await curr_session.post('/services/').send({ name: "Pranzo di Natale", description: "A", duration: 25, price: 1000 }).set({ Authorization: `Bearer ${admin_token}` })).body;
    
    operator1 = await utils.loginAsOperatorWithPermission(curr_session, {}, [service1.id, service2.id]);
    await curr_session.put(`/user/operators/${operator1.username}/working-time`)
    .send({ working_time: { 
        monday: [{ time: {start: moment("9:00", "HH:mm"), end: moment("13:00", "HH:mm")}, hub: "BLQ1" }], 
        tuesday: [], wednesday: [], thursday: [],  friday: [],  saturday: [],  sunday: [] 
    } }).set({ Authorization: `Bearer ${admin_token}` });
    
    operator2 = await utils.loginAsOperatorWithPermission(curr_session, {}, [service1.id]);
    await curr_session.put(`/user/operators/${operator2.username}/working-time`)
    .send({ working_time: { 
        monday: [{ time: {start: moment("9:00", "HH:mm"), end: moment("13:00", "HH:mm")}, hub: "BLQ1" }], 
        tuesday: [], wednesday: [], thursday: [],  friday: [],  saturday: [],  sunday: [] 
    } }).set({ Authorization: `Bearer ${admin_token}` });
    
    operator3 = await utils.loginAsOperatorWithPermission(curr_session, {}, []);
    await curr_session.put(`/user/operators/${operator3.username}/working-time`)
    .send({ working_time: { 
        monday: [{ time: {start: moment("9:00", "HH:mm"), end: moment("13:00", "HH:mm")}, hub: "BLQ1" }], 
        tuesday: [], wednesday: [], thursday: [],  friday: [],  saturday: [],  sunday: [] 
    } }).set({ Authorization: `Bearer ${admin_token}` });

    operator4 = await utils.loginAsOperatorWithPermission(curr_session, {}, [service1.id, service2.id]);
    await curr_session.put(`/user/operators/${operator4.username}/working-time`)
    .send({ working_time: { 
        monday: [{ time: {start: moment("11:00", "HH:mm"), end: moment("16:59", "HH:mm")}, hub: "BLQ2" }], 
        tuesday: [], wednesday: [], thursday: [],  friday: [],  saturday: [],  sunday: [] 
    } }).set({ Authorization: `Bearer ${admin_token}` });

    customer1 = await utils.loginAsCustomerWithPermission(curr_session, {});
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

describe("Creazione di un appuntamento", function () {
    let availabilities;
    test("Creazione corretta", async function () {
        availabilities = (await curr_session.get(`/appointments/availabilities/`)
            .query({ 
                start_date: moment("09/08/2100", "DD/MM/YYYY").format(), 
                end_date: moment("09/08/2100", "DD/MM/YYYY").format(),
                hub_code: "BLQ2", service_id: service1.id
            }).expect(200)).body;

        const res = await curr_session.post('/appointments/').send({
            time_slot: availabilities[0].time,
            service_id: service1.id,
            customer: customer1.username,
            animal_id: RANDOM_MONGOID,
            operator: operator4.username,
            hub: "BLQ2"
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(201);
        expect(res.body).toBeDefined();

        const appointment = await BookingModel.findById(res.body.id).exec();
        expect(appointment).toBeDefined();
        expect(appointment.service_id.toString()).toEqual(service1.id);
    });

    test("Creazione con slot impegnato", async function () {
        await curr_session.post('/appointments/').send({
            time_slot: availabilities[0].time,
            service_id: service1.id,
            customer: customer1.username,
            animal_id: RANDOM_MONGOID,
            operator: operator4.username,
            hub: "BLQ2"
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(400);
    });

    test("Creazione con parametri mancanti", async function () {
        const res = await curr_session.post('/appointments/').send({
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(400);
    });
});


describe("", function () {
    test("Pulizia", async function () {
        await utils.cleanup(curr_session);
        await curr_session.delete(`/services/${service1.id}`).set({ Authorization: `Bearer ${admin_token}` });
        await curr_session.delete(`/services/${service2.id}`).set({ Authorization: `Bearer ${admin_token}` });
    });
});