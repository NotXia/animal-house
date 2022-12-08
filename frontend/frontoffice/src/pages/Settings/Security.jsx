import React from "react";
import Loading from "../../components/Loading";
import UserAPI from "modules/api/user.js";
import { getUsername } from "modules/auth";
import TextInput from "../../components/form/TextInput";
import UserValidation from "../../utilities/validation/UserValidation";


class ProfilePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error_message: ""
        };

        this.loading = React.createRef();

        this.input = {
            password1: React.createRef(),
            password2: React.createRef(),
        };
    }


    render() {
        return (<>
            <Loading ref={this.loading} />

            <div className="container">
                <div className="row">
                    <p className="invalid-feedback d-block fs-5 fw-semibold text-center" aria-live="assertive">{this.state.error_message}</p>
                </div>

                <form onSubmit={(e) => this.updatePassword(e)}>
                    <div className="row">
                        <div className="col-12 col-md-6 offset-md-3">
                            <section aria-label="Modifica password">
                                <div className="row mt-3">
                                    <h3 className="fs-4">Modifica password</h3>

                                    <TextInput ref={this.input.password1} id="data-password1" type="password" name="password1" label="Nuova password" validation={UserValidation.password} required/>
                                    <div className="mt-2">
                                        <TextInput ref={this.input.password2} id="data-password2" type="password" name="password2" label="Ripeti password" required/>
                                    </div>
                                </div>
                            </section>

                            <div className="d-flex justify-content-center mt-3">
                                <button className="btn btn-outline-success" type="submit">Salva</button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </>);
    }

    async updatePassword(e) {
        e.preventDefault();

        if (this.input.password1.current.value() !== this.input.password2.current.value()) {
            return this.setState({ error_message: "Le password non coincidono"});
        }

        this.loading.current.wrap(async () => {
            try {
                const data = {
                    password: this.input.password1.current.value()
                }
                await UserAPI.update(await getUsername(), data);

                this.setState({ error_message: ""});
            }
            catch (err) {
                this.setState({ error_message: "Non è stato possibile aggiornare la password" })
            }
        })
    }
}

export default ProfilePage;