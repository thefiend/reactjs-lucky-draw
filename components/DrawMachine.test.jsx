import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import DrawMachine from "./DrawMachine";
import { decodeCertificate } from "../lib/certificate";
import { verifyDraw } from "../lib/draw";
import { listUrl } from "../lib/lists";
import { SITE_URL } from "../lib/site";

// A reveal holds the result back for seconds. Asking for reduced motion is the
// same code path a visitor with that setting takes, and it skips straight to the
// stub — so most tests here run that way and the reveals get their own block.
const setMotion = (reduced) => {
  window.matchMedia = (query) => ({
    matches: reduced && query.includes("prefers-reduced-motion"),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
};

const reduceMotion = () => setMotion(true);
const allowMotion = () => setMotion(false);

const type = async (user, names) => {
  await user.type(screen.getByLabelText("Your entries"), names.join("\n"));
};

const NAMES = ["Ada Lovelace", "Grace Hopper", "Katherine Johnson"];

beforeEach(reduceMotion);

it("counts the entries as they are pasted", async () => {
  const user = userEvent.setup();
  render(<DrawMachine />);

  expect(screen.getByText("No entries yet")).toBeInTheDocument();
  await type(user, NAMES);
  expect(screen.getByText("3 entries")).toBeInTheDocument();
});

describe("the list people actually paste", () => {
  it("tidies up a numbered list", async () => {
    const user = userEvent.setup();
    render(<DrawMachine />);

    await type(user, ["1. Ada Lovelace", "2. Grace Hopper", "3. Katherine Johnson"]);
    expect(screen.getByText("3 entries")).toBeInTheDocument();
  });

  it("reads a weight as extra chances and says what the odds became", async () => {
    const user = userEvent.setup();
    render(<DrawMachine />);

    await type(user, ["Ada Lovelace x3", "Grace Hopper"]);
    expect(screen.getByText("4 chances from 2 names")).toBeInTheDocument();
    expect(screen.getByText(/3 of 4/)).toBeInTheDocument();
    expect(screen.getByText(/75%/)).toBeInTheDocument();
  });

  it("can be told that those are just names", async () => {
    const user = userEvent.setup();
    render(<DrawMachine />);
    await type(user, ["Ada Lovelace x3", "Grace Hopper"]);

    await user.click(screen.getByLabelText(/Read x3 as extra chances/));
    expect(screen.getByText("2 entries")).toBeInTheDocument();
  });

  it("counts a repeated name once when asked", async () => {
    const user = userEvent.setup();
    render(<DrawMachine />);
    await type(user, ["Ada Lovelace", "Ada Lovelace", "Grace Hopper"]);

    expect(screen.getByText("3 chances from 2 names")).toBeInTheDocument();
    await user.click(screen.getByLabelText("Count a repeated name once"));
    expect(screen.getByText("2 entries")).toBeInTheDocument();
  });

  it("pulls the handles out of a pasted comment thread", async () => {
    const user = userEvent.setup();
    render(<DrawMachine />);
    await type(user, [
      "@ada_l count me in!",
      "@grace.hopper me too",
      "@ada_l one more for luck",
    ]);

    await user.click(screen.getByRole("button", { name: "Keep only the @handles" }));

    expect(screen.getByLabelText("Your entries")).toHaveValue("@ada_l\n@grace.hopper");
    expect(screen.getByText("2 entries")).toBeInTheDocument();
  });

  it("carries the weights into a second round when the winners are removed", async () => {
    const user = userEvent.setup();
    render(<DrawMachine />);
    await type(user, ["Ada Lovelace x2", "Grace Hopper x2", "Katherine Johnson x2"]);

    await user.click(screen.getByRole("button", { name: "Draw a winner" }));
    await screen.findByRole("list");
    await user.click(screen.getByRole("button", { name: "Remove winners from the list" }));

    // Whichever name came out, the two that are left keep both of their chances.
    await waitFor(() =>
      expect(screen.getByText("4 chances from 2 names")).toBeInTheDocument()
    );
    const lines = screen.getByLabelText("Your entries").value.split("\n");
    expect(lines).toHaveLength(2);
    lines.forEach((line) => expect(line).toMatch(/ x2$/));
  });
});

describe("a shared list link", () => {
  afterEach(() => {
    window.location.hash = "";
  });

  it("fills the pad from the fragment and says where it came from", async () => {
    window.location.hash = listUrl("Form 4B", NAMES.join("\n")).split("#")[1];
    render(<DrawMachine />);

    expect(await screen.findByLabelText("Your entries")).toHaveValue(NAMES.join("\n"));
    expect(screen.getByText(/Filled in from the link you opened: Form 4B/)).toBeInTheDocument();
    expect(screen.getByLabelText("Name for this list")).toHaveValue("Form 4B");
  });

  it("stays quiet about an ordinary anchor", async () => {
    window.location.hash = "draw";
    render(<DrawMachine />);

    expect(screen.getByText("No entries yet")).toBeInTheDocument();
    expect(screen.queryByText(/Filled in from the link/)).not.toBeInTheDocument();
  });
});

describe("the reveal", () => {
  // The reveal is a reading of a result that already exists: the draw has
  // committed to a winner before the reel or the wheel moves. These tests check
  // that the stage plays and then hands over the same stub as a quick draw.
  beforeEach(() => {
    allowMotion();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const setup = () => userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  const finish = () => act(() => jest.advanceTimersByTime(5000));

  it("runs the reel and then shows the stub it was holding", async () => {
    const user = setup();
    render(<DrawMachine />);
    await type(user, NAMES);

    await user.click(screen.getByRole("button", { name: "Draw a winner" }));

    const reel = await screen.findByTestId("reel");
    expect(reel).toBeInTheDocument();
    expect(screen.getByText("Drawing")).toBeInTheDocument();
    // The reel is built to land on the name the draw already committed to, so its
    // last row is the name the stub goes on to show.
    const rows = reel.querySelectorAll("[data-testid='reel'] > div > div");
    const landed = rows[rows.length - 1].textContent;
    expect(NAMES).toContain(landed);

    finish();

    expect(screen.getByRole("list").textContent).toBe(landed);
    expect(screen.queryByTestId("reel")).not.toBeInTheDocument();
  });

  it("runs the wheel instead when the wheel is picked", async () => {
    const user = setup();
    render(<DrawMachine />);
    await type(user, NAMES);

    await user.click(screen.getByLabelText("Wheel"));
    await user.click(screen.getByRole("button", { name: "Draw a winner" }));

    const wheel = await screen.findByTestId("wheel");
    // One slice per name, sized by its chances.
    expect(wheel.querySelectorAll("path")).toHaveLength(NAMES.length);
    expect(screen.queryByTestId("reel")).not.toBeInTheDocument();

    finish();
    expect(NAMES).toContain(screen.getByRole("list").textContent);
  });

  it("goes straight to the stub when that is what was asked for", async () => {
    const user = setup();
    render(<DrawMachine />);
    await type(user, NAMES);

    await user.click(screen.getByLabelText("Straight to the stub"));
    await user.click(screen.getByRole("button", { name: "Draw a winner" }));

    await waitFor(() => expect(screen.getByRole("list")).toBeInTheDocument());
    expect(screen.queryByTestId("reel")).not.toBeInTheDocument();
  });

  it("says so when a list is too long to read on a wheel, and uses the reel", async () => {
    const user = setup();
    render(<DrawMachine />);

    await user.click(screen.getByLabelText("Your entries"));
    await user.paste(
      Array.from({ length: 61 }, (_, index) => `Entrant ${index + 1}`).join("\n")
    );
    await user.click(screen.getByLabelText("Wheel"));

    expect(
      screen.getByText(/61 names is too many to read on a wheel/)
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Draw a winner" }));

    expect(await screen.findByTestId("reel")).toBeInTheDocument();
    finish();
    expect(screen.getByRole("list").textContent).toMatch(/^Entrant \d+$/);
  });
});

it("draws a winner from the list and shows the proof alongside it", async () => {
  const user = userEvent.setup();
  render(<DrawMachine />);
  await type(user, NAMES);

  await user.click(screen.getByRole("button", { name: "Draw a winner" }));

  const stub = await screen.findByRole("list");
  expect(NAMES).toContain(stub.textContent);
  expect(screen.getByText(/^Draw [0-9A-F]{4}-[0-9A-F]{4}$/)).toBeInTheDocument();
  expect(screen.getByText("Seed")).toBeInTheDocument();
  expect(screen.getByText("List hash")).toBeInTheDocument();
  expect(screen.getByText("1 of 3")).toBeInTheDocument();
});

it("draws several winners in order without repeating one", async () => {
  const user = userEvent.setup();
  render(<DrawMachine />);
  await type(user, NAMES);

  const winners = screen.getByLabelText("Winners to draw");
  await user.clear(winners);
  await user.type(winners, "3");
  await user.click(screen.getByRole("button", { name: "Draw 3 winners" }));

  const drawn = await screen.findByRole("list");
  const items = drawn.querySelectorAll("li");
  expect(items).toHaveLength(3);
  expect(new Set([...items].map((li) => li.textContent)).size).toBe(3);
});

it("refuses to draw from an empty list and says what to do", async () => {
  const user = userEvent.setup();
  render(<DrawMachine />);

  await user.click(screen.getByRole("button", { name: "Draw a winner" }));

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Add at least one name to draw from."
  );
});

it("takes the winner out of the list when asked, ready for another round", async () => {
  const user = userEvent.setup();
  render(<DrawMachine />);
  await type(user, NAMES);
  await user.click(screen.getByRole("button", { name: "Draw a winner" }));

  const winner = (await screen.findByRole("list")).textContent;
  await user.click(screen.getByRole("button", { name: "Remove winners from the list" }));

  await waitFor(() => expect(screen.getByText("2 entries")).toBeInTheDocument());
  expect(screen.getByLabelText("Your entries")).not.toHaveValue(
    expect.stringContaining(winner)
  );
});

it("copies the winner together with the values needed to recheck the draw", async () => {
  const writeText = jest.fn().mockResolvedValue();
  const user = userEvent.setup();
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });

  render(<DrawMachine />);
  await type(user, NAMES);
  await user.click(screen.getByRole("button", { name: "Draw a winner" }));
  await screen.findByRole("list");
  await user.click(screen.getByRole("button", { name: "Copy result and proof" }));

  const copied = writeText.mock.calls[0][0];
  expect(copied).toMatch(/^Lucky draw [0-9A-F]{4}-[0-9A-F]{4}$/m);
  expect(copied).toMatch(/^Seed: [0-9a-f]{32}$/m);
  expect(copied).toMatch(/^List SHA-256: [0-9a-f]{64}$/m);
  expect(await screen.findByRole("button", { name: "Copied" })).toBeInTheDocument();
});

it("copies a link that carries the whole draw, so the other side can recheck it", async () => {
  const writeText = jest.fn().mockResolvedValue();
  const user = userEvent.setup();
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });

  render(<DrawMachine />);
  await type(user, NAMES);
  await user.click(screen.getByRole("button", { name: "Draw a winner" }));
  await screen.findByRole("list");
  await user.click(screen.getByRole("button", { name: "Copy a link that checks itself" }));

  const link = writeText.mock.calls[0][0];
  expect(link.startsWith(`${SITE_URL}/verify#`)).toBe(true);

  // The recipient's side of the bargain: the link alone is enough to recompute
  // the draw and disagree with it.
  const certificate = decodeCertificate(link);
  expect(certificate.entries).toEqual(NAMES);
  expect(await verifyDraw(certificate)).toBe(true);
  expect(await screen.findByRole("button", { name: "Link copied" })).toBeInTheDocument();
});
