import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import DrawMachine from "./DrawMachine";

// The riffle would hold the result back for over a second. Asking for reduced
// motion is the same code path a visitor with that setting takes, and it skips
// straight to the stub.
const reduceMotion = () => {
  window.matchMedia = (query) => ({
    matches: query.includes("prefers-reduced-motion"),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
};

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
