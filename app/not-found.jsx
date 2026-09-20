import Link from "next/link";

export const metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
      <h1 className="text-3xl font-semibold">That page is not here</h1>
      <p className="mt-4 text-slate">
        The link may be old or mistyped. The draw itself is one click away.
      </p>
      <p className="mt-6">
        <Link href="/" className="underline">
          Run a draw
        </Link>
      </p>
    </div>
  );
}
