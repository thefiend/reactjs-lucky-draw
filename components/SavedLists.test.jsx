import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SavedLists from "./SavedLists";
import { decodeListLink, loadLists, saveList } from "../lib/lists";

const REGISTER = "Ada Lovelace\nGrace Hopper";

const show = (props = {}) => {
  const onLoad = jest.fn();
  render(<SavedLists text={REGISTER} onLoad={onLoad} {...props} />);
  return onLoad;
};

const name = async (user, listName) => {
  await user.type(screen.getByLabelText("Name for this list"), listName);
};

beforeEach(() => {
  window.localStorage.clear();
});

it("says there is nothing saved before anything is", () => {
  show();
  expect(screen.getByText(/Nothing saved yet/)).toBeInTheDocument();
});

it("saves the list under a name and lists it with its size", async () => {
  const user = userEvent.setup();
  show();

  await name(user, "Form 4B");
  await user.click(screen.getByRole("button", { name: "Save this list" }));

  expect(screen.getByRole("button", { name: "Form 4B" })).toBeInTheDocument();
  expect(screen.getByText("2 chances")).toBeInTheDocument();
  expect(loadLists()[0]).toMatchObject({ name: "Form 4B", text: REGISTER });
});

it("will not save without a name", () => {
  show();
  expect(screen.getByRole("button", { name: "Save this list" })).toBeDisabled();
});

it("saves on Enter without setting the draw off", async () => {
  const user = userEvent.setup();
  show();

  await name(user, "Form 4B{Enter}");

  expect(screen.getByRole("button", { name: "Form 4B" })).toBeInTheDocument();
});

it("shows what was stored on a previous visit", () => {
  saveList("October giveaway", "@ada_l\n@grace.hopper");
  show();

  expect(screen.getByRole("button", { name: "October giveaway" })).toBeInTheDocument();
});

it("hands a saved list back to the pad", async () => {
  const user = userEvent.setup();
  saveList("Form 4B", REGISTER);
  const onLoad = show({ text: "" });

  await user.click(screen.getByRole("button", { name: "Form 4B" }));

  expect(onLoad).toHaveBeenCalledWith(REGISTER);
});

it("forgets a list when asked", async () => {
  const user = userEvent.setup();
  saveList("Form 4B", REGISTER);
  show();

  await user.click(screen.getByRole("button", { name: "Forget Form 4B" }));

  expect(screen.queryByRole("button", { name: "Form 4B" })).not.toBeInTheDocument();
  expect(loadLists()).toEqual([]);
});

it("copies a link that carries the list", async () => {
  const writeText = jest.fn().mockResolvedValue();
  // After setup(), which installs a clipboard stub of its own.
  const user = userEvent.setup();
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });
  saveList("Form 4B", REGISTER);
  show();

  await user.click(screen.getByRole("button", { name: "Copy a link to Form 4B" }));

  expect(decodeListLink(writeText.mock.calls[0][0])).toEqual({
    name: "Form 4B",
    text: REGISTER,
  });
  expect(await screen.findByText("Link copied")).toBeInTheDocument();
});

it("suggests the name a shared list arrived with", () => {
  show({ suggestedName: "Form 4B" });
  expect(screen.getByLabelText("Name for this list")).toHaveValue("Form 4B");
});

it("says so when the browser refuses to store anything", async () => {
  const setItem = jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("QuotaExceededError");
  });
  const user = userEvent.setup();
  show();

  await name(user, "Form 4B");
  await user.click(screen.getByRole("button", { name: "Save this list" }));

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "not letting the page store anything"
  );
  setItem.mockRestore();
});
