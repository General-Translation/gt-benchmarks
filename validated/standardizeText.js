export default function standardizeText(text) {
    text = text.toLowerCase();
    text = text.replace(/’/g, "'");
    text = text.replace(/“/g, '"').replace(/”/g, '"');
    return text;
}