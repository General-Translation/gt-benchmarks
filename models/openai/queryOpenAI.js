import dotenv from 'dotenv';
import OpenAI from "openai";
import retryCall from '../retryCall.js';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.OPENAI_ORGANIZATION
});

export default async function queryOpenAI(messages, model, {jsonMode = false}) {
    const queryFn = async (messages, model, jsonMode) => {
        let completion;
        if (jsonMode) {
            completion = await openai.chat.completions.create({
                messages: messages,
                model: "gpt-3.5-turbo-0125", // Consider making the model name a parameter if needed
                response_format: { type: "json_object" },
                temperature: 0
            });
            return JSON.parse(completion.choices[0].message.content);
        } else {
            completion = await openai.chat.completions.create({
                messages: messages,
                model: model,
                temperature: 0
            });
            return completion.choices[0].message.content;
        }
    };
    return retryCall(queryFn, [messages, model, jsonMode], 3);
}
