import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-32 text-center">
      <p className="eyebrow">Page not found</p>
      <h1 className="mt-4 text-6xl">This path wandered off.</h1>
      <p className="mt-5 font-serif text-xl italic text-muted">“Thy word is a lamp unto my feet, and a light unto my path.” Psalm 119:105</p>
      <Link href="/" className="btn btn-gold mt-10">Back home</Link>
    </div>
  );
}
