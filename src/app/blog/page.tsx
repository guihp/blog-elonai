import type { Metadata } from "next";
import PostCard from "@/components/PostCard";
import { getPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Blog",
  description: "Bible-based encouragement on anxiety, prayer, the Holy Spirit, identity and everyday faith.",
};

export default async function BlogPage() {
  const posts = await getPosts();
  const [featured, ...rest] = posts;
  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 pt-14 sm:px-8">
      <header className="max-w-3xl">
        <p className="eyebrow">The Elonai Blog</p>
        <h1 className="mt-4 text-6xl leading-none sm:text-7xl">Encouragement for the everyday walk.</h1>
        <p className="mt-6 text-lg text-muted">Honest, Scripture-rooted reflections on anxiety, prayer, the Holy Spirit and the life of faith.</p>
      </header>
      {featured && (
        <div className="mt-16 border-t border-line pt-14">
          <PostCard post={featured} large />
        </div>
      )}
      <div className="mt-20 grid gap-x-10 gap-y-16 border-t border-line pt-14 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((p) => <PostCard key={p.slug} post={p} />)}
      </div>
    </div>
  );
}
