import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: "5mb" }));

  // API route for AI Search (Server-side Gemini proxy)
  app.post("/api/search", async (req, res) => {
    try {
      const { query, inventory } = req.body;
      if (!query || !inventory) {
        return res.status(400).json({ error: "Missing query or inventory" });
      }

      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      if (!apiKey || apiKey === "undefined") {
        return res.json({ fallback: true, matchingIds: [] });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
      const prompt = `
        You are an intelligent inventory search assistant. Your task is to find ONLY the items in an inventory list that match a user's natural language query.

        User Query: "${query}"

        Analyze the following inventory data provided as JSON:
        ${JSON.stringify(
          inventory.map((i: any) => ({
            id: i.id,
            name: i.name,
            description: i.description,
            brand: i.brand,
            model: i.model,
          })),
          null,
          2
        )}

        CRITICAL REQUIREMENT:
        - Return ONLY items that strictly match the specified category or item requested in the query.
        - For example, if the query is "Testers y Multímetros", return ONLY items that are testers or multimeters. Do NOT include cables, mice, or unrelated tools.
        - For "Cables HDMI", return ONLY HDMI cables.
        - For "Kits de destornilladores", return ONLY screwdriver kits.
        - Return a JSON array containing only the 'id' strings of the matching items. Format: ["id1", "id2"]. If none match, return [].
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
          },
        },
      });

      const textResponse = response.text ? response.text.trim() : "";
      const jsonMatch = textResponse.match(/\[.*\]/s);
      if (jsonMatch) {
        return res.json({ matchingIds: JSON.parse(jsonMatch[0]) });
      }
      return res.json({ matchingIds: JSON.parse(textResponse) });
    } catch (error: any) {
      console.warn("Server Gemini API call issue, signaling client local search fallback:", error?.message || error);
      return res.json({ fallback: true, matchingIds: [] });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
