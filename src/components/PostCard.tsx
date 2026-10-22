import Image from "next/image";
import Link from "next/link";
import { formatDate, postImage, type Post } from "@/lib/content";

export default function PostCard({ post, large = false }: { post: Post; large?: boolean }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <div className={`relative overflow-hidden bg-sand ${large ? "aspect-[16/10]" : "aspect-[4/3]"}`}>
        <Image
          src={postImage(post.image)}
          alt=""
          fill
          sizes={large ? "(max-width: 1024px) 100vw, 60vw" : "(max-width: 768px) 100vw, 33vw"}
          className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]"
        />
      </div>
      <p className="eyebrow mt-5">{post.category}</p>
      <h3 className={`mt-2 leading-[1.15] transition-colors group-hover:text-gold-dark ${large ? "text-4xl sm:text-[2.6rem]" : "text-[1.7rem]"}`}>
        {post.title}
      </h3>
      {large && <p className="mt-3 max-w-2xl text-lg text-muted">{post.excerpt}</p>}
      <p className="mt-3 text-sm text-muted">
        {formatDate(post.date)} · {post.minutes} min read
      </p>
    </Link>
  );
}
