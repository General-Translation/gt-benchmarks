
import dotenv from 'dotenv';
import Replicate from "replicate";
import retryCall from '../retryCall.js';

dotenv.config();

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

export default async function queryMeta(content, systemPrompt, model) {
    const queryFn = async (content, systemPrompt, model) => {
        const input = {
            prompt: content,
            temperature: 0.0,
            prompt_template: `system\n\n${systemPrompt}\nuser\n\n{prompt}\nassistant\n\n`
        };
        
        const output = await replicate.run(model, { input });
        const answer = output.join("");
        return answer;
    };

    return retryCall(queryFn, [content, systemPrompt, model], 3);
}