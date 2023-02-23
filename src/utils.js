export function formatDate(date) {
    if (date == null) {
        return "";
    }
    const d = date instanceof Date ? date : new Date(date);
    return d.toISOString().slice(0, 16).replace("T", " ").replaceAll("-", "/");
}
