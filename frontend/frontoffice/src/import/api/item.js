import { api_request } from "../auth.js";
import $ from "jquery";

const ItemAPI = {
    getByBarcode: async function (barcode) {
        return await api_request({
            method: "GET",
            url: `${process.env.REACT_APP_DOMAIN}/shop/items/barcode/${encodeURIComponent(barcode)}`,
        });
    }
}

export default ItemAPI;