import React from "react";
import { Helmet } from "react-helmet";
import $ from "jquery"
import TextInput from "../../components/form/TextInput";
import { isAuthenticated } from "modules/auth.js";
import SearchParamsHook from "../../hooks/SearchParams";

class Booking extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error_message: "",
        };

        this.input = {

        }

        isAuthenticated().then(is_auth => { if (!is_auth) { window.location = `${process.env.REACT_APP_BASE_PATH}/login?return=${window.location.href}`; } } );
    }
    
    componentDidMount() {

    }

    render() {
        return (<>
            <Helmet>
                <title>Crea appuntamento</title>
            </Helmet>
            
            <div class="container">
                
            </div>
        </>);
    }
}

export default SearchParamsHook(Booking);