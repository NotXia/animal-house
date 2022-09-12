export class FileUpload {
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