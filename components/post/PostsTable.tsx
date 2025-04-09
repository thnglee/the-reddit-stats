import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RedditPost } from "@/lib/reddit";
import { formatDistanceToNow } from "date-fns";

interface PostsTableProps {
  posts: RedditPost[];
  onRowClick: (post: RedditPost) => void;
}

type SortField = "score" | "numComments" | "createdAt";
type SortOrder = "asc" | "desc";

export function PostsTable({ posts, onRowClick }: PostsTableProps) {
  const [sortField, setSortField] = useState<SortField>("score");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const sortedPosts = [...posts].sort((a, b) => {
    if (sortField === "createdAt") {
      const aDate = a[sortField] as Date;
      const bDate = b[sortField] as Date;
      return sortOrder === "asc"
        ? aDate.getTime() - bDate.getTime()
        : bDate.getTime() - aDate.getTime();
    }

    const aValue = a[sortField] as number;
    const bValue = b[sortField] as number;
    return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
  });

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50%]">Title</TableHead>
            <TableHead
              className="w-[15%] cursor-pointer text-right"
              onClick={() => handleSort("score")}
            >
              Score {sortField === "score" && (sortOrder === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead
              className="w-[15%] cursor-pointer text-right"
              onClick={() => handleSort("numComments")}
            >
              Comments {sortField === "numComments" && (sortOrder === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead
              className="w-[20%] cursor-pointer text-right"
              onClick={() => handleSort("createdAt")}
            >
              Posted {sortField === "createdAt" && (sortOrder === "asc" ? "↑" : "↓")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedPosts.map((post, index) => (
            <TableRow
              key={index}
              className="cursor-pointer hover:bg-accent"
              onClick={() => onRowClick(post)}
            >
              <TableCell className="font-medium max-w-[400px] truncate">
                {post.title}
              </TableCell>
              <TableCell className="text-right">{post.score}</TableCell>
              <TableCell className="text-right">{post.numComments}</TableCell>
              <TableCell className="text-right">
                {formatDistanceToNow(post.createdAt, { addSuffix: true })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 