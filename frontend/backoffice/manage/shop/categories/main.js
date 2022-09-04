let categories_cache; 

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

                res_operator = await api_request({ 
                    type: "POST", url: `/shop/categories/`,
                    data: category_data
                });

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

    $("#modal-create-category").on("shown.bs.modal hidden.bs.modal", function (e) {
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

    // Caricamento delle categorie
    categories_cache = await fetchCategories();
    displayCategories(categories_cache);
});


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

    for (const category of categories) {
        let image = `<img src="data:image/*;base64,${category.icon}" alt="Icona per ${category.name}" class="category-icon" />`;
        if (!category.icon) { image = ""; }

        $("#category-container").append(`
            <tr>
                <td class="text-center align-middle"> ${image} </td>
                <td class="align-middle">${category.name}</td>
                <td class="text-center align-middle">
                    <button class="btn btn-outline-secondary text-truncate">Modifica</button>
                    <button class="btn btn-outline-danger text-truncate">Elimina</button>
                </td>
            </tr>
        `);
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