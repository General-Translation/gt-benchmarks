import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';
import { promises as fsPromises } from 'fs';
import { createObjectCsvWriter } from 'csv-writer';
import { argv } from 'process';

import findProvider from '../models/findProvider.js';
import standardizeText from './standardizeText.js';
import validate from './validate.js';
import delay from '../misc/delay.js';

// Model queries
import queryAnthropic from '../models/anthropic/queryAnthropic.js';
import queryMeta from '../models/meta/queryMeta.js';
import queryOpenAI from '../models/openai/queryOpenAI.js';

// Fetch model name from command line
const model = argv[2];

async function askQuestion(question) {
    const provider = findProvider(model);
    let messages;
    let answer = '';
    // For Anthropic models
    if (provider == "anthropic") {
        messages = [
            {"role": "user", "content": `Answer only with the letter of the option corresponding to your answer.\n${question}`}
        ],
        answer = await queryAnthropic(messages, model);
    }
    // For Meta models
    else if (provider == "meta") {
        const systemPrompt = "You are a helpful assistant. Answer only with the letter corresponding to your answer."
        answer = await queryMeta(question, systemPrompt, model);
    }
    // For OpenAI models
    else if (provider == "openai") {
        messages = [
            {"role": "system", "content": "You are an intelligent AI designed to answer multiple choice questions. Answer only with the letter of the option corresponding to your answer."},
            {"role": "user", "content": question},
        ],
        answer = await queryOpenAI(messages, model, {jsonMode: false});
    }

    return standardizeText(answer);
}

async function processCSV(filePath) {
    let questions = [];
    let correctCount = 0;
    // How many questions are asked simultaneously
    const batchSize = 50;
    // Time between batch processing, in milliseconds
    const delayTime = 1000

    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                questions.push(row);
            })
            .on('end', async () => {
                try {
                    // Process each batch of questions
                    for (let i = 0; i < questions.length; i += batchSize) {
                        const batch = questions.slice(i, i + batchSize);
                        await Promise.all(batch.map(async (row) => {
                            const question = `${row.Question}\nA.${row.A}\nB.${row.B}\nC.${row.C}\nD.${row.D}`;
                            const correctAnswer = standardizeText(`${row['Correct Answer']}${row[row['Correct Answer']]}`);
                            const answer = await askQuestion(question);

                            // gpt-3.5-turbo-0125 validates if answer is correct
                            const validation = await validate(question, correctAnswer, answer);
                            if (validation.correct) {
                                correctCount++;
                            }
                        }));

                        if (i + batchSize < questions.length) {
                            console.log(`Processed ${i + batchSize} questions, pausing for a moment...`);
                            await delay(delayTime);
                        }
                    }

                    console.log(`Finished processing ${filePath}. Correct answers: ${correctCount}`);
                    resolve(correctCount / questions.length);
                } catch (error) {
                    console.error(`Error in processing ${filePath}:`, error);
                    reject(error);
                }
            })
            .on('error', (error) => {
                console.error(`Error reading ${filePath}:`, error);
                reject(error);
            });
    });
}

async function testModel() {
    console.log("Running for:", model);
    const directoryPath = './mmlu/question_bank';
    const resultsDirectoryPath = `./validated/results`;
    
    try {
        await fsPromises.mkdir(resultsDirectoryPath, { recursive: true });
    } catch (err) {
        console.error('Error creating results directory:', err);
        return;
    }

    const csvWriter = createObjectCsvWriter({
        path: `${resultsDirectoryPath}-results.csv`,
        header: [
            {id: 'fileName', title: 'FileName'},
            {id: 'score', title: 'Score'}
        ]
    });

    const results = [];
    try {
        const files = await fsPromises.readdir(directoryPath);
        for (const file of files.filter(file => path.extname(file).toLowerCase() === '.csv')) {
            const filePath = path.join(directoryPath, file);
            console.log(`Processing ${file}...`);
            const score = await processCSV(filePath);
            results.push({
                fileName: file,
                score: score
            });
        }

        await csvWriter.writeRecords(results);
        console.log(`Results have been written to ${model}-results.csv`);
    } catch (err) {
        console.error('Error processing files:', err);
    }
}

testModel()