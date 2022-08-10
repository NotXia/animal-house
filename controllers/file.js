require('dotenv').config();
const utils = require("../utilities");
const error = require("../error_handler");
const { nanoid } = require("nanoid");
const path = require("path");


/* Upload di immagini nella cartella temporanea */
async function uploadImages(req, res) {
    let files_name = []

    try {
        // Salvataggio dei file nel filesystem
        for (const [_, file] of Object.entries(req.files)) {
            const filename = `${nanoid(process.env.IMAGES_NAME_LENGTH)}${path.extname(file.name)}`;
            
            await file.mv(path.join(process.env.IMAGES_TMP_ABS_PATH, filename));
            files_name.push(filename);
        }
    }
    catch (err) {
        return error.response(err, res);
    }

    return res.status(utils.http.OK).json(files_name);
}


module.exports = {
    uploadImages: uploadImages
}
