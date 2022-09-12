import {loader} from "./templates/loader.js";

export class Loading {
    constructor(container_id) {
        this.container_id = container_id;
        this.container = $(`#${container_id}`);
    }

    show() { this.container.show(); }
    hide() { this.container.hide(); }

    async render() {
        await loader(this.container, "/admin/import/templates/loading.html");
        this.hide();
    }

    async wrap(func) {
        this.show();
        await func();
        this.hide();
    }
}