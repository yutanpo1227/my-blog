"use client";

import type React from "react";
import { useEffect, useRef } from "react";

interface TweetEmbedProps {
  tweetId: string;
}

export const TweetEmbed: React.FC<TweetEmbedProps> = ({ tweetId }) => {
  const tweetRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      // @ts-expect-error okok
      if (window.twttr) {
        // @ts-expect-error okok
        window.twttr.widgets.createTweet(tweetId, tweetRef.current, {
          theme: "light",
        });
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, [tweetId]);

  return <span ref={tweetRef} className="inline-block w-1/3" />;
};
