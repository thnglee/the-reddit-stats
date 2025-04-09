"use client";

import { useState } from "react";
import { SubredditCard } from "@/components/subreddit/SubredditCard";
import { AddSubredditModal } from "@/components/subreddit/AddSubredditModal";
import { initialSubreddits, Subreddit } from "@/data/subreddits";

export default function Home() {
  const [subreddits, setSubreddits] = useState<Subreddit[]>(initialSubreddits);

  const handleAddSubreddit = (newSubreddit: Subreddit) => {
    setSubreddits((prev) => [...prev, newSubreddit]);
  };

  return (
    <main className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">The Reddit Stats</h1>
        <AddSubredditModal onAddSubreddit={handleAddSubreddit} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subreddits.map((subreddit) => (
          <SubredditCard key={subreddit.name} subreddit={subreddit} />
        ))}
      </div>
    </main>
  );
}
