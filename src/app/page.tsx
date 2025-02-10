import { getSortedPostsData } from "@/lib/posts";
import PostList from "@/components/PostList";

export default async function Home() {
  const posts = await getSortedPostsData();

  return (
    <div className="container Zmx-auto px-4">
      <h1 className="text-3xl font-bold mb-8">最新の記事</h1>
      <PostList posts={posts} />
    </div>
  );
}
