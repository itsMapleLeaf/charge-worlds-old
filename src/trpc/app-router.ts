import { initTRPC } from "@trpc/server"

export const t = initTRPC.create()

export const appRouter = t.router({
  message: t.procedure.query(() => "sup"),
})
