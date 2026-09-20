import { render, screen } from "@testing-library/react";

import FaqList from "./FaqList";
import { FAQS } from "../lib/faq";

it("shows every question with its answer already open", () => {
  render(<FaqList items={FAQS} />);

  FAQS.forEach((faq) => {
    expect(screen.getByRole("heading", { name: faq.question })).toBeInTheDocument();
    expect(screen.getByText(faq.answer)).toBeInTheDocument();
  });
});

// An accordion would leave /faq#is-it-fair scrolling to a collapsed heading, and
// the FAQPage markup would be claiming text the visitor cannot see.
it("gives each question an id to be linked to, matching lib/faq.js", () => {
  const { container } = render(<FaqList items={FAQS} />);

  FAQS.forEach((faq) => {
    const anchor = container.querySelector(`#${faq.id}`);
    expect(anchor).not.toBeNull();
    expect(anchor).toHaveTextContent(faq.question);
    expect(anchor).toHaveTextContent(faq.answer);
  });
});
