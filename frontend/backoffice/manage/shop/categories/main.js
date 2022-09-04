let categories_cache; 
let curr_mode;

$(document).ready(async function() {
    $("#form-category-insert").validate({
        rules: {
            name: { required: true }
        },
        errorPlacement: function(error, element) {
            showError(element.attr("name"), error);
        },
        submitHandler: async function(form, event) {
            event.preventDefault();
            showLoading();

            try {
                let category_data = await getFormCategoryData();

                switch (curr_mode) {
                    case "create":
                        await api_request({ 
                            type: "POST", url: `/shop/categories/`,
                            data: category_data
                        });
                        break;
                    case "modify":
                        await api_request({ 
                            type: "PUT", url: `/shop/categories/${$("#data-old_name").val()}`,
                            data: category_data
                        });
                        break;
                }

                $("#modal-create-category").modal("hide");
                categories_cache = await fetchCategories();
                displayCategories(categories_cache);
            }
            catch (err) {
                switch (err.status) {
                    case 400: showErrors(err.responseJSON); break;
                    case 409: showError(err.responseJSON.field, err.responseJSON.message); break;
                    default: error(err.responseJSON.message); break;
                }
            }

            hideLoading();
        }
    });

    $("#modal-create-category").on("hidden.bs.modal", function (e) {
        clearErrors();
        $("#icon-preview").hide();
        $("#form-category-insert").trigger("reset");
    });

    /* Anteprima icona */
    $("#data-icon").on("change", function (e) { 
        let reader = new FileReader();
        reader.onload = function (e) {
            $("#icon-preview").show();
            $("#icon-preview").attr("src", e.target.result);
        }
        if (this.files[0]) { reader.readAsDataURL(this.files[0]); }
        else { $("#icon-preview").hide(); }
    });
    
    /* Ricerca di categorie */
    let search_delay;
    $("#search-category").on("input", function () {
        clearTimeout(search_delay); // Annulla il timer precedente
        
        search_delay = setTimeout(async function() {
            const query = $("#search-category").val();

            if (query === "") {
                displayCategories(categories_cache)
            }
            else {
                const categories = categories_cache.filter((category) => category.name.toLowerCase().includes(query.toLowerCase()));
                displayCategories(categories);
            }
        }, 100);
    });

    $("#btn-start_create").on("click", function() {
        createMode();
    });

    // Caricamento delle categorie
    categories_cache = await fetchCategories();
    displayCategories(categories_cache);
});

function createMode() {
    curr_mode = "create";
    $("#modal-category-title").html("Crea categoria");
    $("#create-submit-container").show();
    $("#modify-submit-container").hide();
    $("#create-submit-btn").attr("type", "submit");
    $("#modify-submit-btn").attr("type", "button");
}

function modifyMode() {
    curr_mode = "modify";
    $("#modal-category-title").html("Modifica categoria");
    $("#modify-submit-container").show();
    $("#create-submit-container").hide();
    $("#modify-submit-btn").attr("type", "submit");
    $("#create-submit-btn").attr("type", "button");
}


async function getFormCategoryData() {
    return {
        name: $("#data-name").val(),
        icon: $("#data-icon").prop('files')[0] ? await base64($("#data-icon").prop('files')[0], header=false) : undefined
    }
}

async function fetchCategories() {
    try {
        let categories = await api_request({ 
            type: "GET", url: `/shop/categories/`
        });
        categories.sort((c1, c2) => (c1.name.toLowerCase() > c2.name.toLowerCase()) ? 1 : ((c2.name.toLowerCase() > c1.name.toLowerCase()) ? -1 : 0)); // Ordinamento alfabetico

        return categories;
    }
    catch (err) {
        error(err.responseJSON.message);
    }
}

function displayCategories(categories) {
    $("#category-container").html("");
    let index = 0;

    for (const category of categories) {
        let image = `<img src="data:image/*;base64,${category.icon}" alt="Icona per ${category.name}" class="category-icon" />`;
        if (!category.icon) { image = ""; }

        $("#category-container").append(`
            <tr>
                <td class="text-center align-middle"> ${image} </td>
                <td class="align-middle">${category.name}</td>
                <td class="text-center align-middle">
                    <button id="modify-btn-${index}" class="btn btn-outline-secondary text-truncate" data-bs-toggle="modal" data-bs-target="#modal-create-category" aria-label="Modifica dati della categoria ${category.name}">Modifica</button>
                    <button class="btn btn-outline-danger text-truncate">Elimina</button>
                </td>
            </tr>
        `);

        $(`#modify-btn-${index}`).on("click", function () {
            modifyMode();

            // Inserisce i dati della riga nel modal
            $("#data-name").val(category.name);
            $("#data-old_name").val(category.name);
            if (category.icon) { 
                $("#icon-preview").show();
                $("#icon-preview").attr("src", `data:image/*;base64,${category.icon}`);
            }
        });

        index++;
    }
}


function showError(field, message) {
    $(`#data-${field}-feedback`).html(message);
    $(`#data-${field}-feedback`).show();
}

function showErrors(errors) {
    clearErrors();
    for (const error of errors) {
        showError(error.field, error.message);
    }
}

function clearError(field) {
    $(`#data-${field}-feedback`).html("");
    $(`#data-${field}-feedback`).hide();
}

function clearErrors() {
    for (const error of $(`div[id*="-feedback"]`)) {
        $(error).html("");
        $(error).hide();
    }
}

function error(message) {
    $("#global-feedback").html(message);
}