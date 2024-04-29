import dotenv from 'dotenv';
import OpenAI from "openai";

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.OPENAI_ORGANIZATION
});

export default async function queryOpenAI(messages, model) {
    const completion = await openai.chat.completions.create({
        messages: messages,
        model: model,
    });

    return completion.choices[0].message.content;
}
