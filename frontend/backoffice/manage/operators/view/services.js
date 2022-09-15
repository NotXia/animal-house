/**
 * Crea i checkbox per i servizi 
 */
export function createServicesCheckbox(services) {
    for (const service of services) {
        $("#services-fieldset").append(`
            <div class="form-check-inline">
                <input class="form-check-input" type="checkbox" id="data-services-${service.id}" name="services" value="${service.id}">
                <label for="data-services-${service.id}">${he.decode(service.name)}</label>
            </div>
        `);
    }           
}