import { api_request } from "../auth.js";
import $ from "jquery";

const BlogAPI = {
    getTopics: async function () {
        return await $.ajax({ 
            method: "GET", 
            url: `${process.env.REACT_APP_DOMAIN}/blog/topics/` 
        });
    },

    createPost: async function (post_data) {
        return await api_request({
            method: "POST",
            url: `${process.env.REACT_APP_DOMAIN}/blog/posts/`,
            data: post_data
        });
    }
}

export default BlogAPI;