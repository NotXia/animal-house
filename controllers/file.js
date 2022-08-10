require('dotenv').config();
const utils = require("../utilities");
const error = require("../error_handler");
const { nanoid } = require("nanoid");
const path = require("path");
const fs = require("fs");

/**
 * Calcola le immagini cambiate tra due versioni
 * @param old_images    Lista delle immagini nella versione vecchia
 * @param new_images    Lista delle immagini nella versiona aggiornata
 * @returns Oggetto con campi added (immagini nuove) e removed (immagini rimosse)
 */
function imagesDifference(old_images, new_images) {
    // Nota: si può vedere questa operazione come la differenza insiemistica
    const added_images = new_images.filter(x => !old_images.includes(x));   // Immagini che non erano presenti nella versione precedente
    const removed_images = old_images.filter(x => !new_images.includes(x)); // Immagini che nella versione aggiornata non sono più presenti

    return { added: added_images, removed: removed_images };
}

/**
 * Gestisce il "reclamo" delle immagini dalla cartella temporanea
 * @param images_name   Lista dei nomi delle immagini
 * @param dest_path     Percorso di destinazione in cui inserire le immagini
 */
async function claimImages(images_name, dest_path) {
    for (const image of images_name) {
        const tmp_path = path.join(process.env.IMAGES_TMP_ABS_PATH, image);
        const final_path = path.join(dest_path, image);

        // Verifica esistenza
        await fs.promises.access(tmp_path, fs.constants.F_OK).catch((err) => { throw error.generate.NOT_FOUND("Immagine non trovata") });

        // Spostamento
        await fs.promises.rename(tmp_path, final_path);
    }
}

/**
 * Gestisce la cancellazione di immagini
 * @param images_name   Lista dei nomi delle immagini
 * @param source_path   Percorso di provenienza delle immagini
 */
async function deleteImages(images_name, source_path) {
    for (const image of images_name) {
        await fs.promises.unlink(path.join(source_path, image));
    }
}


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
    uploadImages: uploadImages,
    utils: {
        diff: imagesDifference,
        claim: claimImages,
        delete: deleteImages
    }
}
