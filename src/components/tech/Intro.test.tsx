import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getI18n } from "@/i18n";
import { Intro } from "./Intro";

function mockMotionPreference(reduce: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({ matches: reduce, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
  );
}

const renderIntro = () =>
  render(
    <I18nextProvider i18n={getI18n("en")}>
      <Intro />
    </I18nextProvider>,
  );

describe("Intro", () => {
  beforeEach(() => sessionStorage.clear());
  afterEach(() => vi.unstubAllGlobals());

  it("is not part of the server render", () => {
    mockMotionPreference(false);
    const html = renderToString(
      <I18nextProvider i18n={getI18n("en")}>
        <Intro />
      </I18nextProvider>,
    );
    expect(html).toBe("");
  });

  it("opens as a dialog and the skip button dismisses it for the session", async () => {
    mockMotionPreference(false);
    renderIntro();

    expect(screen.getByRole("dialog", { name: /initializing portfolio/i })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /skip/i }));
    expect(sessionStorage.getItem("intro-seen")).toBe("1");
  });

  it("closes with Escape", async () => {
    mockMotionPreference(false);
    renderIntro();

    await userEvent.keyboard("{Escape}");
    expect(sessionStorage.getItem("intro-seen")).toBe("1");
  });

  it("keeps keyboard focus on the skip button while open", async () => {
    mockMotionPreference(false);
    renderIntro();

    await userEvent.tab();
    expect(screen.getByRole("button", { name: /skip/i })).toHaveFocus();
  });

  it("does not play with reduced motion", () => {
    mockMotionPreference(true);
    renderIntro();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("does not replay once seen in this session", () => {
    mockMotionPreference(false);
    sessionStorage.setItem("intro-seen", "1");
    renderIntro();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
