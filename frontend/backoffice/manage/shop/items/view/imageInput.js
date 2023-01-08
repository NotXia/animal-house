import * as ProductTab from "./productTab.js";

export function reset() {
    $("#container-uploaded_images").html("");
}

/* Aggiunge una nuova riga tra le immagini del prodotto corrente */
let row_index = 0;
export function addRow(image_path, description="") {
    let index = row_index;
    row_index++;

    $("#container-uploaded_images").append(`
        <div id="container-image_row-${index}" class="row mt-4 mt-lg-2">
            <div class="col-12 col-lg-4" style="min-height: 10rem;">
                <div class="d-flex justify-content-center align-items-center">
                    <img style="max-height: 15rem; max-width: 100%;" src="${image_path}" alt="">
                </div>
            </div>
            <div class="col-12 col-lg-8">
                <div class="row h-100">
                    <div class="col-11">
                        <input id="input-product.image.${index}.path" name="product.image.path" type="hidden" value="${image_path}">
                        <textarea id="input-product.image.${index}.description" name="product.image.description" class="w-100 h-100" placeholder="Descrizione immagine">${description}</textarea>
                    </div>
                    <div class="col-1">
                        <div class="d-flex justify-content-center align-items-center h-100">
                            <button id="button-image_row-delete-${index}" class="btn-close" type="button" aria-label="Cancella immagine"></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `);

    $(`#button-image_row-delete-${index}`).on("click", function () {
        $(`#container-image_row-${index}`).remove();
        ProductTab.updateProductTabImage(); // Aggiorna l'anteprima del prodotto
    });
}

/* Restituisce i dati della prima immagine del prodotto corrente */
export function getFirstData() {
    if ($("[id*='container-image_row-']")[0]) {
        const first_container_id = $("[id*='container-image_row-']")[0].id;
    
        return {
            path: $(`#${first_container_id} img`).attr("src"),
            description: $(`#${first_container_id} textarea[name="product.image.description"]`).val()
        }
    }
    else {
        return { path: "/shop/images/default.png", description: "" }
    }
}

/* Restituisce i dati delle immagini del prodotto corrente */
export function getImagesData() {
    let data = [];

    $("[id*='container-image_row-']").each(function() {
        data.push({
            path: $(`#${this.id} input[name="product.image.path"]`).val(),
            description: $(`#${this.id} textarea[name="product.image.description"]`).val()
        })
    });

    return data;
}