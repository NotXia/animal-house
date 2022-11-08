import React from "react";
import { Helmet } from "react-helmet";
import $ from "jquery";
import Navbar from "../../components/Navbar";
import AnimalAPI from "modules/api/animals";
import { isAuthenticated, getUsername } from "modules/auth";
import AnimalCard from "./components/AnimalCard";


class Animals extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            animals: [],

            error_message: ""
        };

        this.handleCreatedAnimal = this.handleCreatedAnimal.bind(this);
        this.handleUpdatedAnimal = this.handleUpdatedAnimal.bind(this);
        this.handleDeletedAnimal = this.handleDeletedAnimal.bind(this);
        
        isAuthenticated().then(is_auth => { if (!is_auth) { window.location = `${process.env.REACT_APP_BASE_PATH}/login?return=${window.location.href}` } } );
    }

    componentDidMount() {
    (async () => {
        try {
            const animals = await AnimalAPI.getUserAnimals(await getUsername());

            this.setState({ animals: animals })
        }
        catch (err) {

        }
    })();
    }

    render() {
        return (<>
            <Helmet>
                <title>I miei animali</title>
            </Helmet>
            
            <Navbar />

            <main className="mt-3">
                <div className="container">
                    <div className="row">
                        <h1>I miei animali</h1>
                    </div>

                    <div className="row">
                        <div className="d-flex justify-content-end w-100">
                            <button className="btn btn-outline-primary px-4 py-2">Aggiungi un nuovo animale</button>
                        </div>
                    </div>

                    <div className="row">
                        {
                            this.state.animals.map((animal) => (
                                <div key={animal.id} className="col-12 col-md-6 col-lg-4 my-3">
                                    <AnimalCard animal={animal} onCreate={this.handleCreatedAnimal} onUpdate={this.handleUpdatedAnimal} onDelete={this.handleDeletedAnimal} />
                                </div>
                            ))
                        }
                        <div className="col-12 col-md-6 col-lg-4">
                            <AnimalCard onCreate={this.handleCreatedAnimal} onUpdate={this.handleUpdatedAnimal} onDelete={this.handleDeletedAnimal} />
                        </div>
                    </div>
                </div>
            </main>
        </>);
    }

    handleCreatedAnimal(created_animal) {
        let animals = this.state.animals;
        animals.push(created_animal);

        this.setState({ animals: animals });
    }

    handleUpdatedAnimal(updated_animal) {

    }

    handleDeletedAnimal(deleted_animal) {

    }
}

export default Animals;