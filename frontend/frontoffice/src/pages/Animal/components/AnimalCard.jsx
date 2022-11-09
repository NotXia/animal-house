import React from "react";
import $ from "jquery";
import TextInput from "../../../components/form/TextInput";
import SpeciesAPI from "modules/api/species";
import AnimalAPI from "modules/api/animals";
import FileAPI from "modules/api/file";
import { getUsername } from "modules/auth";


class AnimalCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mode: "",

            species: [],
            
            animal: null,
            profile_src: `${process.env.REACT_APP_DOMAIN}/animals/images/default.png`,

            error_message: ""
        };

        this.input = {
            name: React.createRef(),
            species: React.createRef(),
            profile: React.createRef(),
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
            this.setState({ 
                animal: this.props.animal, 
                profile_src: `${process.env.REACT_APP_DOMAIN}${this.props.animal.image_path ? this.props.animal.image_path : "/animals/images/default.png" }`,
                mode: "read" 
            });
        }
        else {
            this.setState({ mode: "write" });
        }
    }

    render() {
        const animal_id = this.state.animal?.id ?? Date.now();

        if (this.state.mode === "write") {
            return (<>
                <div className="border rounded px-3 py-4 w-100">
                    <form onSubmit={(e) => { e.preventDefault(); this.handleForm(); }}>
                        <div className="position-relative" style={{ height: "6rem", width: "6rem", padding: 0, margin: "auto" }}>
                            <div style={{ borderRadius: "50%", padding: 0, margin: "auto", overflow: "hidden" }}>
                                <img src={this.state.profile_src} alt="" className="w-100 h-100" />
                            </div>

                            <div className="position-absolute bottom-0 end-0">
                                <button className="btn btn-link p-0" onClick={() => this.input.profile.current.click()} type="button"
                                        aria-label={this.state.animal?.name ? `Carica immagine per ${this.state.animal.name}` : "Carica immagine per il tuo animale" }>
                                    <img src={`${process.env.REACT_APP_DOMAIN}/img/icons/camera.png`} alt="" style={{ height: "1.5rem", width: "1.5rem" }} />
                                </button>
                            </div>
                            <input ref={this.input.profile} className="visually-hidden" type="file" accept="image/*" onChange={(e) => this.handleProfilePreview(e)} />
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
                            <button className="btn btn-outline-success mx-1">Salva</button>
                            {
                                (() => {
                                    if (!this.props.onCreate) {
                                        return (
                                            <button className="btn btn-outline-danger btn-sm mx-1" data-bs-toggle="modal" data-bs-target={`#modal-delete-${animal_id}`}>Cancella</button>
                                        )
                                    }
                                })()
                            }
                        </div>
                    </form>
                </div>
                
                {
                    (() => {
                        if (!this.props.onCreate) {
                            // Modale conferma cancellazione
                            return (
                                <div className="modal fade" id={`modal-delete-${animal_id}`} tabindex="-1" aria-labelledby={`modal-delete-${animal_id}-title`} aria-hidden="true">
                                    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                                        <div class="modal-content">
                                            <div class="modal-header">
                                                <p class="modal-title fs-5" id={`modal-delete-${animal_id}-title`}>Conferma rimozione</p>
                                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Annulla"></button>
                                            </div>
                                            <div class="modal-body">
                                                Confermi di rimuovere {this.state.animal.name} dai tuoi animali?
                                            </div>
                                            <div class="modal-footer">
                                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
                                                <button type="button" class="btn btn-danger" data-bs-dismiss="modal" onClick={() => this.handleDelete()}>Conferma</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                    })()
                }
            </>);
        }
        else if (this.state.mode === "read") {
            return (<>
                <div className="border rounded px-3 py-4 w-100">
                    <div style={{ borderRadius: "50%", height: "6rem", width: "6rem", padding: 0, margin: "auto", overflow: "hidden" }}>
                        <img src={this.state.profile_src} alt="" className="w-100 h-100" />
                    </div>

                    <div className="mt-2 text-center">
                        <p className="fw-semibold fs-5">{this.state.animal.name}</p>
                        <p className="fs-6">{this.state.animal.species}</p>
                    </div>

                    <div className="mt-2 d-flex justify-content-center">
                        <button className="btn btn-outline-secondary" 
                                onClick={() => this.setState({ mode: "write" }, () => this.input.name.current.value(this.state.animal.name))}>Modifica</button>
                    </div>
                </div>
            </>);
        }
    }

    async handleForm() {
        const animal_data = {
            name: this.input.name.current.value(),
            species: this.input.species.current.value,
            image_path: await FileAPI.uploadRaw(this.input.profile.current.files)
        }

        let new_animal = null;

        try {
            if (this.state.animal) { // Animale già esistente (da aggiornare)
                new_animal = await AnimalAPI.updateAnimalById(this.state.animal.id, animal_data);
                this.props.onUpdate(new_animal);
            }
            else { // Animale da creare
                new_animal = await AnimalAPI.createAnimalForUser(await getUsername(), animal_data);
                this.props.onCreate(new_animal);
            }
        }
        catch (err) {
        }
        
        // this.setState({ animal: new_animal, mode: "view" });
    }

    async handleDelete() {
        try {
            await AnimalAPI.deleteAnimalById(this.state.animal.id);
            this.props.onDelete(this.state.animal);
        }
        catch (err) {

        }
    }

    handleProfilePreview(e) {
        const [file] = e.target.files;

        if (file) {
            this.setState({ profile_src: URL.createObjectURL(file) });
        }
    }
}

export default AnimalCard;