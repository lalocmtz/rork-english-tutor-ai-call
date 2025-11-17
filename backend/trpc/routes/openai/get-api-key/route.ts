import { publicProcedure } from "../../../create-context";

export const getApiKeyProcedure = publicProcedure.query(() => {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey.length === 0) {
    throw new Error("OpenAI API key is not configured in environment variables");
  }

  return {
    apiKey,
    length: apiKey.length,
  };
});

export default getApiKeyProcedure;
