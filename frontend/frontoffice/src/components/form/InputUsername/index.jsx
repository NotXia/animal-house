/**
 * 
 * Componente per gestire l'input dello username
 * Attributi accettati:
 *  - id            id dell'elemento <input>        [default: "input-username"]
 *  - name          name dell'elemento <input>      [default: "username"]
 *  - label         label da visualizzare           [default: "Username"]
 *  - required      required dell'elento <input>    [default: false]
 * 
 */

import React from "react";
import GenericTextInput from "../GenericTextInput";

export default class InputUsername extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.element = {
            id: this.props.id ? this.props.id : "input-username",
            name: this.props.name ? this.props.name : "username",
            label: this.props.label ? this.props.label : "Username",
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
        if (this.props.required && value.trim().length === 0)           { return `${this.element.label} mancante`; }
        else if (value.trim().length > 0 && value.trim().length <= 2)   { return `${this.element.label} troppo corto`; }

        return "";
    }
}

