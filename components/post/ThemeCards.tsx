import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RedditPost } from "@/lib/types/reddit";
import { ThemeCategory } from "@/lib/config/themes";
import { useState } from "react";
import { PostsTable } from "./PostsTable";
import { useRedditStore } from "@/lib/store";

interface ThemeCardsProps {
  categories: ThemeCategory[];
}

export function ThemeCards({ categories }: ThemeCardsProps) {
  const [selectedCategory, setSelectedCategory] = useState<ThemeCategory | null>(null);
  const setSelectedPost = useRedditStore((state) => state.setSelectedPost);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((category) => (
          <Card
            key={category.id}
            className={`hover:bg-accent transition-colors cursor-pointer ${
              selectedCategory?.id === category.id ? 'border-primary' : ''
            }`}
            onClick={() => setSelectedCategory(
              selectedCategory?.id === category.id ? null : category
            )}
          >
            <CardHeader>
              <CardTitle className="text-lg">{category.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">{category.description}</p>
              <Badge variant="secondary">{category.count} posts</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedCategory && (
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-xl font-semibold mb-4">{selectedCategory.name} Posts</h3>
          {selectedCategory.posts.length > 0 ? (
            <PostsTable
              posts={selectedCategory.posts}
              onRowClick={(post) => setSelectedPost(post)}
            />
          ) : (
            <p className="text-muted-foreground">No posts in this category.</p>
          )}
        </div>
      )}
    </div>
  );
} 