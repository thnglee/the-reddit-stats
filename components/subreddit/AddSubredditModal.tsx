"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addSubreddit } from "@/data/subreddits"
import { AlertCircle, Plus, RssIcon as Reddit } from "lucide-react"

interface AddSubredditModalProps {
  onAddSubreddit: (subreddit: { name: string; displayName: string; description?: string }) => void
}

export function AddSubredditModal({ onAddSubreddit }: AddSubredditModalProps) {
  const [subredditName, setSubredditName] = useState("")
  const [description, setDescription] = useState("")
  const [open, setOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!subredditName.trim()) return

    const newSubreddit = addSubreddit(subredditName.trim(), description.trim() || undefined)
    onAddSubreddit(newSubreddit)
    setSubredditName("")
    setDescription("")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-orange-500 text-white hover:bg-orange-600">
          <Plus className="h-4 w-4" />
          Add Subreddit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Reddit className="h-5 w-5 text-orange-500" />
            <DialogTitle>Add a Subreddit</DialogTitle>
          </div>
          <DialogDescription>
            Enter the name and description of the subreddit you want to track and analyze.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Subreddit Name
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">r/</span>
                <Input
                  id="name"
                  value={subredditName}
                  onChange={(e) => setSubredditName(e.target.value)}
                  placeholder="e.g., openai"
                  className="pl-8"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">Enter the name without the "r/" prefix</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description (Optional)
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Discussions about OpenAI and its products"
              />
            </div>
            <div className="rounded-lg bg-orange-50 p-3 dark:bg-orange-950/20">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <div className="text-sm">
                  <p className="font-medium text-orange-800 dark:text-orange-300">Important</p>
                  <p className="text-orange-700/80 dark:text-orange-300/80">
                    Make sure the subreddit exists and is publicly accessible.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-orange-200 hover:bg-orange-50 hover:text-orange-600 dark:border-orange-900 dark:hover:bg-orange-950/20"
            >
              Cancel
            </Button>
            <Button type="submit" className="gap-2 bg-orange-500 text-white hover:bg-orange-600">
              <Plus className="h-4 w-4" />
              Add Subreddit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
