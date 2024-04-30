import queryOpenAI from "../models/openai/queryOpenAI.js"

export default async function validate(question, correctAnswer, modelAnswer) {
    const validationPrompt = `I have the following multiple choice question:\n${question}\n\nCheck this answer and associate it to one of the answers in the question:\n${modelAnswer}.\n\nReturn a JSON formatted as {"answer": <selection>}, where selection is one of A, B, C, or D.`;
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
// const json = await validate("Which of these horror films spawned the most sequels?\nA.Scream\nB.Jawsn\nC.Halloween\nD.Friday the 13th", "d.friday the 13th", "d");
//
// { "correct": false }