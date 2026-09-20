import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Verifier from "./Verifier";
import { encodeCertificate } from "../lib/certificate";
import { runDraw } from "../lib/draw";

const ENTRIES = ["Ada Lovelace", "Grace Hopper", "Katherine Johnson", "Alan Turing"];
const SEED = "0123456789abcdef0123456789abcdef";

const fill = async (user, { entries = ENTRIES, seed = SEED, winners }) => {
  await user.type(screen.getByLabelText("The entry list"), entries.join("\n"));
  await user.type(screen.getByLabelText("The seed"), seed);
  await user.type(screen.getByLabelText("The winners"), winners.join("\n"));
  await user.click(screen.getByRole("button", { name: "Recompute this draw" }));
};

const verdict = async () => (await screen.findByText(/^This draw/)).dataset.verdict;

const openWith = (fragment) => {
  window.location.hash = fragment;
};

afterEach(() => {
  window.location.hash = "";
});

it("agrees with a draw that was really made from that seed", async () => {
  const user = userEvent.setup();
  const drawn = await runDraw({ entries: ENTRIES, seed: SEED, count: 2 });
  render(<Verifier />);

  await fill(user, { winners: drawn.winners.map((winner) => winner.name) });

  expect(await verdict()).toBe("match");
  expect(screen.getByText(drawn.serial)).toBeInTheDocument();
});

it("rejects a winner who could not have come out of that seed", async () => {
  const user = userEvent.setup();
  render(<Verifier />);

  await fill(user, { winners: ["Katherine Johnson", "Ada Lovelace", "Grace Hopper"] });

  expect(await verdict()).toBe("mismatch");
  // The whole point of showing the recomputation: it says what the seed does
  // produce, not merely that the claim is wrong.
  expect(screen.getByText("Announced as")).toBeInTheDocument();
});

it("rejects a list with an entry quietly removed", async () => {
  const user = userEvent.setup();
  const drawn = await runDraw({ entries: ENTRIES, seed: SEED, count: 2 });
  render(<Verifier />);

  await fill(user, {
    entries: ENTRIES.filter((entry) => entry !== "Katherine Johnson"),
    winners: drawn.winners.map((winner) => winner.name),
  });

  expect(await verdict()).toBe("mismatch");
});

describe("says what is missing rather than failing quietly", () => {
  const cases = [
    {
      name: "no entries",
      fields: { entries: [], winners: ["Ada Lovelace"] },
      message: /Paste the entry list/,
    },
    {
      name: "no winners",
      fields: { winners: [] },
      message: /Add the winners/,
    },
    {
      name: "a seed that is not a seed",
      fields: { seed: "not-a-seed", winners: ["Ada Lovelace"] },
      message: /32 hexadecimal characters/,
    },
    {
      name: "more winners than entries",
      fields: {
        entries: ["Solo"],
        winners: ["Solo", "Anybody"],
      },
      message: /more winners here than entries/,
    },
  ];

  cases.forEach(({ name, fields, message }) => {
    it(name, async () => {
      const user = userEvent.setup();
      render(<Verifier />);

      const entries = fields.entries ?? ENTRIES;
      if (entries.length) {
        await user.type(screen.getByLabelText("The entry list"), entries.join("\n"));
      }
      await user.type(screen.getByLabelText("The seed"), fields.seed ?? SEED);
      if (fields.winners.length) {
        await user.type(screen.getByLabelText("The winners"), fields.winners.join("\n"));
      }
      await user.click(screen.getByRole("button", { name: "Recompute this draw" }));

      expect(await screen.findByRole("alert")).toHaveTextContent(message);
    });
  });
});

describe("a certificate link", () => {
  it("fills itself in and checks itself on arrival", async () => {
    const drawn = await runDraw({ entries: ENTRIES, seed: SEED, count: 2 });
    openWith(
      `#${encodeCertificate({ seed: SEED, entries: ENTRIES, winners: drawn.winners })}`
    );

    render(<Verifier />);

    expect(await verdict()).toBe("match");
    expect(screen.getByLabelText("The seed")).toHaveValue(SEED);
    expect(screen.getByLabelText("The entry list")).toHaveValue(ENTRIES.join("\n"));
    expect(screen.getByText(/Filled in from the link/)).toBeInTheDocument();
  });

  it("carries a mismatch through rather than papering over it", async () => {
    openWith(
      `#${encodeCertificate({
        seed: SEED,
        entries: ENTRIES,
        winners: ["Ada Lovelace", "Grace Hopper", "Katherine Johnson"],
      })}`
    );

    render(<Verifier />);

    expect(await verdict()).toBe("mismatch");
  });

  it("says so when the link was cut short on the way", async () => {
    const whole = encodeCertificate({ seed: SEED, entries: ENTRIES, winners: ["Ada Lovelace"] });
    openWith(`#${whole.slice(0, 40)}`);

    render(<Verifier />);

    expect(await screen.findByRole("alert")).toHaveTextContent(/not a draw certificate/);
  });

  it("stays quiet on an ordinary anchor link", async () => {
    openWith("#method");

    render(<Verifier />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
