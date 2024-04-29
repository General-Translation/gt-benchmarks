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

async function processCSV(filePath, csvWriter) {
    let questions = [];
    let correctCount = 0;
    const batchSize = 10;
    const delayTime = 1000;

    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                questions.push(row);
            })
            .on('end', async () => {
                try {
                    for (let i = 0; i < questions.length; i += batchSize) {
                        const batch = questions.slice(i, i + batchSize);
                        await Promise.all(batch.map(async (row) => {
                            const question = `${row.Question}\nA.${row.A}\nB.${row.B}\nC.${row.C}\nD.${row.D}`;
                            const correctAnswer = standardizeText(`${row.Answer}`);
                            const answer = await askQuestion(question);
                            const validation = await validate(question, correctAnswer, answer);
                            if (validation.correct) {
                                correctCount++;
                            }

                            // Write each question's result to the language-specific CSV file
                            await csvWriter.writeRecords([{
                                question: question,
                                correctAnswer: correctAnswer,
                                givenAnswer: answer,
                                correct: validation.correct
                            }]);
                        }));

                        if (i + batchSize < questions.length) {
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
    const modelDirectoryPath = `${resultsDirectoryPath}/models/${model}`;
    
    try {
        await fsPromises.mkdir(resultsDirectoryPath, { recursive: true });
        await fsPromises.mkdir(modelDirectoryPath, { recursive: true });
    } catch (err) {
        console.error('Error creating directories:', err);
        return;
    }

    const globalCsvWriter = createObjectCsvWriter({
        path: `${resultsDirectoryPath}/${model}-results.csv`,
        header: [
            {id: 'fileName', title: 'FileName'},
            {id: 'score', title: 'Score'}
        ]
    });

    const results = [];
    try {
        const files = await fsPromises.readdir(directoryPath);
        for (const file of files.filter(file => path.extname(file).toLowerCase() === '.csv')) {
            const languageCode = file.match(/questions_(.+)\.csv/)[1];
            if (!languageCode) continue;

            const languageDirectoryPath = `${modelDirectoryPath}/${languageCode}`;
            await fsPromises.mkdir(languageDirectoryPath, { recursive: true });

            const languageCsvWriter = createObjectCsvWriter({
                path: `${languageDirectoryPath}/${model}-responses.csv`,
                header: [
                    {id: 'question', title: 'Question'},
                    {id: 'correctAnswer', title: 'CorrectAnswer'},
                    {id: 'givenAnswer', title: 'GivenAnswer'},
                    {id: 'correct', title: 'Correct'}
                ]
            });

            const filePath = path.join(directoryPath, file);
            console.log(`Processing ${file}...`);
            const score = await processCSV(filePath, languageCsvWriter);
            results.push({
                fileName: file,
                score: score
            });
        }

        await globalCsvWriter.writeRecords(results); // Write overall results
        console.log(`Results have been written to ${model}-results.csv`);
    } catch (err) {
        console.error('Error processing files:', err);
    }
}

testModel()