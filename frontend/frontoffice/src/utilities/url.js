export function updateURLQuery(key, value) {
    const updated_url = new URL(window.location.href);
    updated_url.searchParams.set(key, value);

    window.history.replaceState("", "", updated_url);
}

export function removeQueryFromURL(key) {
    let url = new URL(window.location.href);
    url.searchParams.delete(key);

    window.history.replaceState("", "", url);
}