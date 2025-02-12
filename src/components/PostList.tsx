import Link from "next/link";
import Image from "next/image";
import { CalendarDays, Tag } from "lucide-react";

type Post = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
};

type PostListProps = {
  posts: Post[] | undefined;
};

export default function PostList({ posts }: PostListProps) {
  if (!posts || posts.length === 0) {
    return <p className="text-muted-foreground">記事がありません。</p>;
  }

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
      {posts.map((post) => (
        <Link key={post.slug} href={`/posts/${post.slug}`} className="block">
          <div className="border rounded-lg p-4 bg-white text-card-foreground hover:shadow-lg transition-shadow duration-300 ease-in-out h-full">
            <div className="flex flex-col space-y-4">
              <div className="w-full h-[300px] relative">
                <Image
                  src={`/thumbnails/${post.slug}.png`}
                  alt={post.title}
                  fill
                  className="rounded-md object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="text-xl font-semibold">{post.title}</h2>
                  <div className="flex items-center text-gray-600">
                    <CalendarDays className="w-4 h-4 mr-2" />
                    <p className="text-sm">{post.date}</p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center">
                    <Tag className="w-4 h-4 mr-2 text-gray-600" />
                    <div className="flex flex-wrap gap-2">
                      {post.tags &&
                        post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-block bg-gray-200 rounded-full px-3 py-1 text-xs font-semibold text-gray-700"
                          >
                            {tag}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
