import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  const token = process.env.NOTION_API_TOKEN?.trim().replace(/^["']|["']$/g, "");
  const dbId = process.env.NOTION_DATABASE_ID?.trim().replace(/^["']|["']$/g, "");

  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: {
      hasNotionToken: Boolean(token),
      tokenPrefix: token ? token.substring(0, 7) + "..." : null,
      hasDatabaseId: Boolean(dbId),
      databaseIdLength: dbId ? dbId.length : 0,
    },
  });
}
