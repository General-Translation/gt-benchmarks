import dotenv from 'dotenv';
import OpenAI from "openai";

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.OPENAI_ORGANIZATION
});

export default async function queryOpenAI(messages, model, {jsonMode = false}) {
    let completion;
    if (jsonMode) {
        completion = await openai.chat.completions.create({
            messages: messages,
            model: "gpt-3.5-turbo-0125",
            response_format: { type: "json_object" },
            temperature: 0
        });
        console.log(completion);
    }
    else {
        completion = await openai.chat.completions.create({
            messages: messages,
            model: model,
            temperature: 0
        });
    }
    console.log(completion.choices[0].message.content)
    return completion.choices[0].message.content;
}
