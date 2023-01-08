import React from "react";
import { Helmet } from "react-helmet";
import "../../scss/bootstrap.scss";
import Navbar from "../../components/Navbar";
import { isAuthenticated, isOperator } from "modules/auth";
import ProfileSettingsPage from "./Profile";
import SecuritySettingsPage from "./Security";
import Footer from "../../components/Footer";


class SettingsPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            page: "profile"
        };


        isAuthenticated().then(is_auth => { if (!is_auth) { window.location = `${process.env.REACT_APP_BASE_PATH}/login?return=${window.location.href}`; } } );
        isOperator().then(is_operator => { if (is_operator) { window.location = `/`; } } );
    }

    render() {
        return (<>
            <Helmet>
                <title>Impostazioni</title>
            </Helmet>
            
            <Navbar />

            <main className="mt-3">
                <div className="container">
                    <div className="row ">
                        <h1 className="m-0">Impostazioni</h1>
                    </div>

                    <div className="row">
                        <div className="col-12 col-md-2">
                            <nav aria-label="Navigazione voci impostazioni">
                                <div className="d-flex justify-content-center align-items-start mt-4">
                                    <div className="nav flex-column nav-pills" role="tablist" aria-orientation="vertical">
                                        <button className="nav-link active" data-bs-toggle="pill" role="tab" aria-selected="true" onClick={() => this.setState({ page: "profile" })}>Profilo</button>
                                        <button className="nav-link" data-bs-toggle="pill" role="tab" aria-selected="false" onClick={() => this.setState({ page: "security" })}>Sicurezza</button>
                                    </div>
                                </div>
                            </nav>
                        </div>

                        <div className="col-12 col-md-10">
                            { this.state.page === "profile" && <ProfileSettingsPage /> }
                            { this.state.page === "security" && <SecuritySettingsPage /> }
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </>);
    }
}

export default SettingsPage;