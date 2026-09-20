import { act, render, screen, waitFor } from "@testing-library/react";

import Wheel, { MAX_SLICES, sliceGeometry } from "./Wheel";

describe("the wheel's geometry", () => {
  it("gives every name an equal arc when the chances are equal", () => {
    const slices = sliceGeometry([
      { name: "Ada", chances: 1 },
      { name: "Grace", chances: 1 },
      { name: "Katherine", chances: 1 },
      { name: "Alan", chances: 1 },
    ]);

    expect(slices.map((slice) => slice.end - slice.start)).toEqual([90, 90, 90, 90]);
    expect(slices.map((slice) => slice.middle)).toEqual([45, 135, 225, 315]);
  });

  it("gives a name with three chances three times the arc", () => {
    const slices = sliceGeometry([
      { name: "Ada", chances: 3 },
      { name: "Grace", chances: 1 },
    ]);

    expect(slices[0].end - slices[0].start).toBe(270);
    expect(slices[1].end - slices[1].start).toBe(90);
  });

  it("covers the full circle with a single name", () => {
    const slices = sliceGeometry([{ name: "Ada", chances: 1 }]);

    expect(slices[0].start).toBe(0);
    expect(slices[0].end).toBe(360);
  });

  it("does not divide by zero on an empty list", () => {
    expect(sliceGeometry([])).toEqual([]);
  });
});

describe("the wheel on screen", () => {
  const segments = [
    { name: "Ada Lovelace", chances: 1 },
    { name: "Grace Hopper", chances: 1 },
  ];

  it("draws one slice per name and labels them", () => {
    const { container } = render(
      <Wheel segments={segments} winner="Grace Hopper" onDone={() => {}} />
    );

    expect(container.querySelectorAll("path")).toHaveLength(2);
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("Grace Hopper")).toBeInTheDocument();
  });

  it("draws a whole circle for a single name rather than an empty path", () => {
    const { container } = render(
      <Wheel
        segments={[{ name: "Ada Lovelace", chances: 1 }]}
        winner="Ada Lovelace"
        onDone={() => {}}
      />
    );

    const path = container.querySelector("path");
    expect(path.getAttribute("d")).toMatch(/^M 4 100 a 96 96/);
  });

  it("drops the labels once there are too many to read", () => {
    const many = Array.from({ length: 30 }, (_, index) => ({
      name: `Entrant ${index + 1}`,
      chances: 1,
    }));

    const { container } = render(
      <Wheel segments={many} winner="Entrant 7" onDone={() => {}} />
    );

    expect(container.querySelectorAll("path")).toHaveLength(30);
    expect(container.querySelectorAll("text")).toHaveLength(0);
  });

  it("is hidden from screen readers, which are told the winner by the stub", () => {
    const { container } = render(
      <Wheel segments={segments} winner="Ada Lovelace" onDone={() => {}} />
    );

    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });

  it("stops with the winning slice under the pointer at the top", async () => {
    // The spin is a reading of a result that already exists: the rotation is
    // computed backwards from the name it was handed.
    const { container } = render(
      <Wheel segments={segments} winner="Grace Hopper" onDone={() => {}} />
    );

    const group = container.querySelector("g");
    // One frame passes at rotation 0 before the transition starts.
    expect(group.style.transform).toBe("rotate(0deg)");

    const middle = sliceGeometry(segments)[1].middle;
    await waitFor(() => {
      const turned = Number(group.style.transform.match(/rotate\((-?[\d.]+)deg\)/)[1]);
      expect(turned).not.toBe(0);
      // Whole turns aside, the winning slice's middle ends up at the pointer.
      expect((((turned + middle) % 360) + 360) % 360).toBeCloseTo(0);
    });
  });

  it("reports the result on a timer, not on transitionend", () => {
    jest.useFakeTimers();
    const onDone = jest.fn();

    try {
      render(<Wheel segments={segments} winner="Ada Lovelace" onDone={onDone} />);
      expect(onDone).not.toHaveBeenCalled();

      // A backgrounded tab never fires transitionend, so the timer has to be
      // what shows the winner.
      act(() => jest.advanceTimersByTime(4000));
      expect(onDone).toHaveBeenCalledTimes(1);
    } finally {
      jest.useRealTimers();
    }
  });

  it("reports at once when there is to be no motion", () => {
    const onDone = jest.fn();
    render(
      <Wheel segments={segments} winner="Ada Lovelace" animate={false} onDone={onDone} />
    );

    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("falls back to the first slice if the winner is somehow not on the wheel", () => {
    const onDone = jest.fn();
    expect(() =>
      render(<Wheel segments={segments} winner="Nobody" animate={false} onDone={onDone} />)
    ).not.toThrow();
    expect(onDone).toHaveBeenCalled();
  });

  it("publishes the limit past which a wheel stops being readable", () => {
    expect(MAX_SLICES).toBeGreaterThan(0);
  });
});
