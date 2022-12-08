/**
 * Validatori dei dati dell'utente
 */

import $ from "jquery";

export default class UserValidation {

    static async username(value, required) {
        if (required && value.trim().length === 0)                      { return `Username mancante`; }
        else if (value.trim().length > 0 && value.trim().length <= 2)   { return `Username troppo corto`; }

        const username_availability = await $.ajax({ method: "GET", url: `${process.env.REACT_APP_DOMAIN}/users/usernames/available/${encodeURIComponent(value)}` }).catch((err)=>{});
        if (!username_availability.available) { return `Username già in uso`; }

        return "";
    }

    static async password(value, required) {
        const hasLowercase = function (password) { return password.toUpperCase() != password; }
        const hasUppercase = function (password) { return password.toLowerCase() != password; }
        const hasNumber = function (password) { return String(password).match( /[0-9]/ ); }
        const hasSpecialCharacter = function (password) { return String(password).match( /\W/ ); }

        if (required && value.length === 0)  { return `Password mancante`; }
        else if (value.length < 8)                      { return `La password deve contenere almeno 8 caratteri`; }
        else if (!hasLowercase(value))                  { return `La password deve contenere almeno un carattere minuscolo`; }
        else if (!hasUppercase(value))                  { return `La password deve contenere almeno un carattere maiuscolo`; }
        else if (!hasNumber(value))                     { return `La password deve contenere almeno una cifra`; }
        else if (!hasSpecialCharacter(value))           { return `La password deve contenere almeno un carattere speciale`; }
        
        return "";
    }

    static async email(value, required) {
        const isValidEmail = function (email) { return String(email.toLowerCase()).match( /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ ); }

        if (required && value.trim().length === 0)   { return `Email mancante`; }
        else if (!isValidEmail(value))               { return `Email non valida`; }

        const email_availability = await $.ajax({ method: "GET", url: `${process.env.REACT_APP_DOMAIN}/users/emails/available/${encodeURIComponent(value)}` }).catch((err)=>{});
        if (!email_availability.available) { return `Email già in uso`; }
        
        return "";
    }

    static name(value, required) {
        if (required && value.trim().length === 0) { return `Nome mancante`; }
        return "";
    }

    static surname(value, required) {
        if (required && value.trim().length === 0) { return `Cognome mancante`; }
        return "";
    }

    static async phone(value, required) {
        const isValidPhone = function (phone) { return String(phone).match( /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/ ); }

        if (required && value.length === 0)  { return `Telefono mancante`; }
        else if (!isValidPhone(value))       { return `Telefono non valido`; }
        
        return "";
    }

    static city(value, required) {
        if (required && value.trim().length === 0) { return `Città mancante`; }
        return "";
    }
    static street(value, required) {
        if (required && value.trim().length === 0) { return `Indirizzo mancante`; }
        return "";
    }
    static number(value, required) {
        if (required && value.trim().length === 0) { return `Numero civico mancante`; }
        return "";
    }
    static postal_code(value, required) {
        if (required && value.trim().length === 0) { return `CAP mancante`; }
        return "";
    }

}