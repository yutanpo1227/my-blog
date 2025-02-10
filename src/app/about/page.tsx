import { getAboutPageData } from "@/lib/posts";
import ReactMarkdown from "react-markdown";

export default function About() {
  const { title, content } = getAboutPageData();

  return (
    <div className="container mx-auto px-4 prose lg:prose-xl">
      <h1>{title}</h1>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
