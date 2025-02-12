"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { TweetEmbed } from "@/components/TweetEmbed";

type LinkCardProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href?: string;
};

type MetaData = {
  title: string;
  description: string;
  image: string;
};

export const LinkCard: React.FC<LinkCardProps> = ({
  href,
  children,
  ...props
}) => {
  const [metadata, setMetadata] = useState<MetaData | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!href) return;
      try {
        const res = await fetch(
          `/api/metadata?url=${encodeURIComponent(href)}`
        );
        const data = await res.json();
        setMetadata(data);
      } catch (error) {
        console.error("Error fetching metadata:", error);
      }
    };

    fetchMetadata();
  }, [href]);

  if (!href) {
    return <span>{children}</span>;
  }

  // ツイートリンクの検出
  const tweetMatch = href.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
  if (tweetMatch) {
    return <TweetEmbed tweetId={tweetMatch[1]} />;
  }

  if (!metadata) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  }

  const proxyImageUrl = metadata.image
    ? `/api/image-proxy?url=${encodeURIComponent(metadata.image)}`
    : "/placeholder.svg";

  return (
    <span className="block no-underline my-8">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 mb-4"
        {...props}
      >
        <span className="flex items-center p-4">
          {!imageError && (
            <span className="flex-shrink-0 mr-4">
              <span className="relative w-24 h-16 md:w-32 md:h-20 inline-block">
                <Image
                  src={proxyImageUrl || "/placeholder.svg"}
                  alt={metadata.title || "Link preview"}
                  fill
                  className="rounded-md object-cover"
                  onError={() => setImageError(true)}
                  sizes="128px"
                  quality={95}
                />
              </span>
            </span>
          )}
          <span className="flex-grow min-w-0">
            <span className="block text-md md:text-lg font-semibold text-gray-800 mb-1 truncate">
              {metadata.title}
            </span>
            <span className="hidden md:inline-block text-sm text-gray-600 mb-2 line-clamp-2 overflow-hidden">
              {metadata.description}
            </span>
            <span className="flex items-center text-sm text-gray-500">
              <ExternalLink size={14} className="mr-1 flex-shrink-0" />
              <span className="truncate">{new URL(href).hostname}</span>
            </span>
          </span>
        </span>
      </a>
    </span>
  );
};

export default LinkCard;
