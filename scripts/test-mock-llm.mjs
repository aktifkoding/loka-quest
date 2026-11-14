/**
 * Mock server OpenAI-compatible untuk menguji jalur kustom API model
 * (AI_API_KEY / AI_BASE_URL / AI_MODEL) lewat HTTP end-to-end.
 * Jalankan: node scripts/test-mock-llm.mjs   (port 4311)
 * Mencatat header Authorization dan model yang diterima ke stdout.
 */
import http from "node:http";
import { appendFileSync } from "node:fs";

const LOG = "test-mock-llm.log";

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url?.endsWith("/chat/completions")) {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      const auth = req.headers.authorization ?? "(none)";
      let model = "(invalid json)";
      try {
        model = JSON.parse(body).model ?? "(no model)";
      } catch {
        /* biarkan */
      }
      const line = `received auth=${auth} model=${model}`;
      console.log(line);
      appendFileSync(LOG, line + "\n");
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          choices: [
            { message: { role: "assistant", content: "MOCK-LLM-ANSWER [1]" } },
          ],
        })
      );
    });
    return;
  }
  res.statusCode = 404;
  res.end("{}");
});

server.listen(4311, () => console.log("mock llm listening on :4311"));
