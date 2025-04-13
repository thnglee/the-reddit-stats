"use client";

import { useEffect } from "react";
import { use } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostsTable } from "@/components/post/PostsTable";
import { ThemeCards } from "@/components/post/ThemeCards";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRedditStore } from "@/lib/store";

interface SubredditPageProps {
  params: Promise<{
    name: string;
  }>;
}

export default function SubredditPage({ params }: SubredditPageProps) {
  const { name: subredditName } = use(params);
  
  // Get state and actions from the store
  const {
    posts,
    isLoadingPosts,
    postsError,
    themeAnalysis,
    isAnalyzing,
    analysisError,
    selectedPost,
    fetchPosts,
    analyzePosts,
    setSelectedPost
  } = useRedditStore();

  // Fetch posts when the subreddit changes
  useEffect(() => {
    fetchPosts(subredditName);
  }, [subredditName, fetchPosts]);

  // Analyze posts when they change
  useEffect(() => {
    if (posts.length > 0) {
      analyzePosts(posts);
    }
  }, [posts, analyzePosts]);

  // Handle manual refresh
  const handleRefresh = async () => {
    await fetchPosts(subredditName);
  };

  return (
    <main className="container mx-auto py-8">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold">r/{subredditName}</h1>
        <Button
          onClick={handleRefresh}
          disabled={isLoadingPosts}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoadingPosts ? 'animate-spin' : ''}`} />
          {isLoadingPosts ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <Tabs defaultValue="top-posts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="top-posts">Top Posts</TabsTrigger>
          <TabsTrigger value="themes">Themes</TabsTrigger>
        </TabsList>
        <TabsContent value="top-posts">
          <div className="mt-4">
            {isLoadingPosts ? (
              <p>Loading posts from r/{subredditName}...</p>
            ) : postsError ? (
              <Alert variant="destructive">
                <AlertTitle>{postsError.message}</AlertTitle>
                {postsError.details && (
                  <AlertDescription className="mt-2">{postsError.details}</AlertDescription>
                )}
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
            {isAnalyzing ? (
              <p>Analyzing themes...</p>
            ) : analysisError ? (
              <Alert variant="destructive">
                <AlertTitle>{analysisError.message}</AlertTitle>
                {analysisError.details && (
                  <AlertDescription className="mt-2">{analysisError.details}</AlertDescription>
                )}
              </Alert>
            ) : themeAnalysis ? (
              <ThemeCards categories={themeAnalysis.categories} />
            ) : (
              <p>No theme analysis available.</p>
            )}
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