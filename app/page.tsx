import { getAllPosts } from "@/lib/posts";
import PostCard from "@/components/PostCard";

export default function Home() {
  const posts = getAllPosts();

  return (
    <main className="max-w-2xl mx-auto py-10 space-y-6">
      <h1 className="text-3xl font-bold mb-6">我的博客</h1>
      {posts.map((post) => (
        <PostCard key={post.slug} post={post} />
      ))}
    </main>
  );
}