import { api_request } from "../auth.js";
import { DOMAIN } from "../const";

const FileAPI = {
    async upload(files) {
        let uploaded_files = await api_request({
            method: "POST",
            url: `${DOMAIN}/files/images/`,
            data: files,
            cache: false, contentType: false, processData: false
        });
    
        return uploaded_files;
    },

    // Gestisce il caricamento di file non ancora convertiti in FormData
    async uploadRaw(files) {
        const upload_data = new FormData();
        for (let i=0; i<files.length; i++) { upload_data.append(`file${i}`, files[i]); }
        
        let uploaded_files = await api_request({
            method: "POST",
            url: `${DOMAIN}/files/images/`,
            data: upload_data,
            cache: false, contentType: false, processData: false
        });
    
        return uploaded_files;
    }
}

export default FileAPI;
