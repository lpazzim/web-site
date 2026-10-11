// Liveness check that reports whether the Notion settings are present,
// without revealing any part of their values.
export function GET(): Response {
  return Response.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: {
      hasNotionToken: Boolean(process.env.NOTION_API_TOKEN?.trim()),
      hasDatabaseId: Boolean(process.env.NOTION_DATABASE_ID?.trim()),
    },
  });
}
