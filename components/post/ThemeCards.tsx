"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ThemeCategory } from "@/lib/config/themes"
import { useState } from "react"
import { PostsTable } from "./PostsTable"
import { useRedditStore } from "@/lib/store"
import { ChevronDown, ChevronRight, FileText, Hash, Layers, MessageCircle, Tag, TrendingUp } from "lucide-react"

interface ThemeCardsProps {
  categories: ThemeCategory[]
}

export function ThemeCards({ categories }: ThemeCardsProps) {
  const [selectedCategory, setSelectedCategory] = useState<ThemeCategory | null>(null)
  const setSelectedPost = useRedditStore((state) => state.setSelectedPost)

  // Array of icons to use for categories
  const categoryIcons = [
    <TrendingUp className="h-5 w-5 text-orange-500" key="trending" />,
    <MessageCircle className="h-5 w-5 text-blue-500" key="message" />,
    <FileText className="h-5 w-5 text-green-500" key="file" />,
    <Tag className="h-5 w-5 text-purple-500" key="tag" />,
    <Layers className="h-5 w-5 text-red-500" key="layers" />,
    <Hash className="h-5 w-5 text-yellow-500" key="hash" />,
  ]

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category, index) => (
          <Card
            key={category.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedCategory?.id === category.id
                ? "border-2 border-orange-500 bg-orange-50 dark:bg-orange-950/20"
                : "hover:border-orange-200 hover:bg-slate-50 dark:hover:border-orange-800 dark:hover:bg-slate-900/50"
            }`}
            onClick={() => setSelectedCategory(selectedCategory?.id === category.id ? null : category)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {categoryIcons[index % categoryIcons.length]}
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                </div>
                {selectedCategory?.id === category.id ? (
                  <ChevronDown className="h-4 w-4 text-orange-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-sm text-muted-foreground">{category.description}</p>
              <div className="flex items-center justify-between">
                <Badge
                  variant="secondary"
                  className="bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-300"
                >
                  {category.count} posts
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {Math.round((category.count / categories.reduce((sum, cat) => sum + cat.count, 0)) * 100)}% of total
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedCategory && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300 ease-in-out">
          <div className="mb-4 flex items-center gap-2">
            <div className="h-1 w-6 rounded-full bg-orange-500"></div>
            <h3 className="text-xl font-semibold">{selectedCategory.name} Posts</h3>
            <Badge variant="outline" className="ml-2">
              {selectedCategory.posts.length} posts
            </Badge>
          </div>

          {selectedCategory.posts.length > 0 ? (
            <PostsTable posts={selectedCategory.posts} onRowClick={(post) => setSelectedPost(post)} />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-12 text-center">
              <FileText className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-lg font-medium">No posts in this category</p>
              <p className="text-sm text-muted-foreground">Try selecting a different category.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
