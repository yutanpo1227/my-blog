import { getAllTags } from "@/lib/posts";
import TagList from "@/components/TagList";

export default async function TagsPage() {
  const tags = await getAllTags();

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8">タグ一覧</h1>
      <TagList tags={tags} />
    </div>
  );
}
