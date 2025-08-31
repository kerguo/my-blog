import { getPostData, getAllPosts } from "@/lib/posts";
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
    const posts = getAllPosts();
    return posts.map((post) => ({ slug: post.slug }));
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;
        const post = await getPostData(slug);

        return (
            <main className="max-w-2xl mx-auto py-10">
                <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
                <p className="text-gray-500 text-sm mb-6">{post.date}</p>
                <article
                    className="prose dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: post.contentHtml }}
                />
            </main>
        );
    } catch (error) {
        notFound();
    }
}