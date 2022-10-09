export function updateURLQuery(key, value) {
    const updated_url = new URL(window.location.href);
    updated_url.searchParams.set(key, value);

    window.history.pushState("", "", updated_url);
}

export function removeQueryFromURL(key) {
    let url = new URL(window.location.href);
    console.log(url);
    url.searchParams.delete(key);

    window.history.pushState("", "", url);
}