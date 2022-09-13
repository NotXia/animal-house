/**
 * Gestore della schermata di caricamento
 */

import {loader} from "./templates/loader.js";

export class Loading {
    constructor(container_id) {
        this.container_id = container_id;
        this.container = $(`#${container_id}`);
    }
    
    /**
     * Carica lo spinner nel suo container
     */
    async render() {
        await loader(this.container, "/admin/import/templates/loading.html");
        this.hide();
    }

    /**
     * Mostra la schermata di caricamento
     */
    show() { 
        this.container.show(); 
    }

    /**
     * Nasconde la schermata di caricamento
     */
    hide() { 
        this.container.hide(); 
    }


    /**
     * Esegue una funzione mostrando il caricamento durante la sua esecuzione
     * @param {*} func   Funzione da eseguire
     */
    async wrap(func) {
        this.show();

        try {
            await func();
        }
        catch (err) {
            this.hide();
            throw err;
        }

        this.hide();
    }
}