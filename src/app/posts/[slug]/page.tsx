import { getPostData, getAllPostSlugs } from "@/lib/posts";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import remarkGfm from "remark-gfm";
import { Pre } from "@/components/Pre";
import { Code } from "@/components/Code";
import { LinkCard } from "@/components/LinkCard";
import { CalendarDays, Tag } from "lucide-react";
import path from "path";

export async function generateStaticParams() {
  const paths = getAllPostSlugs();
  return paths;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const postData = getPostData(slug);
  const baseUrl = !process.env.VERCEL_URL!.includes("http")
    ? `https://${process.env.VERCEL_URL!}`
    : process.env.VERCEL_URL!;
  return {
    title: postData.title,
    description: postData.content.slice(0, 100),
    other: {
      "google-site-verification": "yls0n_4Y7DnKtNpTU9p6N5It8fWnSPvj5IeV-0KgI50",
      "og:type": "article",
      "og:site_name": "Y-Blog",
      "og:title": postData.title,
      "og:description": postData.content.slice(0, 100),
      "og:image": path.join(baseUrl, "thumbnails", `${slug}.png`),
      "og:url": path.join(baseUrl, "posts", slug),
      "twitter:card": "summary",
      "twitter:site": "@yuu_gakusei",
      "twitter:title": postData.title,
      "twitter:description": postData.content.slice(0, 100),
      "twitter:image": path.join(baseUrl, "thumbnails", `${slug}.png`),
    },
  };
}

export default async function Post({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const postData = getPostData(slug);

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <article className="container mx-auto md:px-4 max-w-6xl bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="py-8 px-4 md:px-8">
          <div className="border-b-2 mb-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
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
              className="markdown"
              remarkPlugins={[remarkGfm]}
              components={{
                pre: Pre,
                code: Code,
                a: ({ ...props }) => <LinkCard {...props} />,
                img: ({ ...props }) => (
                  <img {...props} className="mx-auto block md:w-3/4 my-5" />
                ),
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
