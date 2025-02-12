import { getAboutPageData } from "@/lib/posts";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function About() {
  const { title, content } = getAboutPageData();

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <article className="container mx-auto px-4 max-w-6xl bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-8 divide-y-2">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            {title}
          </h1>
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown
              className="markdown"
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ ...props }) => (
                  <a {...props} className="text-blue-500 underline" />
                ),
                img: ({ ...props }) => (
                  <img {...props} className="mx-auto block md:w-3/4 my-5" />
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </article>
    </div>
  );
}
