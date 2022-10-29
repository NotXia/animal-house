import { api_request } from "../auth.js";
import $ from "jquery";

const BlogAPI = {
    getTopics: async function () {
        return await $.ajax({ 
            method: "GET", 
            url: `${process.env.REACT_APP_DOMAIN}/blog/topics/` 
        });
    },
    getTopic: async function (topic_name) {
        const topics = await $.ajax({ 
            method: "GET", 
            url: `${process.env.REACT_APP_DOMAIN}/blog/topics/` 
        });

        return topics.find((topic) => topic.name === topic_name);
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

    getCommentNumberOf: async function (post_id) {
        let comments;
        let comments_count = 0;
        let page_number = 0;

        do {
            comments = await $.ajax({
                method: "GET",
                url: `${process.env.REACT_APP_DOMAIN}/blog/posts/${encodeURIComponent(post_id)}/comments/`,
                data: {
                    page_number: page_number,
                    page_size: 1000000
                }
            });

            comments_count += comments.length;
            page_number++;
        }
        while (comments.length > 0);

        return comments_count;
    },
}

export default BlogAPI;