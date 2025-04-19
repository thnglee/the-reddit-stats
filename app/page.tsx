"use client"

import { useState } from "react"
import { SubredditCard } from "@/components/subreddit/SubredditCard"
import { AddSubredditModal } from "@/components/subreddit/AddSubredditModal"
import { initialSubreddits, type Subreddit } from "@/data/subreddits"
import { ArrowUpRight, BarChart2, TrendingUp } from "lucide-react"

export default function Home() {
  const [subreddits, setSubreddits] = useState<Subreddit[]>(initialSubreddits)

  const handleAddSubreddit = (newSubreddit: Subreddit) => {
    setSubreddits((prev) => [...prev, newSubreddit])
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="mb-12 rounded-2xl bg-slate-100 p-8 dark:bg-slate-800/50">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <BarChart2 className="h-6 w-6 text-orange-500" />
                <h1 className="text-4xl font-bold tracking-tight">The Reddit Stats</h1>
              </div>
              <p className="text-muted-foreground">Track and analyze your favorite subreddits in one place</p>
            </div>
            <AddSubredditModal onAddSubreddit={handleAddSubreddit} />
          </div>
        </div>

        {/* Stats Summary */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Total Subreddits</h3>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <p className="mt-2 text-3xl font-bold">{subreddits.length}</p>
          </div>
        </div>

        {/* Subreddit Cards */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Subreddits</h2>
          <a href="#" className="flex items-center gap-1 text-sm font-medium text-orange-500 hover:underline">
            View all <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {subreddits.map((subreddit) => (
            <SubredditCard key={subreddit.name} subreddit={subreddit} />
          ))}
        </div>
      </div>
    </main>
  )
}
