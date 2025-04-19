"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { RedditPost } from "@/lib/types/reddit"
import { formatDistanceToNow } from "date-fns"
import { ArrowDown, ArrowUp, MessageSquare, Star, Clock } from "lucide-react"

interface PostsTableProps {
  posts: RedditPost[]
  onRowClick: (post: RedditPost) => void
}

type SortField = "score" | "numComments" | "created_utc"
type SortOrder = "asc" | "desc"

export function PostsTable({ posts, onRowClick }: PostsTableProps) {
  const [sortField, setSortField] = useState<SortField>("score")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  const sortedPosts = [...posts].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]
    return sortOrder === "asc" ? Number(aValue) - Number(bValue) : Number(bValue) - Number(aValue)
  })

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("desc")
    }
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[50%] font-medium">Title</TableHead>
              <TableHead
                className="w-[15%] cursor-pointer font-medium text-right hover:text-orange-500"
                onClick={() => handleSort("score")}
              >
                <div className="flex items-center justify-end gap-1">
                  <Star className="h-4 w-4" />
                  <span>Score</span>
                  {sortField === "score" && (
                    <span className="ml-1">
                      {sortOrder === "asc" ? (
                        <ArrowUp className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowDown className="h-3.5 w-3.5" />
                      )}
                    </span>
                  )}
                </div>
              </TableHead>
              <TableHead
                className="w-[15%] cursor-pointer font-medium text-right hover:text-orange-500"
                onClick={() => handleSort("numComments")}
              >
                <div className="flex items-center justify-end gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>Comments</span>
                  {sortField === "numComments" && (
                    <span className="ml-1">
                      {sortOrder === "asc" ? (
                        <ArrowUp className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowDown className="h-3.5 w-3.5" />
                      )}
                    </span>
                  )}
                </div>
              </TableHead>
              <TableHead
                className="w-[20%] cursor-pointer font-medium text-right hover:text-orange-500"
                onClick={() => handleSort("created_utc")}
              >
                <div className="flex items-center justify-end gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Posted</span>
                  {sortField === "created_utc" && (
                    <span className="ml-1">
                      {sortOrder === "asc" ? (
                        <ArrowUp className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowDown className="h-3.5 w-3.5" />
                      )}
                    </span>
                  )}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedPosts.map((post, index) => (
              <TableRow
                key={index}
                className="cursor-pointer transition-colors hover:bg-muted/50"
                onClick={() => onRowClick(post)}
              >
                <TableCell className="max-w-[400px] py-3 font-medium">
                  <div className="line-clamp-2">{post.title}</div>
                </TableCell>
                <TableCell className="py-3 text-right">
                  <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                    {post.score.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell className="py-3 text-right">
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    {post.numComments.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell className="py-3 text-right text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(post.created_utc * 1000), { addSuffix: true })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
