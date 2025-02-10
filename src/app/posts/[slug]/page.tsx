import { getPostData, getAllPostSlugs } from "@/lib/posts";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import remarkGfm from "remark-gfm";
import { Pre } from "@/components/Pre";
import { Code } from "@/components/Code";
import { CalendarDays, Tag } from "lucide-react";

export async function generateStaticParams() {
  const paths = getAllPostSlugs();
  return paths;
}

export default async function Post({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const postData = getPostData(slug);

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <article className="container mx-auto px-4 max-w-6xl bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-8">
          <div className="border-b-2 mb-6">
            <h1 className="text-4xl font-bold mb-4 text-gray-900">
              {postData.title}
            </h1>
            <div className="flex items-center text-sm text-gray-600 mb-4">
              <CalendarDays className="w-4 h-4 mr-2" />
              <time dateTime={postData.date}>{postData.date}</time>
            </div>
            <div className="flex flex-wrap items-center mb-2">
              <Tag className="w-4 h-4 mr-2 text-gray-600" />
              {postData.tags &&
                postData.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/tags/${tag}`}
                    className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-medium text-gray-700 mr-2 mb-2 hover:bg-gray-200  transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
            </div>
          </div>
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                pre: Pre,
                code: Code,
                h1: ({ node, ...props }) => (
                  <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />
                ),
                h2: ({ node, ...props }) => (
                  <h2 className="text-2xl font-semibold mt-6 mb-3" {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <h3 className="text-xl font-medium mt-4 mb-2" {...props} />
                ),
                p: ({ node, ...props }) => <p className="mb-4" {...props} />,
                ul: ({ node, ...props }) => (
                  <ul className="list-disc pl-6 mb-4" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal pl-6 mb-4" {...props} />
                ),
                li: ({ node, ...props }) => <li className="mb-2" {...props} />,
              }}
            >
              {postData.content}
            </ReactMarkdown>
          </div>
        </div>
      </article>
    </div>
  );
}
