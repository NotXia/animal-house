import React from "react";
import { Helmet } from "react-helmet";
import "../../scss/bootstrap.scss";
import $ from "jquery";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { _parseJwt } from "modules/auth";
import { getUserPreferences } from "modules/preferences";


class Success extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            state: "",
            mailSent: false,
            animal_loaded: false
        };
    }

    async componentDidMount() {
        const query = new Proxy(new URLSearchParams(window.location.search), {
            get: (searchParams, prop) => searchParams.get(prop),
        });
        this.token = query.t;

        try {
            if (!this.token) { return; }

            // Abilitazione account
            await $.ajax({
                method: "PUT", url: "/users/customers/enable-me",
                headers: { Authorization: `Bearer ${this.token}` }
            });

            // Inserimento animali presentati
            const animals = getUserPreferences().animals;
            if (animals) {
                for (const animal of animals) {
                    await $.ajax({
                        method: "POST", url: `/users/customers/${encodeURIComponent(_parseJwt(this.token).username)}/animals/`,
                        headers: { Authorization: `Bearer ${this.token}` },
                        data: {
                            name: animal.name,
                            species: animal.species
                        }
                    });
                }

                this.setState({ animal_loaded: true });
            }

            this.setState({ state: "success" });
        }
        catch (err) {
            switch (err.status) {
                case 401:
                    this.setState({ state: "failure" });
                    break;

                case 403:
                    this.setState({ state: "active" });
                    break;

                default:
                    this.setState({ state: "error" });
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
                        {
                            this.state.state === "success" &&
                            <>
                                <p className="fs-2 fw-semibold m-0">Benvenuto in Animal House</p>
                                <p className="fs-3 m-0">L'account è stato attivato correttamente</p>
                                {
                                    this.state.animal_loaded &&
                                    <p className="fs-3">Ti abbiamo associato gli animali che ci hai presentato</p>
                                }
                                <a className="btn btn-primary btn-lg mt-2" href="/fo/login">Accedi ora</a>
                            </>
                        }
                        {
                            this.state.state === "failure" &&
                            <>
                                <p className="fs-3">Non siamo riusciti a verificare l'account</p>
                                <button className="btn btn-outline-primary" onClick={() => this.resendMail()} disabled={this.state.mailSent}>
                                    { this.state.mailSent ? "Ti abbiamo inviato una nuova mail" : "Invia nuova mail" }
                                </button>
                            </>
                        }
                        {
                            this.state.state === "active" &&
                            <>
                                <p className="fs-3">L'account è già attivo</p>
                            </>
                        }
                        {
                            this.state.state === "error" &&
                            <>
                                <p className="fs-3">Si è verificato un erorre</p>
                            </>
                        }
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