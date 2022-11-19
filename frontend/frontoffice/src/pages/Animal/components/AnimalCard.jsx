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
                this.setState({ error_message: "Non è stato possibile caricare i dati" });
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
                    <p className="text-center text-danger fw-semibold">{this.state.error_message}</p>

                    <form onSubmit={(e) => { e.preventDefault(); this.handleForm(); }}>
                        <div className="position-relative" style={{ height: "6rem", width: "6rem", padding: 0, margin: "auto" }}>
                            {/* Immagine animale */}
                            { this.renderPicture() }

                            {/* Upload immagine */}
                            <div className="position-absolute bottom-0 end-0">
                                <button className="btn btn-link p-0" onClick={() => this.input.profile.current.click()} type="button">
                                    <span className="visually-hidden">{this.state.animal?.name ? `Carica immagine per ${this.state.animal.name}` : "Carica immagine per il tuo animale" }</span>
                                    <img src={`${process.env.REACT_APP_DOMAIN}/img/icons/camera.png`} alt="" style={{ height: "1.5rem", width: "1.5rem" }} />
                                </button>
                            </div>
                            <input ref={this.input.profile} className="visually-hidden" type="file" accept="image/*" onChange={(e) => this.handleProfilePreview(e)} 
                                   aria-label={this.state.animal?.name ? `Carica immagine per ${this.state.animal.name}` : "Carica immagine per il tuo animale" }  aria-hidden="true" />
                        </div>

                        {/* Input form */}
                        <div className="mt-2">
                            <TextInput ref={this.input.name} id={`_input-name-${animal_id}`} name={`name-${animal_id}`} type="text" label="Nome" validation={() => ""} required />

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
                                // Visualizzato solo in fase di modifica
                                !this.props.onCreate &&
                                (
                                    <div>
                                        <button type="button" className="btn btn-outline-secondary mx-1" onClick={() => this.handleUpdateAbort()} aria-label="Annulla modifiche">Annulla</button>
                                        <button type="button" className="btn btn-outline-danger mx-1" data-bs-toggle="modal" data-bs-target={`#modal-delete-${animal_id}`} aria-label="Rimuovi dai miei animali">Rimuovi</button>
                                    </div>
                                )
                            }
                            {
                                // Visualizzato solo in fase di creazione
                                this.props.onCreate &&
                                (
                                    <div>
                                        <button type="button" className="btn btn-outline-secondary mx-1" onClick={() => this.props.onCreateAbort()} aria-label="Annulla inserimento">Annulla</button>
                                    </div>
                                )
                            }
                        </div>
                    </form>
                </div>
                
                {
                    (() => {
                        if (!this.props.onCreate) {
                            // Modale conferma cancellazione
                            return (
                                <div className="modal fade" id={`modal-delete-${animal_id}`} tabIndex="-1" aria-labelledby={`modal-delete-${animal_id}-title`} aria-hidden="true">
                                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                                        <div className="modal-content">
                                            <div className="modal-header">
                                                <p className="modal-title fs-5" id={`modal-delete-${animal_id}-title`}>Conferma rimozione</p>
                                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Annulla"></button>
                                            </div>
                                            <div className="modal-body">
                                                Confermi di rimuovere {this.state.animal.name} dai tuoi animali?
                                            </div>
                                            <div className="modal-footer">
                                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
                                                <button type="button" className="btn btn-danger" data-bs-dismiss="modal" onClick={() => this.handleDelete()}>Conferma</button>
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
                    <p className="text-center text-danger fw-semibold">{this.state.error_message}</p>
                    
                    {/* Immagine di profilo */}
                    { this.renderPicture() }

                    {/* Dati animale */}
                    <div className="mt-2 text-center">
                        <p className="fw-semibold fs-5 mb-0 text-truncate"><span className="visually-hidden">Nome:</span> {this.state.animal.name}</p>
                        <div className="fs-6 d-flex align-items-center justify-content-center">
                            <span className="me-1">{this.renderSpeciesIcon(this.state.animal.species)}</span>
                            <span className="visually-hidden">Specie:</span>{this.state.animal.species}
                        </div>
                    </div>

                    {/* Bottoni */}
                    <div className="mt-2 d-flex justify-content-center">
                        <button className="btn btn-outline-secondary" 
                                onClick={() => this.setState({ mode: "write" }, () => this.input.name.current.value(this.state.animal.name))} aria-label={`Modifica ${this.state.animal.name}`}>Modifica</button>
                    </div>
                </div>
            </>);
        }
    }

    /* Gestisce creazione e modifica */
    async handleForm() {
        let new_animal = null;
        const animal_data = {
            name: this.input.name.current.value(),
            species: this.input.species.current.value,
            image_path: this.input.profile.current.files.length > 0 ? await FileAPI.uploadRaw(this.input.profile.current.files) : (this.state.animal?.image_path ?? "")
        }

        try {
            if (this.state.animal) { // Animale già esistente (aggiornamento)
                new_animal = await AnimalAPI.updateAnimalById(this.state.animal.id, animal_data);
                this.props.onUpdate(new_animal);

                this.setState({ animal: new_animal, mode: "read" });
            }
            else { // Animale da creare
                new_animal = await AnimalAPI.createAnimalForUser(await getUsername(), animal_data);
                this.props.onCreate(new_animal);
            }
        }
        catch (err) {
            this.setState({ error_message: "Non è stato possibile eseguire l'operazione" });
        }
    }

    /* Gestisce la cancellazione */
    async handleDelete() {
        try {
            await AnimalAPI.deleteAnimalById(this.state.animal.id);
            this.props.onDelete(this.state.animal);
        }
        catch (err) {
            this.setState({ error_message: "Non è stato possibile eseguire la cancellazione" });
        }
    }

    /* Gestisce l'anteprima dell'immagine profilo */
    handleProfilePreview(e) {
        const [file] = e.target.files;

        if (file) {
            this.setState({ profile_src: URL.createObjectURL(file) });
        }
    }

    /* Gestisce il rollback delle modifiche */
    handleUpdateAbort() {
        this.setState({ 
            profile_src: `${process.env.REACT_APP_DOMAIN}${this.props.animal.image_path ? this.props.animal.image_path : "/animals/images/default.png" }`,
            mode: "read"
        });
    }

    /* Restituisce l'icona di una specie */
    renderSpeciesIcon(species) {
        const species_data = this.state.species.find((s) => s.name === species);
        return species_data ? <img src={`data:image/*;base64,${species_data.logo}`} alt="" style={{height: "1.7rem"}} /> : "";
    }

    /* Restituisce l'immagine di profilo dell'animale */
    renderPicture() {
        return (
            <div className="d-flex justify-content-center align-items-center" 
                 style={{ borderRadius: "50%", height: "6rem", width: "6rem", padding: 0, margin: "auto", overflow: "hidden" }}>
                <img src={this.state.profile_src} alt="" style={{ maxHeight: "100%", maxWidth: "100%" }} />
            </div>
        );
    }
}

export default AnimalCard;