import React from "react";
import { Helmet } from "react-helmet";
import Navbar from "../../components/Navbar";
import Loading from "../../components/Loading";
import UserAPI from "modules/api/user.js";
import { getUsername, isAuthenticated, isOperator } from "modules/auth";
import TextInput from "../../components/form/TextInput";
import UserValidation from "../../utilities/validation/UserValidation";


class ProfilePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            profile: null,

            error_message: ""
        };

        this.loading = React.createRef();

        this.input = {
            username: React.createRef(),
            name: React.createRef(),
            surname: React.createRef(),
            email: React.createRef(),
            phone: React.createRef(),
            address: {
                street: React.createRef(),
                number: React.createRef(),
                city: React.createRef(),
                postal_code: React.createRef()
            }
        }

        isAuthenticated().then(is_auth => { if (!is_auth) { window.location = `${process.env.REACT_APP_BASE_PATH}/login?return=${window.location.href}`; } } );
        isOperator().then(is_operator => { if (is_operator) { window.location = `/`; } } );
    }


    componentDidMount() {
        this.loading.current.wrap(async () => {
            try {
                const profile = await UserAPI.getAllData(await getUsername());
                console.log(profile)
                this.setState({ profile: profile });
            }
            catch (err) {
                this.setState({ error_message: "Non è stato possibile trovare l'utente" });
            }
        });
    }

    render() {
        return (<>
            <Helmet>
                <title>Profilo</title>
            </Helmet>
            
            <Navbar />
            <Loading ref={this.loading} />

            <main className="mt-3">
                <div className="container">
                    <div className="row">
                        <h1 className="text-center">Impostazioni profilo</h1>
                        <p className="invalid-feedback d-block fs-5 fw-semibold text-center" aria-live="assertive">{this.state.error_message}</p>
                    </div>
                    {
                        this.state.profile &&
                        <div>
                            <section aria-label="Dati dell'utente">
                                <div className="row">
                                    {/* Immagine di profilo */}
                                    <div className="col-12 col-md-5">
                                        <section aria-label="Immagine di profilo">
                                            <div className="d-flex justify-content-center justify-content-md-end h-100">
                                                <div className="d-flex justify-content-center align-items-center overflow-hidden border" style={{ height: "10rem", width: "10rem", borderRadius: "50%" }}>
                                                    <img src={`${process.env.REACT_APP_DOMAIN}${this.state.profile.picture}`} alt={`Immagine di profilo di ${this.state.profile.username}`} 
                                                        style={{ maxHeight: "100%", maxWidth: "100%" }} />
                                                </div>
                                            </div>
                                        </section>
                                    </div>

                                    {/* Anagrafica */}
                                    <div className="col-12 col-md-5">

                                        <section aria-label="Dati anagrafici">
                                            <div className="row">
                                                <h2 className="fs-4">Dati anagrafici</h2>
                                                
                                                <p><span className="fw-semibold">Username</span> {this.state.profile.username}</p>

                                                <div className="col-12 col-md-6">
                                                    <TextInput ref={this.input.name} id="data-name" type="text" name="name" label="Nome" validation={UserValidation.name} required/>
                                                </div>
                                                <div className="col-12 col-md-6">
                                                    <TextInput ref={this.input.surname} id="data-surname" type="text" name="surname" label="Cognome" validation={UserValidation.surname} required/>
                                                </div>
                                            </div>
                                        </section>


                                        <section aria-label="Email e telefono">
                                            <div className="row mt-3">
                                                <h2 className="fs-4">Informazioni di contatto</h2>

                                                <TextInput ref={this.input.email} id="data-email" type="email" name="email" label="Email" validation={UserValidation.email} required/>
                                                <TextInput ref={this.input.phone} id="data-phone" type="text" name="phone" label="Telefono" validation={UserValidation.phone} required/>
                                            </div>
                                        </section>

                                        <section aria-label="Indirizzo">
                                            <div className="row mt-3">
                                                <h2 className="fs-4">Informazioni di spedizione</h2>
                                                
                                                <div className="col-12 col-md-6">
                                                    <TextInput ref={this.input.address.street} id="data-street" type="text" name="street" label="Via" validation={UserValidation.street} required/>
                                                </div>
                                                <div className="col-12 col-md-6">
                                                    <TextInput ref={this.input.address.number} id="data-number" type="text" name="number" label="Civico" validation={UserValidation.number} required/>
                                                </div>
                                                <div className="col-12 col-md-6">
                                                    <TextInput ref={this.input.address.city} id="data-city" type="text" name="city" label="Città" validation={UserValidation.city} required/>
                                                </div>
                                                <div className="col-12 col-md-6">
                                                    <TextInput ref={this.input.address.postal_code} id="data-postal_code" type="text" name="postal_code" label="CAP" validation={UserValidation.postal_code} required/>
                                                </div>
                                            </div>
                                        </section>
                                    </div>
                                </div>
                            </section>
                        </div>
                    }
                </div>
            </main>
        </>);
    }
}

export default ProfilePage;