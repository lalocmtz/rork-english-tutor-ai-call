import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import getApiKeyRoute from "./routes/openai/get-api-key/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  openai: createTRPCRouter({
    getApiKey: getApiKeyRoute,
  }),
});

export type AppRouter = typeof appRouter;
