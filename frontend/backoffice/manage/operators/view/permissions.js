/**
 * Crea i checkbox per i permessi 
 */
export function createPermissionsCheckbox(permissions) {
    for (const permission of permissions) {
        $("#permissions-fieldset").append(`
            <div class="form-check-inline">
                <input class="form-check-input" type="checkbox" id="data-permissions-${permission.name}" name="permissions" value="${permission.name}">
                <label for="data-permissions-${permission.name}">${he.decode(permission.name)}</label>
            </div>
        `);
    }
}