import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';

dotenv.config();

const anthropic = new Anthropic({
    apiKey: process.envANTHROPIC_API_KEY, // This is the default and can be omitted
});

export default async function queryAnthropic(messages, model) {
    const completion = await anthropic.messages.create({
        model: model,
        max_tokens: 1024,
        messages: messages,
        temperature: 0
    });
    const answer = completion.content[0].text
    return answer;
}