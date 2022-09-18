import { api_request } from "/js/auth.js"

export class FileUpload {
    /**
     * Gestisce il caricamento di file sul server
     * @param {FormData} files  File da caricare
     * @returns Nome dei file caricati
     */
    static async upload(files) {
        let uploaded_files = await api_request({
            method: "POST",
            url: "/files/images/",
            data: files,
            cache: false, contentType: false, processData: false
        });

        return uploaded_files;
    }
}