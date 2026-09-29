"use client";

import Link from "next/link";
import PostCard from "@/components/feed/PostCard";
import { usePosts } from "@/components/feed/usePosts";

/** The home feed: posts from the circles the member has joined, each one still showing which circle it came from. */
export default function HomeFeed({ circleIds }: { circleIds: string[] }) {
  const { posts } = usePosts();
  const feed = posts.filter((p) => p.circle && circleIds.includes(p.circle));

  if (feed.length === 0) {
    return (
      <p className="kn-empty">
        No posts yet from your circles. <Link href="/circles">Join a circle</Link> to see what people are sharing.
      </p>
    );
  }

  return (
    <div className="kn-postlist">
      {feed.map((p) => (
        <PostCard key={p.id} post={p} />
      ))}
    </div>
  );
}
