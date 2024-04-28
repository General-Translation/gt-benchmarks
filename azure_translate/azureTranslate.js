import axios from "axios";
import dotenv from 'dotenv';
import { v4 } from "uuid";

dotenv.config({ path: '../.env'});

const azureKey = process.env.AZURE_TRANSLATOR_KEY;
const endpoint = "https://api.cognitive.microsofttranslator.com";
const location = "eastus"

// Takes in a text to translate, it's original language, and either a single
// language code string or an array of language code strings.
// Returns an array of translations in the order toLangs array languages.
export default async function azureTranslate(text, fromLang, toLangs) {
    let lang;
    if (Array.isArray(toLangs)) {
        lang = toLangs.join(',');
    } else {
        lang = toLangs;
    }
    try {
        const response = await axios({
            baseURL: endpoint,
            url: '/translate',
            method: 'post',
            headers: {
                'Ocp-Apim-Subscription-Key': azureKey,
                'Ocp-Apim-Subscription-Region': location,
                'Content-type': 'application/json',
                'X-ClientTraceId': v4().toString()
            },
            params: {
                'api-version': '3.0',
                'from': fromLang,
                'to': lang
            },
            data: [{
                'text': text
            }],
            responseType: 'json'
        });
        const translations = response.data[0].translations.map(item => item.text);
        return translations;
    } catch (error) {
        console.log(error);
        return '';
    }
}
