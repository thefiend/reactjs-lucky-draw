/**
 * Questions render open as headings and paragraphs rather than as an accordion:
 * an anchor like /faq#is-it-fair has to land on visible text, and this is the
 * copy the FAQPage markup claims is on the page.
 */
export default function FaqList({ items }) {
  return (
    <div className="divide-y divide-rule border-t border-rule">
      {items.map((faq) => (
        <article key={faq.id} id={faq.id} className="scroll-mt-24 py-6">
          <h3 className="text-lg font-semibold">{faq.question}</h3>
          <p className="mt-2 max-w-[68ch] text-slate">{faq.answer}</p>
        </article>
      ))}
    </div>
  );
}
