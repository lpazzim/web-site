import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BlogPost } from "../shared/blog.js";
import { getPostBySlug, listPosts } from "./_lib/notion.js";
import { GET } from "./posts.js";

vi.mock("./_lib/notion.js", () => ({ listPosts: vi.fn(), getPostBySlug: vi.fn() }));

const post: BlogPost = { id: "1", title: "Hello", slug: "hello", description: "", date: "2026-01-01" };
const request = (query = "") => GET(new Request(`https://lpazzim.com/api/posts${query}`));

beforeEach(() => {
  vi.mocked(listPosts).mockReset();
  vi.mocked(getPostBySlug).mockReset();
});

describe("GET /api/posts", () => {
  it("lists posts with edge caching", async () => {
    vi.mocked(listPosts).mockResolvedValue([post]);
    const res = await request();
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toContain("s-maxage=300");
    expect(await res.json()).toEqual([post]);
    expect(listPosts).toHaveBeenCalledWith(100);
  });

  it("caps the limit at 100", async () => {
    vi.mocked(listPosts).mockResolvedValue([]);
    await request("?limit=500");
    expect(listPosts).toHaveBeenCalledWith(100);
  });

  it.each(["abc", "0", "-1", "1.5"])("rejects limit=%s", async (limit) => {
    const res = await request(`?limit=${limit}`);
    expect(res.status).toBe(400);
    expect(listPosts).not.toHaveBeenCalled();
  });

  it("returns a single post by slug", async () => {
    vi.mocked(getPostBySlug).mockResolvedValue({ post, blocks: [] });
    const res = await request("?slug=hello");
    expect(res.status).toBe(200);
    expect(getPostBySlug).toHaveBeenCalledWith("hello");
  });

  it("returns 404 for an unknown slug", async () => {
    vi.mocked(getPostBySlug).mockResolvedValue(null);
    const res = await request("?slug=missing");
    expect(res.status).toBe(404);
    expect(res.headers.get("Cache-Control")).toBeNull();
  });

  it.each(["../etc", "a b", ""])("rejects slug %j", async (slug) => {
    const res = await request(`?slug=${encodeURIComponent(slug)}`);
    expect(res.status).toBe(400);
    expect(getPostBySlug).not.toHaveBeenCalled();
  });

  it("hides internal errors from the response", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(listPosts).mockRejectedValue(new Error("token abc123 is invalid"));
    const res = await request();
    expect(res.status).toBe(500);
    expect(await res.text()).not.toContain("abc123");
  });
});
