import { writeFile } from 'fs';
import embed from '../models/embed';
import config from './config.json';
import passage from './data/passage.json'
import { getLanguageName } from 'generaltranslation'

function _constructPrompt(text, language) {
    return `Translate into ${getLanguageName(language)}:\n\n` + text;
}

async function testTwoWayTranslation() {
    
    const text = passage.text;
    const embedding = passage.embedding;
    const model = config.model;

    // Ask model to translate

    // Azure translator back into English
    const azureTranslations = []

    // Embed azureTranslations 
    const embeddings = await embed(azureTranslations)

    // Cosine similarity with embedding
    const final = [];
    
    // Write to file
    writeFile(`./two_way/data/${model}.json`, JSON.stringify(final, null, 2), (err) => {
        if (err) {
            console.error(err);
        } else {
            console.log('Final results written!')
        }
    });
    
}

testTwoWayTranslation();