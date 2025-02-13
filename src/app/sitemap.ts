import { MetadataRoute } from "next";
import { getAllPostSlugs } from "@/lib/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const defaultPages: MetadataRoute.Sitemap = [
    {
      url: "https://y-blog-livid.vercel.app/",
    },
    {
      url: "https://y-blog-livid.vercel.app/about",
    },
  ];
  const posts = getAllPostSlugs();
  const postPaths = posts.map((post) => ({
    url: `https://y-blog-livid.vercel.app/posts/${post.params.slug}`,
  }));

  return [...defaultPages, ...postPaths];
}
