import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Subreddit } from "@/data/subreddits"
import { ArrowRight, BarChart2, MessageSquare, Users } from "lucide-react"

interface SubredditCardProps {
  subreddit: Subreddit
}

export function SubredditCard({ subreddit }: SubredditCardProps) {
  return (
    <Link href={`/subreddit/${subreddit.name}`} className="block transition-transform hover:scale-[1.02]">
      <Card className="h-full overflow-hidden border transition-colors hover:border-orange-200 hover:bg-slate-50 dark:hover:border-orange-800 dark:hover:bg-slate-900/50">
        <div className="absolute right-0 top-0 h-20 w-20 overflow-hidden">
          <div className="absolute right-[-20px] top-[-20px] h-20 w-20 rotate-45 bg-orange-500/10"></div>
        </div>

        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                r/
              </div>
              <CardTitle className="text-lg">{subreddit.displayName}</CardTitle>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>

        <CardContent>
          {subreddit.description && (
            <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{subreddit.description}</p>
          )}

          <div className="mt-auto flex flex-wrap gap-3">
            {subreddit.subscribers && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span>{subreddit.subscribers.toLocaleString()} subscribers</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>View discussions</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <BarChart2 className="h-3.5 w-3.5" />
              <span>See analytics</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
