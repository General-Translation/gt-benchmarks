import { writeFile } from 'fs';
import embed from '../models/embed';
import config from './config.json';
import passage from './data/passage.json'
import translations from './data/translations.json'
import { languages } from '../languages/languages';
import { getLanguageName } from 'generaltranslation'
import azureTranslate from '../azure_translate/azureTranslate';

function _constructPrompt(text, language) {
    return `Translate into ${getLanguageName(language)}:\n\n` + text;
}

function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function testTwoWayTranslation() {
    
    const text = passage.text;
    const embedding = passage.embedding;
    const model = config.model;

    // Ask model to translate to language
    const modelTranslations = {}
    languages.map(async language => {
        return // callGPT
    })

    // Azure translator back into English
    const azureTranslations = {}
    Object.keys(modelTranslations).map(async key => {
        azureTranslations[key] = await azureTranslate(modelTranslations[key], key, 'en');
    })

    // Embed azureTranslations 
    const embeddings = await embed(azureTranslations)

    // Cosine similarity with embedding
    const finalToLang = {};
    languages.map((language, index) => {
        finalToLang[language] = cosineSimilarity(embedding, embeddings[index])
    });
    
    // Write to file
    writeFile(`./two_way/data/${model}_to_lang.json`, JSON.stringify(finalToLang, null, 2), (err) => {
        if (err) {
            console.error(err);
        } else {
            console.log('Final results written!')
        }
    });

    // Ask model to translate to English
    const toEnglish = {}
    Object.keys(translations).map(async key => {
        toEnglish[key] = await '' // callGPT
    })

    // Embed 
    const toEnglishEmbeddings = await embed(toEnglish);

    // Get cosine similarity
    const finalToEnglish = {};
    languages.map((language, index) => {
        finalToEnglish[language] = cosineSimilarity(embedding, toEnglishEmbeddings[index])
    });

    // Write to file
    writeFile(`./two_way/data/${model}_to_en.json`, JSON.stringify(finalToEnglish , null, 2), (err) => {
        if (err) {
            console.error(err);
        } else {
            console.log('Final results written!')
        }
    });

}

testTwoWayTranslation();