import $ from "jquery";
import { DOMAIN } from "../const";

const UserAPI = {
    getProfile: async function (username) {
        return await $.ajax({ 
            method: "GET", 
            url: `${DOMAIN}/users/profiles/${encodeURIComponent(username)}`   
        });
    },
}

export default UserAPI;