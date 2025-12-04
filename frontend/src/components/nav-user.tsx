import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent cursor-pointer transition-colors">
      <Avatar className="h-9 w-9 rounded-lg grayscale">
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback className="rounded-lg">
          {user.name?.charAt(0) || "U"}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col leading-tight">
        <span className="truncate font-medium text-sm">{user.name}</span>
        <span className="text-muted-foreground truncate text-xs">
          {user.email}
        </span>
      </div>
    </div>
  )
}
