import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Subreddit } from "@/data/subreddits";

interface SubredditCardProps {
  subreddit: Subreddit;
}

export function SubredditCard({ subreddit }: SubredditCardProps) {
  return (
    <Link href={`/subreddit/${subreddit.name}`}>
      <Card className="hover:bg-accent transition-colors">
        <CardHeader>
          <CardTitle className="text-lg">{subreddit.displayName}</CardTitle>
        </CardHeader>
        <CardContent>
          {subreddit.description && (
            <p className="text-sm text-muted-foreground">{subreddit.description}</p>
          )}
          {subreddit.subscribers && (
            <p className="text-sm text-muted-foreground mt-2">
              {subreddit.subscribers.toLocaleString()} subscribers
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
} 