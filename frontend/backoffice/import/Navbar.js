import {loader} from "./templates/loader.js";

export class Navbar {
    constructor(container_id) {
        this.container_id = container_id;
        this.container = $(`#${container_id}`);
    }

    async render() {
        await loader(this.container, "/admin/import/templates/navbar.html");
    }
}