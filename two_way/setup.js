import { writeFile } from 'fs';
import embed from '../models/embed.js';
import { languages } from '../languages/languages.js';
import azureTranslate from '../azure_translate/azureTranslate.js';

const setup = async () => {
    const passage = "Birds are a diverse and fascinating class of vertebrates, known for their ability to fly, a trait that has captivated human imagination for centuries. With over 10,000 species spread across the globe, birds can be found in virtually every habitat, from dense rainforests and vast deserts to urban areas. They range in size from the tiny bee hummingbird to the majestic ostrich and possess an array of adaptations such as beaks, feathers, and hollow bones, which aid in flight. Birds play critical roles in ecosystems as pollinators, predators, and seed dispersers, and they are also important indicators of environmental health. Their melodious songs and vibrant plumages make them central to many cultural symbols and traditions around the world."
    // Embed passage and save it as data/passage.json
    const embedding = {
        "text": passage,
        "embedding": await embed(passage)
    };
    writeFile('./two_way/data/passage.json', JSON.stringify(embedding, null, 2), (err) => {
        if (err) {
            console.error(err);
        } else {
            console.log('Embedded and written passage successfully!')
        }
    });
    // Translate passage into all languages and save it as data/translations.json
    let translations = {}
    for (const language of languages) {
        console.log(language)
        translations[language] = (await azureTranslate(passage, 'en', language))[0];
    }
    writeFile('./two_way/data/translations.json', JSON.stringify(translations, null, 2), (err) => {
        if (err) {
            console.error(err);
        } else {
            console.log('Created and written translations successfully!')
        }
    });
}

setup();