import React from "react";
import $ from "jquery";
import TextInput from "../../../components/form/TextInput";
import SpeciesAPI from "modules/api/species";
import AnimalAPI from "modules/api/animals";
import { getUsername } from "modules/auth";


class AnimalCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mode: "",
            animal: null,
            species: [],

            error_message: ""
        };

        this.input = {
            name: React.createRef(),
            species: React.createRef(),
        }
    }

    componentDidMount() {
        (async () => {
            try {
                const species = await SpeciesAPI.getSpecies();
                this.setState({ species: species });
            }
            catch (err) {

            }
        })()

        if (this.props.animal) {
            this.setState({ animal: this.props.animal, mode: "read" });
        }
        else {
            this.setState({ mode: "write" });
        }
    }

    render() {
        let picture_src = `${process.env.REACT_APP_DOMAIN}/animals/images/default.png`;
        const animal_id = this.state.animal?.id ?? Date.now();

        if (this.state.mode === "write") {
            return (<>
                <div className="border rounded px-3 py-4 w-100">
                    <form onSubmit={(e) => { e.preventDefault(); this.handleForm(); }}>
                        <div style={{ borderRadius: "50%", height: "6rem", width: "6rem", padding: 0, margin: "auto", overflow: "hidden" }}>
                            <img src={picture_src} alt="" className="w-100 h-100" />
                        </div>

                        <div className="mt-2">
                            <TextInput ref={this.input.name} id={`_input-name-${animal_id}`} name={`name-${animal_id}`} type="text" label="Nome" required />

                            <label htmlFor={`_input-species-${animal_id}`}>Specie</label>
                            <select ref={this.input.species} id={`_input-species-${animal_id}`} className="form-select" defaultValue={this.state.animal?.species ?? ""} required>
                                <option value="" disabled>Seleziona una specie</option>
                                {
                                    this.state.species.map((species) => (
                                        <option key={`${species.name}-${animal_id}`} value={species.name}>{species.name}</option>
                                    ))
                                }
                            </select>
                        </div>

                        <div className="mt-2 d-flex justify-content-center">
                            <button className="btn btn-outline-success">Salva</button>
                        </div>
                    </form>
                </div>
            </>);
        }
        else if (this.state.mode === "read") {
            console.log(this.state.animal)
            return (<>
                <div className="border rounded px-3 py-4 w-100">
                    <div style={{ borderRadius: "50%", height: "6rem", width: "6rem", padding: 0, margin: "auto", overflow: "hidden" }}>
                        <img src={picture_src} alt="" className="w-100 h-100" />
                    </div>

                    <div className="mt-2 text-center">
                        <p className="fw-semibold fs-5">{this.state.animal.name}</p>
                        <p className="fs-6">{this.state.animal.species}</p>
                    </div>

                    <div className="mt-2 d-flex justify-content-center">
                        <button className="btn btn-outline-secondary">Modifica</button>
                    </div>
                </div>
            </>);
        }
    }

    async handleForm() {
        const animal_data = {
            name: this.input.name.current.value(),
            species: this.input.species.current.value
        }

        let new_animal = null;

        if (this.state.animal) { // Animale già esistente (da aggiornare)
            new_animal = await AnimalAPI.updateAnimalById(this.state.animal.id, animal_data);
            this.props.onUpdate(new_animal);
        }
        else { // Animale da creare
            new_animal = await AnimalAPI.createAnimalForUser(await getUsername(), animal_data);
            this.props.onCreate(new_animal);
        }
        
        // this.setState({ animal: new_animal, mode: "view" });
    }
}

export default AnimalCard;