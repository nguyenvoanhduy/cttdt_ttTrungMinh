/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/immutability */
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useState } from "react";

const signInSchema = z.object({
  phonenumber: z.string().min(1, "Số điện thoại là bắt buộc phải nhập"),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
});

type SignInFormData = z.infer<typeof signInSchema>;

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const [serverError, setServerError] = useState<string | null>(null);

  const onSubmit = async (data: SignInFormData) => {
    try {
      setServerError(null);
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/signin`,
        data,
        { withCredentials: true } // gửi cookie refresh token
      );

      const { accessToken } = response.data;

      // Lưu access token (dùng localStorage hoặc state management)
      localStorage.setItem("accessToken", accessToken);

      // Redirect hoặc update UI
      console.log("Đăng nhập thành công");
      window.location.href = "/";
    } catch (error: any) {
      console.log(error.response);
      if (error.response) setServerError(error.response.data.message || "Đăng nhập thất bại");
      else setServerError("Không thể kết nối server");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center text-2xl md:text-3xl">
          <CardTitle>Đăng nhập</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <label htmlFor="phonenumber" className="text-sm font-medium">Số điện thoại</label>
              <Input id="phonenumber" type="text" {...register("phonenumber")} />
              {errors.phonenumber && <p className="text-sm text-red-500">{errors.phonenumber.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <label htmlFor="password" className="text-sm font-medium">Mật khẩu</label>
                <a href="/forget-password" className="ml-auto text-sm underline-offset-4 hover:underline">Quên mật khẩu?</a>
              </div>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>

            {serverError && <p className="text-sm text-red-500">{serverError}</p>}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Chưa có tài khoản? <a href="/signup" className="underline underline-offset-4">Đăng ký</a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
