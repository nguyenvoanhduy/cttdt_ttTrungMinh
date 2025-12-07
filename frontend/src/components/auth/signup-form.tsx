/* eslint-disable @typescript-eslint/no-unused-vars */
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Field,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {z} from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const signupSchema = z.object({
  fullname: z.string().min(1, "Họ và tên là bắt buộc phải nhập"),
  phonenumber: z.string().min(1, "Số điện thoại là bắt buộc phải nhập"),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
  confirmPassword: z.string().min(8, "Vui lòng nhập lại mật khẩu"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu nhập lại không khớp",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export function SignupForm({ className, ...props }: React.ComponentProps<"div">) {

  const { register, formState: { errors, isSubmitting } } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="w-full max-w-xl mx-auto shadow-md bg-white rounded-xl">
        <CardHeader className="text-center text-2xl md:text-3xl">
          <CardTitle>Tạo tài khoản</CardTitle>
          <CardDescription>Nhập số điện thoại của bạn bên dưới để tạo tài khoản</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <Field>
              <FieldLabel htmlFor="fullname">Họ và tên</FieldLabel>
              <Input id="fullname" type="text" {...register("fullname")}/>
              {errors.fullname && <p className="text-sm text-red-600 mt-1">{errors.fullname.message}</p>}
            </Field>

            <Field>
              <FieldLabel htmlFor="phonenumber">Số điện thoại</FieldLabel>
              <Input id="phonenumber" type="text" {...register("phonenumber")}/>
              {errors.phonenumber && <p className="text-sm text-red-600 mt-1">{errors.phonenumber.message}</p>}
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
                <Input id="password" type="password" {...register("password")}/>
                {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>}
              </Field>
              <Field>
                <FieldLabel htmlFor="confirmpassword">Nhập lại mật khẩu</FieldLabel>
                <Input id="confirmpassword" type="password" {...register("confirmPassword")}/>
                {errors.confirmPassword && <p className="text-sm text-red-600 mt-1">{errors.confirmPassword.message}</p>}
              </Field>
            </div>
            <div className="flex flex-col gap-4">
              <Button type="submit" disabled={isSubmitting}>Tạo tài khoản</Button>
              <Button type="button">
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google logo"
                  className="w-5 h-5"/>
                <span>Đăng nhập bằng Google</span>
              </Button>
              
            </div>

            <FieldDescription className="text-center">
              Bạn đã có tài khoản? <a href="/signin" className="underline">Đăng nhập</a>
            </FieldDescription>
          </form>
        </CardContent>
      </Card>

      <FieldDescription className="text-center text-sm text-muted-foreground px-6">
        Bằng cách nhấp vào tiếp tục, bạn đồng ý với chúng tôi <a href="#" className="underline">Terms of Service</a> và <a href="#" className="underline">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}