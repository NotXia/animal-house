import { api_request } from "../auth.js";
import $ from "jquery";
import { DOMAIN } from "../const";

const ItemAPI = {
    getByBarcode: async function (barcode) {
        return await api_request({
            method: "GET",
            url: `${DOMAIN}/shop/items/barcode/${encodeURIComponent(barcode)}`,
        });
    }
}

export default ItemAPI;