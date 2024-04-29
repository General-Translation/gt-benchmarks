import { models } from "./models.js";

export default function findProvider(modelName) {
    for (let provider in models) {
        if (models[provider].includes(modelName)) {
            return provider;
        }
    }
    return "Model not found";
}
