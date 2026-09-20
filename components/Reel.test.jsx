import { act, render, screen, waitFor } from "@testing-library/react";

import Reel, { reelRows } from "./Reel";

describe("the reel strip", () => {
  it("comes to rest on the winner", () => {
    const rows = reelRows(["Ada", "Grace", "Katherine"], "Grace");

    expect(rows[rows.length - 1]).toBe("Grace");
  });

  it("cycles the real entries on the way past, not filler", () => {
    const entries = ["Ada", "Grace", "Katherine"];
    const rows = reelRows(entries, "Ada");

    expect(rows.length).toBeGreaterThan(entries.length);
    rows.slice(0, -1).forEach((row) => expect(entries).toContain(row));
  });

  it("still shows the winner when the list is somehow empty", () => {
    expect(reelRows([], "Ada")).toEqual(["Ada"]);
  });
});

describe("the reel on screen", () => {
  const entries = ["Ada Lovelace", "Grace Hopper", "Katherine Johnson"];

  it("is hidden from screen readers, which are told the winner by the stub", () => {
    render(<Reel entries={entries} winner="Grace Hopper" onDone={() => {}} />);

    expect(screen.getByTestId("reel")).toHaveAttribute("aria-hidden", "true");
  });

  it("slides up to the winner's row", async () => {
    const { container } = render(
      <Reel entries={entries} winner="Grace Hopper" onDone={() => {}} />
    );

    const strip = container.querySelector("[data-testid='reel'] > div");
    expect(strip.style.transform).toBe("translateY(0px)");

    const rows = reelRows(entries, "Grace Hopper").length;
    await waitFor(() => {
      const offset = Number(strip.style.transform.match(/translateY\((-?\d+)px\)/)[1]);
      expect(offset).toBe(-(rows - 1) * 56);
    });
  });

  it("reports the result on a timer, not on transitionend", () => {
    jest.useFakeTimers();
    const onDone = jest.fn();

    try {
      render(<Reel entries={entries} winner="Ada Lovelace" onDone={onDone} />);
      expect(onDone).not.toHaveBeenCalled();

      act(() => jest.advanceTimersByTime(2500));
      expect(onDone).toHaveBeenCalledTimes(1);
    } finally {
      jest.useRealTimers();
    }
  });

  it("reports at once when there is to be no motion", () => {
    const onDone = jest.fn();
    render(
      <Reel entries={entries} winner="Ada Lovelace" animate={false} onDone={onDone} />
    );

    expect(onDone).toHaveBeenCalledTimes(1);
  });
});
