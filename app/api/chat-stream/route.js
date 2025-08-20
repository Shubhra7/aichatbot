export async function POST(request) {
  try {
    const { message } = await request.json();

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b:free",
        messages: [{ role: "user", content: message }],
        stream: true,
      }),
    });

    // Reader + encoder/decoder
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    let buffer = ""; // store partial JSON lines

    const readable = new ReadableStream({
      async start(controller) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop(); // keep incomplete line for next chunk

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim(); // remove "data: "
              if (!data || data === "[DONE]") continue;

              try {
                const json = JSON.parse(data); // safe now ✅
                const content = json.choices?.[0]?.delta?.content || "";
                if (content) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
                  );
                }
              } catch (err) {
                console.error("Stream JSON parse error:", err, "line:", line);
              }
            }
          }
        }

        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in /api/chat-stream:", error);

    return Response.json(
      { error: "Failed to process request: " + error.message },
      { status: 500 }
    );
  }
}
