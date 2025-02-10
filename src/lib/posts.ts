import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "src/posts");

export async function getSortedPostsData() {
  try {
    const fileNames = fs.readdirSync(postsDirectory);
    const postFileNames = fileNames.filter(
      (fileName) => fileName !== "about.md"
    );
    const allPostsData = await Promise.all(
      postFileNames.map(async (fileName) => {
        const slug = fileName.replace(/\.md$/, "");
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, "utf8");
        const { data, content } = matter(fileContents);

        return {
          slug,
          ...(data as { date: string; title: string; tags: string[] }),
          content,
        };
      })
    );

    return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
  } catch (error) {
    console.error("Error reading post data:", error);
    return [];
  }
}

export function getAllPostSlugs() {
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames
    .filter((fileName) => fileName !== "about.md")
    .map((fileName) => {
      return {
        params: {
          slug: fileName.replace(/\.md$/, ""),
        },
      };
    });
}

export function getPostData(slug: string) {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    slug,
    ...(data as { date: string; title: string; tags: string[] }),
    content,
  };
}

export async function getAllTags() {
  const posts = await getSortedPostsData();
  const tags = new Set<string>();
  posts.forEach((post) => {
    post.tags?.forEach((tag) => tags.add(tag));
  });
  return Array.from(tags);
}

export async function getPostsByTag(tag: string) {
  const posts = await getSortedPostsData();
  return posts.filter((post) => post.tags?.includes(tag));
}

export function getAboutPageData() {
  const fullPath = path.join(postsDirectory, "about.md");
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    ...(data as { title: string }),
    content,
  };
}
