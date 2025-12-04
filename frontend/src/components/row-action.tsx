import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { IconDotsVertical } from "@tabler/icons-react"
import DetailModal from "@/components/detail-model"
import { z } from "zod"
import { schema } from "./data-table"

type Personal = z.infer<typeof schema>

interface RowActionsProps {
  row: Personal
}

export default function RowActions({ row }: RowActionsProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <IconDotsVertical />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-36">
          <DropdownMenuItem onClick={() => setOpen(true)}>
            Xem chi tiết
          </DropdownMenuItem>

          <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem className="text-red-500">
            Xóa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DetailModal open={open} onOpenChange={setOpen} data={row} />
    </>
  )
}
