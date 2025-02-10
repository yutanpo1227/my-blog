import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="bg-white border-b">
      <nav className="container mx-auto px-2 md:px-0 flex justify-between items-center py-4">
        <Link href="/" className="text-2xl font-bold text-primary">
          マイブログ
        </Link>
        <ul className="flex space-x-4">
          <li>
            <Button variant="ghost" asChild>
              <Link href="/">ホーム</Link>
            </Button>
          </li>
          <li>
            <Button variant="ghost" asChild>
              <Link href="/tags">タグ</Link>
            </Button>
          </li>
          <li>
            <Button variant="ghost" asChild>
              <Link href="/about">自己紹介</Link>
            </Button>
          </li>
        </ul>
      </nav>
    </header>
  );
}
