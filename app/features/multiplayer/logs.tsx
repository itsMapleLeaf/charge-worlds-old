import { autoUpdate, offset, useFloating } from "@floating-ui/react-dom"
import type { SupabaseClient } from "@supabase/supabase-js"
import { useEffect, useState } from "react"
import { List } from "react-feather"
import { z } from "zod"
import { useLocalStorage } from "~/helpers/use-local-storage"
import type { SupabaseSchema } from "~/supabase.server"
import { Button } from "~/ui/button"
import { blackCircleIconButtonClass } from "~/ui/styles"
import type { DatabaseDiceLog } from "../dice/dice-data"
import { DiceLogEntry } from "../dice/dice-log-entry"

export function LogsButton({
  supabaseClient,
  initialLogs,
}: {
  supabaseClient: SupabaseClient<SupabaseSchema>
  initialLogs: DatabaseDiceLog[]
}) {
  const [logs, setLogs] = useState(initialLogs)

  useEffect(() => {
    const sub = supabaseClient
      .channel("public:dice-logs")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "dice-logs",
        },
        (payload: { new: DatabaseDiceLog }) => {
          setLogs((logs) => [...logs, payload.new])
        },
      )
      .subscribe()

    return () => {
      void sub.unsubscribe()
    }
  }, [supabaseClient])

  const [visible, setVisible] = useLocalStorage({
    key: "multiplayer-logs-visible",
    fallback: false,
    schema: z.boolean(),
  })

  const floating = useFloating({
    placement: "top-end",
    strategy: "fixed", // fixed positioning causes less shifting while scrolling
    middleware: [
      offset(8),
      // size({
      //   padding: 16,
      //   apply: ({ elements, availableWidth, availableHeight }) => {
      //     elements.floating.style.width = `${availableWidth}px`
      //     elements.floating.style.height = `${availableHeight}px`
      //   },
      // }),
    ],
    whileElementsMounted: autoUpdate,
  })

  return (
    <div>
      <Button
        type="button"
        title="View logs"
        onClick={() => setVisible(!visible)}
        ref={floating.reference}
        className={blackCircleIconButtonClass}
      >
        <List />
      </Button>
      <ul
        ref={floating.floating}
        className="flex flex-col items-end gap-2"
        style={{
          position: floating.strategy,
          left: floating.x ?? 0,
          top: floating.y ?? 0,
        }}
      >
        {logs.map((log) => (
          <li key={log.id}>
            <DiceLogEntry log={log} />
          </li>
        ))}
      </ul>
    </div>
  )
}
