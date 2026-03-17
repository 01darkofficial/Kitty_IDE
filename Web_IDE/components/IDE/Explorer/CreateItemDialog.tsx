"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/shadcn/ui/dialog"

import { Input } from "@/components/shadcn/ui/input"
import { Button } from "@/components/shadcn/ui/button"
import { Label } from "@/components/shadcn/ui/label"

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    type: "file" | "folder"
    onCreate: (name: string) => void
}

export default function CreateItemDialog({
    open,
    onOpenChange,
    type,
    onCreate,
}: Props) {
    const [name, setName] = useState("")

    const handleCreate = () => {
        if (!name.trim()) return

        onCreate(name.trim())
        setName("")
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-zinc-900">

                <DialogHeader>
                    <DialogTitle>
                        Create new {type}
                    </DialogTitle>
                    <DialogDescription>
                        Enter a name for the {type}.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-2">
                    <Label>Name</Label>

                    <Input
                        placeholder={type === "file" ? "example.js" : "new-folder"}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>

                    <Button onClick={handleCreate}>
                        Create
                    </Button>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    )
}