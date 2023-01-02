import React from "react";
import { Helmet } from "react-helmet";
import { logout } from "modules/auth"
import { clearUserPreferences } from "modules/preferences";

export default class Logout extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        logout().then(() => {
            clearUserPreferences();
            window.location.href = "/"; 
        });

        return (<>
            <Helmet>
                <title>Logout</title>
            </Helmet>
            
            <div className="d-flex justify-content-center align-items-center vh-100 vw-100">
                <div className="text-center">
                    <h1>Logout</h1>
                    <p className="fs-5">Verrei reindirizzato tra poco</p>
                </div>
            </div>
        </>);
    }
}
