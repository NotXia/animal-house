/**
 * 
 * Componente per gestire l'input di nome e cognome
 * Attributi accettati:
 *  - id            id dell'elemento <input>        [default: "input-name"]
 *  - name          name dell'elemento <input>      [default: "name"]
 *  - label         label da visualizzare           [default: "Nome"]
 *  - required      required dell'elento <input>    [default: false]
 * 
 */

import React from "react";
import GenericTextInput from "../GenericTextInput";

export default class InputName extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.element = {
            id: this.props.id ? this.props.id : "input-name",
            name: this.props.name ? this.props.name : "name",
            label: this.props.label ? this.props.label : "Nome",
            required: this.props.required
        }

        this.validation = this.validation.bind(this);
    }

    render() {
        return (<>
            <GenericTextInput id={this.element.id} type="text" name={this.element.name} label={this.element.label} validation={this.validation} required={this.element.required}/>
        </>);
    }


    validation(value) {
        if (this.props.required && value.trim().length === 0) { return `${this.element.label} mancante`; }

        return "";
    }
}

