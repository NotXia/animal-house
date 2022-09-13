import * as WorkingTimeHandler from "./view/working_time.js";
import * as PermissionsHandler from "./view/permissions.js";
import * as ServicesHandler from "./view/services.js";
import * as Mode from "./mode.js";
import {Error} from "../../import/Error.js";
import * as Form from "./form.js";
import * as OperatorAPI from "./operatorAPI.js";
import { Navbar } from "/admin/import/Navbar.js";
import { Loading } from "/admin/import/Loading.js";

let NavbarHandler;
let LoadingHandler;

let operator_cache = {};

$(document).ready(async function() {
    // Caricamento delle componenti esterne
    NavbarHandler = new Navbar("navbar-placeholder");
    LoadingHandler = new Loading("loading-container");
    await LoadingHandler.render();

    await LoadingHandler.wrap(async function() {
        await NavbarHandler.render();
        Mode.start();
        
        // Inizializza gli elementi mancanti del form
        try {
            const [permissions, services] = await Promise.all([
                api_request({ type: "GET", url: `/users/permissions/` }),
                api_request({ type: "GET", url: `/services/` })
            ]);
    
            PermissionsHandler.createPermissionsCheckbox(permissions);
            ServicesHandler.createServicesCheckbox(services);
            WorkingTimeHandler.createWorkingTimeForm();
        }
        catch (err) {
            Mode.error("Non è stato possibile caricare la pagina");
        }
    
        $("#operator-form").validate({
            rules: {
                username: { required: true },
                password: {
                    required: { depends: (_) => (Mode.current == Mode.CREATE) },
                    securePassword: true
                },
                email: { required: true, email: true },
                name: { required: true },
                surname: { required: true },
                gender: { required: true },
                phone: { required: true, phoneNumber: true },
                role: { required: true },
            },
            errorPlacement: function(error, element) {
                Error.showError(element.attr("name"), error);
            },
            submitHandler: async function(form, event) {
                event.preventDefault();
    
                await LoadingHandler.wrap(async function() {
                    try {
                        let operator_data = await Form.getOperatorData();
                        let res_operator;
        
                        switch (Mode.current) {
                            case Mode.MODIFY:
                                res_operator = await OperatorAPI.update(operator_cache.username, operator_data);
        
                                // Aggiornamento della navbar se si aggiorna sé stessi
                                if (operator_cache.username === await getUsername()) { await NavbarHandler.render(); }
                                break;
        
                            case Mode.CREATE:
                                res_operator = await OperatorAPI.create(operator_data);
                                break;
                        }
        
                        operator_cache = res_operator;
                        Form.loadOperatorData(res_operator);
                        Mode.view();
                    }
                    catch (err) {
                        switch (err.status) {
                            case 400: Error.showErrors(err.responseJSON); break;
                            default: Mode.error(err.responseJSON.message); break;
                        }
                    }
                });
            }
        });
    
        /* Ricerca di un operatore */
        $("#search_user_form").submit(async function(e) {
            e.preventDefault();
            $("#operator-form").show(); 
            const to_search_username = this.username.value;
            
            await LoadingHandler.wrap(async function() {
                try {
                    const operator_data = await OperatorAPI.search(to_search_username);
                    operator_cache = operator_data;
                    
                    Form.loadOperatorData(operator_data);
                    Mode.view();
                }
                catch (err) {
                    console.log(err);
                    Mode.error(err.responseJSON ? err.responseJSON.message : "Utente inesistente");
                }
            });
        });
    
        /* Anteprima immagine di profilo caricata */
        $("#data-picture").on("change", function (e) { 
            let reader = new FileReader();
            reader.onload = function (e) { $("#profile-picture").attr('src', e.target.result); }
            reader.readAsDataURL(this.files[0]);
        });
    
        /* Passaggio alla modalità creazione di un operatore */
        $("#start_create-btn").on("click", function (e) {
            Form.resetForm();
            Mode.creation();
        });
    
        /* Passaggio alla modalità modifica di un operatore */
        $("#modify-btn").on("click", function (e) {
            Mode.modify();
        });
    
        /* Annulla le modifiche */
        $("#revert-btn").on("click", function (e) {
            Form.loadOperatorData(operator_cache);
            Mode.view();
        });
    
        /* Cancellazione di un operatore */
        $("#delete-btn").on("click", async function (e) {
            await LoadingHandler.wrap(async function() {
                try {
                    await OperatorAPI.remove(operator_cache.username);
                } catch (err) {
                    Mode.error(err.responseJSON.message);
                }
                
                Form.resetForm();
                Mode.start();
            });
        });
    });
});