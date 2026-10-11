// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../../api/_lib/notion", () => ({
  listPosts: vi.fn().mockResolvedValue([{ slug: "real-post" }]),
  getPostBySlug: vi.fn().mockResolvedValue({ post: { slug: "real-post" }, blocks: [] }),
}));

import { getPostForBuild, listPostsForBuild } from "./notion.server";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("build-time posts without Notion credentials", () => {
  it("pre-renders the sample post so the post route always has a page", async () => {
    vi.stubEnv("NOTION_API_TOKEN", "");
    vi.stubEnv("NOTION_DATABASE_ID", "");
    vi.spyOn(console, "warn").mockImplementation(() => {});

    const posts = await listPostsForBuild();
    expect(posts.map((post) => post.slug)).toEqual(["sample-post"]);
    expect((await getPostForBuild("sample-post"))?.post.slug).toBe("sample-post");
    expect(await getPostForBuild("real-post")).toBeNull();
  });

  it("uses Notion when credentials are present", async () => {
    vi.stubEnv("NOTION_API_TOKEN", "token");
    vi.stubEnv("NOTION_DATABASE_ID", "database");

    expect((await listPostsForBuild()).map((post) => post.slug)).toEqual(["real-post"]);
    expect((await getPostForBuild("real-post"))?.post.slug).toBe("real-post");
  });
});
