import React from "react";
import { Helmet } from "react-helmet";
import Navbar from "../../components/Navbar";
import Loading from "../../components/Loading";
import SearchParamsHook from "../../hooks/SearchParams";
import UserAPI from "modules/api/user.js";


class ProfilePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error_message: ""
        };

        this.loading = React.createRef();
    }


    componentDidMount() {
        if (!this.props.searchParams.get("username")) { window.location.href = "/"; }

        this.loading.current.wrap(async () => {
            try {
                const profile = await UserAPI.getProfile(this.props.searchParams.get("username"));
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
                    {
                        this.state.profile &&
                        <div className="row">
                            <div className="col-12 col-md-6">
                                <div className="d-flex justify-content-center justify-content-md-end align-items-center h-100">
                                    <div className="d-flex justify-content-center align-items-center overflow-hidden border" style={{ maxHeight: "12rem", maxWidth: "12rem", borderRadius: "50%" }}>
                                        <img src={`${process.env.REACT_APP_DOMAIN}${this.state.profile.picture}`} alt={`Immagine di profilo di ${this.state.profile.username}`} 
                                            style={{ maxHeight: "100%", maxWidth: "100%" }} />
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 col-md-6">
                                <div className="d-flex align-items-center h-100">
                                    <div>
                                        <h1 className="fs-2 fw-semibold m-0"><span className="visually-hidden">Profilo di</span> @{this.state.profile.username}</h1>
                                        <p className="fs-4 mb-0">{this.state.profile.name} {this.state.profile.surname}</p>

                                        {
                                            this.state.profile.role && // Si tratta di un operatore
                                            <div>
                                                <p className="fs-5">{this.state.profile.role}</p>

                                                <h2 className="fs-5 fw-semibold">Contatti</h2>
                                                <p className="m-0">Email: {this.state.profile.email}</p>
                                                <p className="m-0">Telefono: {this.state.profile.phone}</p>
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                </div>
            </main>
        </>);
    }
}

export default SearchParamsHook(ProfilePage);