import queryOpenAI from "../models/openai/queryOpenAI.js"

export default async function validate(question, correctAnswer, modelAnswer) {
    const validationPrompt = `I have the following multiple choice question:\n${question}\n\nThe correct answer is ${correctAnswer}.\n\nDoes this answer correspond to the correct answer:${modelAnswer}.\n\nIf so, select true. Else, select false. Return a JSON formatted as {"correct": <your selection>}`;
    const messages = [
        {
            role: "system",
            content: "You are a helpful assistant designed to output JSON.",
        },
        { 
            role: "user", 
            content: validationPrompt
        },
    ];
    const validation = await queryOpenAI(messages, "gpt-3.5-turbo-0125", {jsonMode: true} );
    return validation;
}

// Example usage:
// const json = await validate("Which of these horror films spawned the most sequels?\nA.Scream\nB.Jawsn\nC.Halloween\nD.Friday the 13th", "D", "A");
//
// { "correct": false }