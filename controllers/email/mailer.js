require('dotenv').config();
const nodemailer = require('nodemailer');
const fs = require("fs").promises;
const path = require("path");
const auth_controller = require("../auth");

/**
 * Gestisce l'invio di una mail
 * @param {String} destination      Email destinazione 
 * @param {String} subject          Oggetto della mail
 * @param {String} html             Corpo HTML della mail
 * @param {Array}  attachments      Allegati
 */
async function mailTo(destination, subject, html, attachments=[]) {
    var transporter = nodemailer.createTransport({
        service: process.env.MAILER_SERVICE,
        auth: {
            user: process.env.MAILER_USER,
            pass: process.env.MAILER_PASSWORD
        }
    });

    await transporter.sendMail({
        from: `Animal House <${process.env.MAILER_USER}>`, to: destination,
        subject: subject,
        html: html,
        attachments: attachments
    });
}

/**
 * Formatta un template HTML
 * @param {String} template_name     Nome del template
 * @param {Object} placeholders      Dizionario { nome_placeholder: valore } 
 * @returns HTML interpolato
 */
async function formatHTML(template_name, placeholders) {
    // Lettura template
    const template_dir = path.join(__dirname, "./templates/");
    let html = await fs.readFile(path.join(template_dir, template_name), {encoding: 'utf-8'});

    // Interpolazione dei valori nei placeholder
    for (const [key, value] of Object.entries(placeholders)) { html = html.replaceAll(`{{${key}}}`, value); }

    return html;
}

module.exports.sendWelcomeEmail = async function (user) {
    if (process.env.TESTING) { return true; }

    try {
        const token = auth_controller.createTokens({ username: user.username }).access.value;

        let welcome_html = await formatHTML("welcome.html", {
            name: user.name, 
            verification_url: `${process.env.DOMAIN}/fo/signup/verify?t=${token}`
        });
    
        await mailTo(
            destination = user.email, 
            subject = "Benvenuto in Animal House", 
            html = welcome_html, 
        );
    }
    catch (err) {
        console.log(err);
        return false;
    }

    return true;
}

module.exports.sendVerificationEmail = async function (user) {
    if (process.env.TESTING) { return true; }

    try {
        const token = auth_controller.createTokens({ username: user.username }).access.value;

        let verification_html = await formatHTML("verify.html", {
            name: user.name, 
            verification_url: `${process.env.DOMAIN}/fo/signup/verify?t=${token}`
        });
    
        await mailTo(
            destination = user.email, 
            subject = "Verifica account - Animal House", 
            html = verification_html, 
        );
    }
    catch (err) {
        console.log(err);
        return false;
    }

    return true;
}