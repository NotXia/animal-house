import React from "react";
import { Helmet } from "react-helmet";
import "../../scss/bootstrap.scss";
import $ from "jquery";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { _parseJwt } from "modules/auth";


class Success extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            canSendMail: false,
            mailSent: false,
            message: ""
        };
    }

    async componentDidMount() {
        const query = new Proxy(new URLSearchParams(window.location.search), {
            get: (searchParams, prop) => searchParams.get(prop),
        });
        this.token = query.t;

        try {
            if (!this.token) { return; }

            await $.ajax({
                method: "PUT", url: "/users/customers/enable-me",
                headers: { Authorization: `Bearer ${this.token}` }
            });

            this.setState({ message: "Account attivato correttamente" });
        }
        catch (err) {
            switch (err.status) {
                case 401:
                    this.setState({ message: "Non siamo riusciti a verificare l'account", canSendMail: true });
                    $("#result").html("Non attivato");
                    break;

                case 403:
                    this.setState({ message: "L'account è già attivo" });
                    break;

                default:
                    this.setState({ message: "Si è verificato un erorre" });
                    break;
            }
        }
    }

    render() {
        return (<>
            <Helmet>
                <title>Verifica account</title>
            </Helmet>

            <Navbar />
            
            <main className="d-flex justify-content-center align-items-center w-100" style={{ minHeight: "69vh" }}>
                <div className="text-center">
                    <div aria-live="assertive" role="alert">
                        <p className="fs-3">{this.state.message}</p>
                    </div>

                    <div className={`${this.state.canSendMail ? "" : "d-none"}`}>
                        <button className="btn btn-outline-primary" onClick={() => this.resendMail()} disabled={this.state.mailSent}>
                            { this.state.mailSent ? "Ti abbiamo inviato una nuova mail" : "Invia nuova mail" }
                        </button>
                    </div>
                </div>
            </main>

            <Footer />
        </>);
    }

    async resendMail(){
        const username = _parseJwt(this.token).username;

        try {
            await $.ajax({
                method: "GET", 
                url: `/users/customers/${username}/verification-mail`
            });
            
            this.setState({ mailSent: true });
        }
        catch (err) {
            this.setState({ message: "Si è verificato un errore" });
        }
    }
}

export default Success;