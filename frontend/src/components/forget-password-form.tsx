import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export function ForgetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="w-100">
        <CardHeader className="text-center text-2xl md:text-3xl">
          <CardTitle>Đặt lại mật khẩu</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                className="mt-1 "
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Button type="submit" className="w-full">
                Tiếp theo
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>    
  )
}