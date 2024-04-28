import fs from 'fs';
import csv from 'csv-parser';
import azureTranslate from './azureTranslate.js';
import { createObjectCsvWriter } from 'csv-writer';

async function retryTranslation(row, fromLang, toLangs, maxRetries = 3) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const requestPromises = Object.keys(row).filter(col => col !== 'Answer').map(col => 
                azureTranslate(row[col], fromLang, toLangs)
            );
            const translations = await Promise.all(requestPromises);

            return translations[0].map((_, index) => {
                let newRow = {};
                translations.forEach((colTranslations, colIndex) => {
                    const colName = Object.keys(row).filter(col => col !== 'Answer')[colIndex];
                    newRow[colName] = colTranslations[index];
                });
                return newRow;
            });
        } catch (error) {
            console.log(`Attempt ${attempt + 1} failed: ${error.message}`);
            if (attempt === maxRetries - 1) throw error;
        }
    }
    return Object.keys(row).filter(col => col !== 'Answer').map(col => ({ [col]: row[col] }));
}

export default async function translateQuestionsCSV(inputFile, outputFilePrefix, fromLang, toLangs) {
    const results = [];

    fs.createReadStream(inputFile)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            // Initialize a CSV writer for each language
            const csvWriters = toLangs.map(lang => ({
                lang: lang,
                writer: createObjectCsvWriter({
                    path: `${outputFilePrefix}_${lang}.csv`,
                    header: [
                        {id: 'Question', title: 'Question'},
                        {id: 'A', title: 'A'},
                        {id: 'B', title: 'B'},
                        {id: 'C', title: 'C'},
                        {id: 'D', title: 'D'},
                        {id: 'Answer', title: 'Answer'}
                    ]
                }),
                data: []
            }));

            // Translate each row for all languages
            for (let row of results) {
                const translations = await retryTranslation(row, fromLang, toLangs);
                translations.forEach((translatedRow, index) => {
                    let newRow = { Answer: row.Answer };
                    Object.keys(row).forEach(col => {
                        if (col !== 'Answer') {
                            newRow[col] = translatedRow[col];
                        }
                    });
                    csvWriters[index].data.push(newRow);
                });
            }

            // Write data to each CSV file
            for (let writer of csvWriters) {
                writer.writer.writeRecords(writer.data)
                    .then(() => console.log(`The CSV file for ${writer.lang} was written successfully`));
            }
        });
}
