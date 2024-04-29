import delay from "../misc/delay.js";

export default async function retryCall(fn, args, maxAttempts = 3) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn(...args);
        } catch (error) {
            console.log(`Attempt ${attempt} failed: ${error}`);
            if (attempt === maxAttempts) {
                console.error('All retry attempts failed.');
                return '';
            }
        }
        await delay(1000);
    }
}
