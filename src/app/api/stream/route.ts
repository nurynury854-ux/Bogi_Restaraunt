import type { NextRequest } from "next/server";
import { eventBus, type BusEventType } from "@/lib/eventBus";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  let cleanup = () => {};

  const stream = new ReadableStream({
    start(controller) {
      const send = (type: BusEventType, data: unknown) => {
        try {
          controller.enqueue(
            encoder.encode(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`)
          );
        } catch {
          // controller already closed (client disconnected mid-write)
        }
      };

      const handler = (type: BusEventType, data: unknown) => send(type, data);
      eventBus.on("broadcast", handler);

      // keep intermediary proxies / browsers from timing out an idle connection
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          // ignore
        }
      }, 20000);

      cleanup = () => {
        eventBus.off("broadcast", handler);
        clearInterval(heartbeat);
      };

      request.signal.addEventListener("abort", () => {
        cleanup();
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
    },
    cancel() {
      cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
