import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {z} from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const signInSchema = z.object({
  phonenumber: z.string().min(1, "Số điện thoại là bắt buộc phải nhập"),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
});

type SignInFormData = z.infer<typeof signInSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });
    

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center text-2xl md:text-3xl">
          <CardTitle>Đăng nhập</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="phonenumber" className="text-sm font-medium">
                Số điện thoại
              </label>
              <Input
                id="phonenumber"
                className="mt-1"
                type="text"
                {...register("phonenumber")}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <label htmlFor="password" className="text-sm font-medium">
                  Mật khẩu
                </label>
                <a
                  href="/forget-password"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Quên mật khẩu?
                </a>
              </div>
              <Input id="password" type="password" {...register("password")} />
            </div>
            <div className="space-y-2">
              <Button type="submit" className="w-full">
                Đăng nhập
              </Button>
              <Button type="button" className="w-full">
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google logo"
                  className="w-5 h-5"/>
                <span>Đăng nhập bằng Google</span>
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Chưa có tài khoản?{" "}
                <a href="/signup" className="underline underline-offset-4">
                  Đăng ký
                </a>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>    
  )
}