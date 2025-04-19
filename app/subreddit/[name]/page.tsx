"use client"

import { useEffect } from "react"
import { use } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PostsTable } from "@/components/post/PostsTable"
import { ThemeCards } from "@/components/post/ThemeCards"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowUpRight, BarChart2, RefreshCw, TrendingUp } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRedditStore } from "@/lib/store"
import { Skeleton } from "@/components/ui/skeleton"

interface SubredditPageProps {
  params: Promise<{
    name: string
  }>
}

export default function SubredditPage({ params }: SubredditPageProps) {
  const { name: subredditName } = use(params)

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
    setSelectedPost,
  } = useRedditStore()

  // Fetch posts when the subreddit changes
  useEffect(() => {
    fetchPosts(subredditName)
  }, [subredditName, fetchPosts])

  // Analyze posts when they change
  useEffect(() => {
    if (posts.length > 0) {
      analyzePosts(posts)
    }
  }, [posts, analyzePosts])

  // Handle manual refresh
  const handleRefresh = async () => {
    await fetchPosts(subredditName)
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
                <h1 className="text-4xl font-bold tracking-tight">r/{subredditName}</h1>
              </div>
              <p className="text-muted-foreground">Analyzing top posts and themes from this subreddit</p>
            </div>
            <Button onClick={handleRefresh} disabled={isLoadingPosts} variant="outline" className="gap-2 self-start">
              <RefreshCw className={`h-4 w-4 ${isLoadingPosts ? "animate-spin" : ""}`} />
              {isLoadingPosts ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Total Posts</h3>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <p className="mt-2 text-3xl font-bold">{isLoadingPosts ? "-" : posts.length}</p>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Themes Identified</h3>
              <BarChart2 className="h-4 w-4 text-orange-500" />
            </div>
            <p className="mt-2 text-3xl font-bold">
              {isAnalyzing ? "-" : themeAnalysis ? themeAnalysis.categories.length : 0}
            </p>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
              <RefreshCw className="h-4 w-4 text-blue-500" />
            </div>
            <p className="mt-2 text-sm font-medium">{new Date().toLocaleTimeString()}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="rounded-xl border bg-card shadow-sm">
          <Tabs defaultValue="top-posts" className="w-full">
            <div className="border-b px-4 pt-4">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="top-posts">Top Posts</TabsTrigger>
                <TabsTrigger value="themes">Themes</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="top-posts" className="p-4">
              <div className="mt-2">
                {isLoadingPosts ? (
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : postsError ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{postsError.message}</AlertTitle>
                    {postsError.details && <AlertDescription className="mt-2">{postsError.details}</AlertDescription>}
                  </Alert>
                ) : posts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <AlertCircle className="mb-2 h-8 w-8 text-muted-foreground" />
                    <p className="text-lg font-medium">No posts found</p>
                    <p className="text-sm text-muted-foreground">No posts found in the last 24 hours.</p>
                  </div>
                ) : (
                  <PostsTable posts={posts} onRowClick={(post) => setSelectedPost(post)} />
                )}
              </div>
            </TabsContent>

            <TabsContent value="themes" className="p-4">
              <div className="mt-2">
                {isAnalyzing ? (
                  <div className="space-y-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                ) : analysisError ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{analysisError.message}</AlertTitle>
                    {analysisError.details && (
                      <AlertDescription className="mt-2">{analysisError.details}</AlertDescription>
                    )}
                  </Alert>
                ) : themeAnalysis ? (
                  <ThemeCards categories={themeAnalysis.categories} />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <AlertCircle className="mb-2 h-8 w-8 text-muted-foreground" />
                    <p className="text-lg font-medium">No theme analysis available</p>
                    <p className="text-sm text-muted-foreground">
                      Try refreshing the posts to generate theme analysis.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedPost?.title}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="prose dark:prose-invert max-w-none rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
              {selectedPost?.content || "No content available."}
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="rounded-full bg-orange-100 px-3 py-1 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                Score: {selectedPost?.score}
              </div>
              <div className="rounded-full bg-blue-100 px-3 py-1 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                Comments: {selectedPost?.numComments}
              </div>
              <a
                href={selectedPost?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto flex items-center gap-1 text-orange-500 hover:underline"
              >
                View on Reddit <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}
