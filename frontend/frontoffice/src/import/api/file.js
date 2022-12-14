import { api_request } from "../auth.js";

const FileAPI = {
    upload: async function (files) {
        let uploaded_files = await api_request({
            method: "POST",
            url: `${process.env.REACT_APP_DOMAIN}/files/images/`,
            data: files,
            cache: false, contentType: false, processData: false
        });

        return uploaded_files;
    }
}

export default FileAPI;