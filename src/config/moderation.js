// moderation.js
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export const moderateContent = async (content) => {
  try {
    const response = await openai.moderations.create({
      model: 'omni-moderation-2024-09-26',
      input: content,
    });
    return response.data;
  } catch (error) {
    console.error("Error moderating content:", error);
    throw error;
  }
};