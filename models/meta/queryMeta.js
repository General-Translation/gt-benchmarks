
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
            prompt_template: `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n${systemPrompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n{prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n`
        };
        
        const output = await replicate.run(`meta/${model}`, { input });
        const answer = output.join("");
        return answer;
    };

    return retryCall(queryFn, [content, systemPrompt, model], 3);
}