import { getAboutPageData } from "@/lib/posts";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function About() {
  const { title, content } = getAboutPageData();

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <article className="container mx-auto px-4 max-w-6xl bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-8 divide-y-2">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{title}</h1>
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
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
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </article>
    </div>
  );
}
