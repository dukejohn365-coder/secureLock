"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AddPasswordDialog } from "@/components/dashboard/add-password-dialog"

export function AddPasswordButton() {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)} id="overview-add-btn">
        <Plus className="size-4 mr-1.5" />
        Add Password
      </Button>
      <AddPasswordDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
