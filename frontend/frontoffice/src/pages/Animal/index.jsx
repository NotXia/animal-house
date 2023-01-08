import React from "react";
import { Helmet } from "react-helmet";
import "../../scss/bootstrap.scss";
import $ from "jquery";
import Navbar from "../../components/Navbar";
import AnimalAPI from "modules/api/animals";
import { isAuthenticated, getUsername } from "modules/auth";
import { getUserPreferences } from "modules/preferences";
import AnimalCard from "./components/AnimalCard";
import Footer from "../../components/Footer";
import Loading from "../../components/Loading";


class Animals extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            animals: [],
            current_create_card: null,
            is_auth: false,

            error_message: ""
        };

        this.handleCreatedAnimal = this.handleCreatedAnimal.bind(this);
        this.handleUpdatedAnimal = this.handleUpdatedAnimal.bind(this);
        this.handleDeletedAnimal = this.handleDeletedAnimal.bind(this);
        
        this.loading = new React.createRef();
        // isAuthenticated().then(is_auth => { if (!is_auth) { window.location = `${process.env.REACT_APP_BASE_PATH}/login?return=${window.location.href}` } } );
    }

    componentDidMount() {
        this.loading.current.wrap(async () => {
            this.setState({ is_auth: await isAuthenticated() });
    
            if (await isAuthenticated()) { 
                // Caricamento animali reali
                try {
                    const animals = await AnimalAPI.getUserAnimals(await getUsername());
        
                    this.setState({ animals: animals })
                }
                catch (err) {
                    this.setState({ error_message: "Non è stato possibile trovare gli animali" });
                }
            }
            else {
                // Caricamento da local storage
                const user_preferences = getUserPreferences();
                if (user_preferences && user_preferences.animals) {
                    this.setState({ animals: user_preferences.animals })
                }
            }
        });
    }

    render() {
        return (<>
            <Helmet>
                <title>I miei animali</title>
            </Helmet>
            
            <Navbar />
            <Loading ref={this.loading}/>

            <main className="mt-3">
                <div className="container">
                    <div className="row">
                        <h1>{`${ this.state.is_auth ? "I miei animali" : "Presentati" }`}</h1>
                        <p className="text-center text-danger fw-semibold fs-5">{this.state.error_message}</p>
                    </div>

                    <section aria-label="Aggiungi un nuovo animale">
                        <div className="row">
                            <div className="d-flex justify-content-center justify-content-md-end w-100">
                                <button className="btn btn-outline-primary px-4 py-2" disabled={this.state.current_create_card ? true : false} onClick={() => { this.startCreateAnimal(); }}>Aggiungi un nuovo animale</button>
                            </div>
                        </div>
                    </section>

                    <section aria-label="Lista dei miei animali">
                        <div className="row">
                            {
                                this.state.animals.length === 0 &&
                                <p className="fs-5">Non hai nessun animale :(</p>
                            }
                            {
                                this.state.animals.map((animal) => (
                                    <div key={animal.id} className="col-12 col-md-6 col-lg-4 my-3">
                                        <AnimalCard animal={animal} onUpdate={this.handleUpdatedAnimal} onDelete={this.handleDeletedAnimal} />
                                    </div>
                                ))
                            }
                            <div className="col-12 col-md-6 col-lg-4 my-3">
                                <div id="card-create-animal" className="visually-hidden" tabIndex={0}>Aggiungi un nuovo animale</div>
                                { this.state.current_create_card }
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
        </>);
    }

    handleCreatedAnimal(created_animal) {
        let animals = this.state.animals;
        animals.push(created_animal);

        this.setState({ 
            animals: animals,
            current_create_card: null
        });
    }

    handleUpdatedAnimal(updated_animal) {
        let animals = this.state.animals;
        animals[animals.findIndex((animal) => animal.id === updated_animal.id)] = updated_animal;

        this.setState({ animals: animals });
    }

    handleDeletedAnimal(deleted_animal) {
        let animals = this.state.animals.filter((animal) => animal.id != deleted_animal.id);
        this.setState({ animals: animals });
    }

    
    startCreateAnimal() {
        this.setState({ current_create_card: (<AnimalCard key={`create-animal-${Date.now()}`} onCreate={this.handleCreatedAnimal} 
                                                          onCreateAbort={() => { this.setState({ current_create_card: null }) }} />) }, () => {
            $("#card-create-animal").trigger("focus");
        });
    }
}

export default Animals;