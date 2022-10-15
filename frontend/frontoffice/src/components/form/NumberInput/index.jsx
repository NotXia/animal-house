/**
 * 
 * Componente per gestire gli input numerici con più dettagli (non usa i floating label)
 * Gestisce validazione e visualizzazione degli errori.
 * Attributi accettati:
 *  - id            id dell'elemento <input>
 *  - name          name dell'elemento <input>
 *  - label         label da visualizzare
 *  - required      required dell'elemento <input>
 *  - inline        se si vuole label e input sulla stessa riga
 *  - min           valore minimo
 *  - max           valore massimo
 *  - step          passo di incremento/decremento
 *  - defaultValue  valore di default
 *  - no-controls   se si vogliono nascondere le frecce per incremento/decremento
 *  - hide-label    se si vuole visualizzare la label
 * 
 * Funzioni esposte:
 *      async validate()    valida l'input
 *      value()             restituisce il valore dell'input
 *      focus()             mette il focus sull'input
 *      writeError(msg)     inserisce un messaggio (esterno) di errore
 * 
 * Listener:
 *   - onChange         Richiamato quando viene cambiato il valore
 * 
 */

import React from "react";
import $ from "jquery";

export default class TextInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error_message: "",
            valid: null,
            hadError: false
        };

        this.input = React.createRef();

        this.validation_delay;
        this._inputValidation = this._inputValidation.bind(this);
        this.validate = this.validate.bind(this);
        this.value = this.value.bind(this);
        this.focus = this.focus.bind(this);
        this.writeError = this.writeError.bind(this);
    }

    render() {
        let required_attr = this.props.required ? "required" : "";
        let feedback_container_id = `__container-feedback-${this.props.id}`;
        let aria_invalid = this.state.valid === false;
        let success_message = (this.state.valid === true && this.state.hadError) ? `${this.props.label} corretto` : "";

        let flex_container_class = this.props.inline ? "d-flex align-items-center" : "";
        let arrow_controls_class = this.props["no-controls"] ? "no-arrow-controls" : "";
        let hide_label_class = this.props["hide-label"] ? "visually-hidden" : "";

        return (<>
            <div>
                <div className={`${flex_container_class}`}>
                    <label htmlFor={this.props.id} className={`me-2 ${hide_label_class}`}>{this.props.label}</label>
                    <input ref={this.input} id={this.props.id} className={`form-control w-100 ${arrow_controls_class} text-center`}
                        type="number" required={required_attr} min={this.props.min} max={this.props.max} defaultValue={this.props.defaultValue} step={this.props.step} 
                        name={this.props.name} onChange={(e) => this._inputValidation(e)}
                        aria-label={this.props.label} aria-invalid={aria_invalid} aria-errormessage={feedback_container_id} />
                </div>

                <label id={feedback_container_id} data-feedback-for={this.props.name} htmlFor={this.props.id} className="invalid-feedback d-block ms-1" aria-live="assertive">{this.state.error_message}</label>
                <label htmlFor={this.props.id} className="visually-hidden" aria-live="assertive">{success_message}</label>
            </div>
        </>);
    }


    async _inputValidation(e) {
        this.props.onChange(e);

        clearTimeout(this.validation_delay); // Annulla il timer precedente
    
        this.validation_delay = setTimeout((function() {
            this.validate();
        }).bind(this), 200);
    }

    /**
     * Valida l'input attuale
     */
    async validate() {
        const value = this.input.current.value;

        if (value === "" && !this.props.required) {
            this.setState({ error_message: "", valid: true }); 
            return true; 
        }

        if (value === "" && this.props.required) {
            this.setState({ error_message: `Valore invalido`, valid: false, hadError: true }); 
            return false;
        }
        else if (value < this.props.min) { 
            this.setState({ error_message: `Il valore deve essere almeno ${this.props.min}`, valid: false, hadError: true }); 
            return false;
        }
        else if (value > this.props.max) {
            this.setState({ error_message: `Il valore può essere al massimo ${this.props.max}`, valid: false, hadError: true }); 
            return false;
        }
        else if (value % this.props.step) {
            this.setState({ error_message: `Il valore deve essere un multiplo di ${this.props.step}`, valid: false, hadError: true }); 
            return false;
        }

        this.setState({ error_message: "", valid: true }); 
        return true; 
    }

    /**
     * Restituisce il valore dell'input attuale
     */
    value() {
        return this.input.current.value;
    }

    /**
     * Mette il focus sull'input
     */
    focus() {
        $(`#${this.props.id}`).trigger("focus");
    }
    
    /**
     * Inserisce manualmente un messaggio di errore
     */
    writeError(error_message) {
        this.setState({ error_message: error_message, valid: false, hadError: true });
    }
}

