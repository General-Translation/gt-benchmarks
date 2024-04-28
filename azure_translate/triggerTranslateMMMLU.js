import { languages } from "../languages/languages.js";
import translateQuestionsCSV from "./translateQuestionsCSV.js";

// Use slices of the languages array to avoid rate limits
translateQuestionsCSV('../mmlu/mmlu_questions.csv', '../mmlu/question_bank/questions', 'en', languages.slice(0,10));