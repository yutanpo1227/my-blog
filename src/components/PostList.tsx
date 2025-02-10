import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

type Post = {
  slug: string
  title: string
  date: string
  tags: string[]
}

type PostListProps = {
  posts: Post[] | undefined
}

export default function PostList({ posts }: PostListProps) {
  if (!posts || posts.length === 0) {
    return <p className="text-muted-foreground">記事がありません。</p>
  }

  return (
    <ul className="space-y-4">
      {posts.map((post) => (
        <li key={post.slug} className="border rounded-lg p-4 bg-card text-card-foreground">
          <div className="flex items-center space-x-4">
            <Image
              src={`/thumbnails/${post.slug}.png`}
              alt={post.title}
              width={100}
              height={100}
              className="rounded-md"
            />
            <div>
              <Link href={`/posts/${post.slug}`} className="text-xl font-semibold hover:underline">
                {post.title}
              </Link>
              <p className="text-muted-foreground">{post.date}</p>
              <div className="mt-2 space-x-2">
                {post.tags &&
                  post.tags.map((tag) => (
                    <Button key={tag} variant="outline" size="sm" asChild>
                      <Link href={`/tags/${tag}`}>{tag}</Link>
                    </Button>
                  ))}
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

