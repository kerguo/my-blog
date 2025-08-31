import Link from "next/link";

export default function PostCard({ post }: { post: { slug: string; title: string; date: string } }) {
  return (
    <div className="border p-4 rounded-xl shadow-md hover:shadow-lg transition">
      <h2 className="text-xl font-bold">
        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
      </h2>
      <p className="text-sm text-gray-500">{post.date}</p>
    </div>
  );
}