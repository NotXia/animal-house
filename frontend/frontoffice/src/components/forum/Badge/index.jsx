/**
 * 
 * Mostra un badge associato al tipo di utente
 * Proprietà:
 * - username
 * 
 */

import React from "react";
import moment from "moment";
import UserAPI from "modules/api/user";
import { Tooltip } from "bootstrap";


class UserBadge extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: null
        };
    }

    componentDidMount() {
        this.initBadge();
    }
    componentDidUpdate(prevProps) {
        if (this.props.username === prevProps.username) { return; }
        this.initBadge();
    }

    async initBadge() {
        try {
            const user = await UserAPI.getProfile(this.props.username);

            this.setState({ 
                user: user
            }, () => { [...document.querySelectorAll('[data-bs-toggle="tooltip"]')].map(tooltip => new Tooltip(tooltip)); });
        }
        catch (err) {
        }
    }

    render() {
        // Utente VIP
        if (this.state.user?.vip_until && moment(this.state.user?.vip_until).isSameOrAfter(moment())) {
            return (
                <img src={`${process.env.REACT_APP_DOMAIN}/img/icons/vip.png`} alt="Utente VIP" style={this.props.style ? this.props.style : { height: "1rem" }}
                     data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="Questo utente è un VIP!"/>
            );
        }
        // Operatore
        else if (this.state.user?.role) {
            return (
                <img src={`${process.env.REACT_APP_DOMAIN}/logos/logo.png`} alt="Operatore" style={this.props.style ? this.props.style : { height: "1.2rem" }}
                     data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="Profilo di un operatore di Animal House"/>
            );
        }
        else {
            return null;
        }
    }
}

export default UserBadge;