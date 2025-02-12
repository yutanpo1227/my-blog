import { getPostsByTag, getAllTags } from "@/lib/posts";
import PostList from "@/components/PostList";

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((tag) => ({ tag }));
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const posts = await getPostsByTag(decodedTag);

  return (
    <div className="lg:w-2/3 container mx-auto px-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">
        タグ: {decodedTag}
      </h1>
      <div className="flex justify-center">
        <PostList posts={posts} />
      </div>
    </div>
  );
}
