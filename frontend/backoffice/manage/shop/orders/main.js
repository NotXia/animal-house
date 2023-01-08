import { Navbar } from "/admin/import/Navbar.js";
import { Loading } from "/admin/import/Loading.js";
import { api_request } from "/js/auth.js";
import * as OrderRow from "./view/orderRow.js"

let NavbarHandler, LoadingHandler;


$(document).ready(async function() {
    // Caricamento delle componenti esterne
    NavbarHandler = new Navbar("navbar-placeholder");
    LoadingHandler = new Loading("loading-container");
    await LoadingHandler.render();

    await LoadingHandler.wrap(async function() {
        await NavbarHandler.render();
        
        const orders = await getOrders();
        for (const order of orders) {
            await OrderRow.render(order, "#orders-container");
        }
    });
});

async function getOrders() {
    let orders = await api_request({
        type: "GET", url: `/shop/orders/`,
        data: {
            page_size: 100000,
            page_number: 0
        }
    });

    orders = orders.filter((order) => !["pending", "delivered", "cancelled"].includes(order.status));
    let users_isVip = {};
    
    for (const order of orders) {
        if (!(order.customer in users_isVip)) {
            const customer = await api_request({ type: "GET", url: `/users/profiles/${encodeURIComponent(order.customer)}` });

            users_isVip[order.customer] = moment(customer.vip_until).isSameOrAfter(moment());
        }
    }

    orders.sort((o1, o2) => {
        if (users_isVip[o1.customer] && !users_isVip[o2.customer]) {
            return -1;
        } else if (!users_isVip[o1.customer] && users_isVip[o2.customer]) {
            return 1;
        } else {
            return moment(o1.creationDate).diff(moment(o2.creationDate));
        }
    });

    return orders;
}