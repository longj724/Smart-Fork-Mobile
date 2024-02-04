import { publicProcedure, router } from './trpc';

export const appRouter = router({
  getTodos: publicProcedure.query(async () => {
    return { hello: 'world' };
  }),
});

export type AppRouter = typeof appRouter;
