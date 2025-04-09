"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostsTable } from "@/components/post/PostsTable";
import { fetchRecentPosts, RedditPost } from "@/lib/reddit";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SubredditPageProps {
  params: Promise<{
    name: string;
  }>;
}

export default function SubredditPage({ params }: SubredditPageProps) {
  const { name: subredditName } = use(params);
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<RedditPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPosts() {
      try {
        setIsLoading(true);
        setError(null);
        console.log(`Loading posts for r/${subredditName}...`);
        const fetchedPosts = await fetchRecentPosts(subredditName);
        console.log(`Received ${fetchedPosts.length} posts for r/${subredditName}`);
        setPosts(fetchedPosts);
      } catch (error: any) {
        console.error(`Error loading posts for r/${subredditName}:`, error);
        setError(error.message || 'Failed to load posts');
      } finally {
        setIsLoading(false);
      }
    }

    loadPosts();
  }, [subredditName]);

  return (
    <main className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">r/{subredditName}</h1>
      </div>

      <Tabs defaultValue="top-posts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="top-posts">Top Posts</TabsTrigger>
          <TabsTrigger value="themes">Themes</TabsTrigger>
        </TabsList>
        <TabsContent value="top-posts">
          <div className="mt-4">
            {isLoading ? (
              <p>Loading posts from r/{subredditName}...</p>
            ) : error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : posts.length === 0 ? (
              <p>No posts found in the last 24 hours.</p>
            ) : (
              <PostsTable
                posts={posts}
                onRowClick={(post) => setSelectedPost(post)}
              />
            )}
          </div>
        </TabsContent>
        <TabsContent value="themes">
          <div className="mt-4">
            <p>Themes content coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedPost?.title}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="prose dark:prose-invert max-w-none">
              {selectedPost?.content || "No content available."}
            </div>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>Score: {selectedPost?.score}</span>
              <span>Comments: {selectedPost?.numComments}</span>
              <a
                href={selectedPost?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                View on Reddit
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
} 