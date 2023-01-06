import { Navbar } from "/admin/import/Navbar.js";
import { Loading } from "/admin/import/Loading.js";
import { Error } from "/admin/import/Error.js";
import { api_request } from "/js/auth.js";
import * as Form from "./form.js";
import * as Mode from "./mode.js";
import * as TopicRow from "./view/topicRow.js"

let NavbarHandler;
let LoadingHandler;

let topic_cache;

$(async function () {
    // Caricamento delle componenti esterne
    NavbarHandler = new Navbar("navbar-placeholder");
    LoadingHandler = new Loading("loading-container");
    await LoadingHandler.render();

    await LoadingHandler.wrap(async function () {
        await NavbarHandler.render();

        $("#form-topic").validate({
            rules: {
                name: { required: true }
            },
            errorPlacement: function (error, element) {
                Error.showError(element.attr("name"), error);
            },
            submitHandler: async function (_, event) {
                event.preventDefault();

                await LoadingHandler.wrap(async function () {
                    try {
                        let topic_data = await Form.getTopicData();

                        switch (Mode.current) {
                            case Mode.CREATE:
                                await api_request({
                                    type: "POST", url: `/blog/topics/`,
                                    data: topic_data
                                });
                                break;

                            case Mode.MODIFY:
                                let toUpdateTopic = $("#data-old_name").val();
                                await api_request({
                                    type: "PUT", url: `/blog/topics/${encodeURIComponent(toUpdateTopic)}`,
                                    data: topic_data
                                })
                        }

                        $("#modal-create-topic").modal("hide");
                        await showTopic();
                    } catch (err) {
                        switch (err.status) {
                            case 400: Error.showErrors(err.responseJSON); break;
                            case 409: Error.showError(err.responseJSON.field, err.responseJSON.message); break;
                            default: Mode.error(err.responseJSON ? err.responseJSON.message : "Si è verificato un errore"); break;
                        }
                    }
                })
            }
        });

        /* Inizio creazione topic */
        $("#btn-start_create").on("click", function () {
            Mode.create();
        });

        /* Pulizia modal alla chiusura */
        $("#modal-create-topic").on("hidden.bs.modal", function (e) {
            Error.clearErrors();
            Form.reset();
        })

        /* Anteprima icona durante upload */
        $("#data-logo").on("change", function (e) {
            Error.clearError("logo");
            $("#logo-preview").hide();
            
            // Controllo dimensione
            if (this.files[0].size > 50*1024) { // KB
                Error.showError("logo", "Immagine troppo grande");
                $("#data-logo").val("");
                return;
            }

            let reader = new FileReader();
            reader.onload = function (e) {
                $("#logo-preview").show();
                $("#logo-preview").attr("src", e.target.result);
            }
            if (this.files[0]) { reader.readAsDataURL(this.files[0]); }
            else { $("#logo-preview").hide(); }
        });

        /* Ricerca di topic */
        let search_delay;
        $("#search-topic").on("input", function () {
            clearTimeout(search_delay); // Annulla il timer precedente

            search_delay = setTimeout(async function () {
                filterTopic($("#search-topic").val());
            }, 100);
        });

        /* Cancellazione topic */
        $("#form-topic-delete").on("submit", async function (event) {
            event.preventDefault();
            await LoadingHandler.wrap(async function () {
                try {
                    let toDeleteTopic = $("#data-delete-name").val();

                    await api_request({
                        type: "DELETE", url: `/blog/topics/${encodeURIComponent(toDeleteTopic)}`
                    });

                    await showTopic();
                } catch (err) {
                    switch (err.status) {
                        case 400: Error.showErrors(err.responseJSON); break;
                        default: Mode.error(err.responseJSON ? err.responseJSON.message : "Si è verificato un errore"); break;
                    }
                }
            });
        });

        await showTopic();
    });
});

/* Caricamento dei topic */
async function showTopic() {
    topic_cache = await fetchTopic();
    displayTopic(topic_cache);
}

/* Estrae tutti i topic */
async function fetchTopic() {
    try {
        let topic = await api_request({
            type: "GET", url: `/blog/topics/`
        })

        // Ordinamento alfabetico
        topic.sort((t1, t2) => t1.name.toLowerCase().localeCompare(t2.name.toLowerCase()));

        return topic;
    } catch (err) {
        Mode.error(err.responseJSON.message ? err.responseJSON.message : "Si è verificato un errore");
    }
}

/* Filtra i topic visibili per nome */
function filterTopic(query) {
    if (!query) {
        displayTopic(topic_cache);
    } else {
        const topic = topic_cache.filter((topic) => topic.name.toLowerCase().includes(query.toLowerCase()));
        displayTopic(topic);
    }
}

/**
 * Mostra a schermo dei dati topic
 * @param topicList     Topic da visualizzare
 */
function displayTopic(topicList) {
    $("#topic-container").html("");
    let index = 0;

    for (const topic of topicList) {
        $("#topic-container").append(TopicRow.render(topic, index));

        $(`#modify-btn-${index}`).on("click", function () {
            Mode.modify();

            $("#data-name").val(topic.name);
            $("#data-old_name").val(topic.name);
            if (topic.icon) {
                $("#logo-preview").show();
                $("#logo-preview").attr("src", `data:image/*;base64,${topic.icon}`);
            }
        });

        $(`#delete-btn-${index}`).on("click", function() {
            $("#data-delete-name").val(topic.name);
            $("#delete-topic-name").text(topic.name);
        });

        index++;
    }
}