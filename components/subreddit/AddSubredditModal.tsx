import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addSubreddit } from "@/data/subreddits";

interface AddSubredditModalProps {
  onAddSubreddit: (subreddit: { name: string; displayName: string; description?: string }) => void;
}

export function AddSubredditModal({ onAddSubreddit }: AddSubredditModalProps) {
  const [subredditName, setSubredditName] = useState("");
  const [description, setDescription] = useState("");
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subredditName.trim()) return;

    const newSubreddit = addSubreddit(subredditName.trim(), description.trim() || undefined);
    onAddSubreddit(newSubreddit);
    setSubredditName("");
    setDescription("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Subreddit</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a Subreddit</DialogTitle>
          <DialogDescription>
            Enter the name and description of the subreddit you want to add.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Subreddit Name</Label>
              <Input
                id="name"
                value={subredditName}
                onChange={(e) => setSubredditName(e.target.value)}
                placeholder="e.g., openai"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Discussions about OpenAI and its products"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Add Subreddit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 