require('dotenv').config();
const UserModel = require("../models/auth/user");
const PriceModel = require("../models/price");
const utils = require("../utilities");
const error = require("../error_handler");
const moment = require("moment");
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);


async function updateCustomerVIP(username) {
    const user = await UserModel.findOne({ username: username });
    const customer = await user.findType();

    customer.payment_id = null; // Pulizia pagamento

    // Incremento durata VIP
    if (moment(customer.vip_until).isBefore(moment())) {
        customer.vip_until = moment().add(1, "year").endOf("day");
    }
    else {
        customer.vip_until = moment(customer.vip_until).add(1, "year").endOf("day");
    }

    await customer.save();
}

async function checkoutVIP(req, res) {
    const username = req.auth.username;
    let payment_intent = null;

    try {
        // Estrazione utente
        const user = await UserModel.findOne({ username: username });
        if (!user) { throw error.generate.NOT_FOUND("Utente inesistente"); }

        // Creazione richiesta di pagamento
        payment_intent = await stripe.paymentIntents.create({
            amount: (await PriceModel.findOne({ name: "vip" })).price, 
            currency: "eur",
            automatic_payment_methods: { enabled: false },
        });

        // Salvataggio dati pagamento
        await user.updateType({ payment_id: payment_intent.id });
    }
    catch (err) {
        return error.response(err, res);
    }
  
    res.status(utils.http.OK).send({
        clientSecret: payment_intent.client_secret,
    });
}

async function successVIP(req, res) {
    const username = req.auth.username;

    try {
        // Estrazione ordine
        const user = await UserModel.findOne({ username: username });
        if (!user) { throw error.generate.NOT_FOUND("Utente inesistente"); }
        const customer = await user.findType();

        // Estrazione dati pagamento
        const payment_data = await stripe.paymentIntents.retrieve(customer.toJSON().payment_id);

        // Aggiornamento durata abbonamento VIP
        if (payment_data.status === "succeeded") {
            await updateCustomerVIP(username);
        }
        else {
            throw error.generate.PAYMENT_REQUIRED("Pagamento mancante");
        }
    }
    catch (err) {
        return error.response(err, res);
    }
  
    res.sendStatus(utils.http.NO_CONTENT);
}

async function priceVIP(req, res) {
    try {
        res.status(utils.http.OK).send({
            price: (await PriceModel.findOne({ name: "vip" })).price
        });
    }
    catch (err) {
        return error.response(err, res);
    }
}


module.exports = {
    checkoutVIP: checkoutVIP,
    successVIP: successVIP,
    priceVIP: priceVIP
}