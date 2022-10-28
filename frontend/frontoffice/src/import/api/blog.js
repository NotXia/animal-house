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
    },

    getPosts: async function (page_size, page_number, authors=undefined, topic=undefined, oldest=undefined) {
        return await $.ajax({
            method: "GET",
            url: `${process.env.REACT_APP_DOMAIN}/blog/posts/`,
            data: {
                page_size: page_size,
                page_number: page_number,
                authors: authors,
                topic: topic,
                oldest: oldest
            }
        });
    },
}

export default BlogAPI;