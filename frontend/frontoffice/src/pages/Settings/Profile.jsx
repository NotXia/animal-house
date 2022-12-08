import React from "react";
import Loading from "../../components/Loading";
import UserAPI from "modules/api/user.js";
import FileAPI from "modules/api/file.js";
import { getUsername } from "modules/auth";
import TextInput from "../../components/form/TextInput";
import UserValidation from "../../utilities/validation/UserValidation";


class ProfilePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            profile: null,
            profile_picture: null,

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
        };
        this.current_uploaded_profile_image = undefined;

        this.old_profile = null;
    }


    componentDidMount() {
        this.loading.current.wrap(async () => {
            try {
                const profile = await UserAPI.getAllData(await getUsername());
                this.old_profile = JSON.parse(JSON.stringify(profile)); // Copia per annullamento modifiche
                
                this.setState({ profile: profile, profile_picture: profile.picture }, () => { this.loadProfile(); });
            }
            catch (err) {
                this.setState({ error_message: "Non è stato possibile trovare l'utente" });
            }
        });
    }

    render() {
        return (<>
            <Loading ref={this.loading} />

            <div className="container">
                <div className="row">
                    <p className="invalid-feedback d-block fs-5 fw-semibold text-center" aria-live="assertive">{this.state.error_message}</p>
                </div>
                {
                    this.state.profile &&
                    <form onSubmit={(e) => this.updateUser(e)}>
                        <div className="row">
                            {/* Immagine di profilo */}
                            <div className="col-12 col-md-4 order-1 order-md-2">
                                <section aria-label="Immagine di profilo">
                                    <div className="d-flex justify-content-center justify-content-md-start h-100">
                                        <div className="d-flex justify-content-center align-items-center overflow-hidden border" style={{ height: "10rem", width: "10rem", borderRadius: "50%" }}>
                                            <img src={`${process.env.REACT_APP_DOMAIN}${this.state.profile_picture}`} alt={`Immagine di profilo`} 
                                                    style={{ maxHeight: "100%", maxWidth: "100%" }} />
                                        </div>
                                    </div>

                                    <div className="d-flex justify-content-center justify-content-md-start h-100 my-2">
                                        <div className="input-group" style={{ width: "10rem" }}>
                                            <input type="file" className="form-control" aria-label="Carica immagine di profilo" accept="image/*" onChange={(e) => this.handleImagePreview(e)}/>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            {/* Anagrafica */}
                            <div className="col-12 col-md-8 order-2 order-md-1">

                                <section aria-label="Dati anagrafici">
                                    <div className="row">
                                        <h3 className="fs-4">Dati anagrafici</h3>
                                        
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
                                        <h3 className="fs-4">Informazioni di contatto</h3>

                                        <TextInput ref={this.input.email} id="data-email" type="email" name="email" label="Email" validation={UserValidation.email} required/>
                                        <TextInput ref={this.input.phone} id="data-phone" type="text" name="phone" label="Telefono" validation={UserValidation.phone} required/>
                                    </div>
                                </section>

                                <section aria-label="Indirizzo">
                                    <div className="row mt-3">
                                        <h3 className="fs-4">Informazioni di spedizione</h3>
                                        
                                        <div className="col-12 col-md-8">
                                            <TextInput ref={this.input.address.street} id="data-street" type="text" name="street" label="Via" validation={UserValidation.street} required/>
                                        </div>
                                        <div className="col-12 col-md-4">
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

                                <div className="d-flex justify-content-center mt-2">
                                    <button className="btn btn-outline-success mx-1" type="submit">Salva</button>
                                    <button className="btn btn-outline-secondary mx-1" type="button" onClick={() => this.handleReset()}>Annulla</button>
                                </div>
                            </div>
                        </div>
                    </form>
                }
            </div>
        </>);
    }


    /* Carica i dati dell'utente nel form */
    loadProfile() {
        this.input.name.current.value(this.state.profile.name);
        this.input.surname.current.value(this.state.profile.surname);
        this.input.email.current.value(this.state.profile.email);
        this.input.phone.current.value(this.state.profile.phone);
        this.input.address.street.current.value(this.state.profile.address.street);
        this.input.address.number.current.value(this.state.profile.address.number);
        this.input.address.city.current.value(this.state.profile.address.city);
        this.input.address.postal_code.current.value(this.state.profile.address.postal_code);

        // Validazione
        this.input.name.current.validate();
        this.input.surname.current.validate();
        // this.input.email.current.validate();
        this.input.phone.current.validate();
        this.input.address.street.current.validate();
        this.input.address.number.current.validate();
        this.input.address.city.current.validate();
        this.input.address.postal_code.current.validate();

        this.setState({ profile_picture: this.state.profile.picture });
        this.current_uploaded_profile_image = undefined;
    }


    async handleImagePreview(e) {
        if (e.target.files) {
            try {
                const uploaded_file = await FileAPI.uploadRaw(e.target.files);
                this.current_uploaded_profile_image = uploaded_file[0];
    
                this.setState({ profile_picture: `/tmp/${uploaded_file[0]}` });
            }
            catch (err) {
                this.setState({ error_message: "Non è stato possibile caricare l'immagine di profilo" })
            }
        }
    }

    handleReset() {
        this.setState({ profile: this.old_profile }, () => this.loadProfile());
    }

    async updateUser(e) {
        e.preventDefault();

        this.loading.current.wrap(async () => {
            try {
                const data = {
                    name: this.input.name.current.value(),
                    surname: this.input.surname.current.value(),
                    email: this.input.email.current.value(),
                    phone: this.input.phone.current.value(),
                    picture: this.current_uploaded_profile_image,
                    address: {
                        street: this.input.address.street.current.value(),
                        number: this.input.address.number.current.value(),
                        city: this.input.address.city.current.value(),
                        postal_code: this.input.address.postal_code.current.value()
                    }
                }
                const updated_profile = await UserAPI.update(await getUsername(), data);
                
                // Aggiornamento form
                this.setState({ profile: updated_profile }, () => this.loadProfile());
            }
            catch (err) {
                this.setState({ error_message: "Non è stato possibile aggiornare il profilo" })
            }
        })
    }
}

export default ProfilePage;