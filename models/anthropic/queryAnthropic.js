import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';
import retryCall from '../retryCall.js';

dotenv.config();

const anthropic = new Anthropic({
    apiKey: process.envANTHROPIC_API_KEY, // This is the default and can be omitted
});

export default async function queryAnthropic(messages, model) {
    const fn = async (messages, model) => {
        const completion = await anthropic.messages.create({
            model: model,
            max_tokens: 1024,
            messages: messages,
            temperature: 0
        });
        return completion.content[0].text;
    };

    return retryCall(fn, [messages, model], 3);  // Retry up to 3 times
}
