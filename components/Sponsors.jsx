import Image from "next/image";
import Link from "next/link";

import { SPONSORS } from "../lib/sponsors";

export default function Sponsors() {
  return (
    <section aria-labelledby="sponsors" className="mt-16 border-t border-rule pt-8">
      <h2 id="sponsors" className="text-xl">
        Sponsors
      </h2>
      <p className="mt-2 max-w-[68ch] text-sm text-slate">
        These companies pay for the listing below, which is what keeps the draw free
        and free of a sign-up wall.{" "}
        <Link href="/list" className="underline">
          Sponsor us
        </Link>
        .
      </p>

      <ul className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {SPONSORS.map((sponsor) => (
          <li key={sponsor.url}>
            <a
              href={sponsor.url}
              rel="noopener noreferrer"
              className="flex h-20 items-center justify-center"
            >
              <Image
                src={sponsor.img}
                alt={sponsor.name}
                width={180}
                height={64}
                loading="lazy"
                className="h-auto max-h-16 w-auto max-w-full object-contain"
              />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
