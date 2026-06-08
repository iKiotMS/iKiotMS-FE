"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, LoginInput } from "@/lib/validation";
import { loginUser } from "@/lib/api/auth";
import { setTokens, setCachedUser } from "@/lib/auth";

export function LoginForm2({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const { accessToken, refreshToken, user } = await loginUser(data);

      if (accessToken) {
        setTokens({ accessToken, refreshToken });
        setCachedUser(user);
        toast.success("Đăng nhập thành công!");
        router.push("/dashboard");
        router.refresh();
      } else {
        throw new Error("Không nhận được mã xác thực từ hệ thống.");
      }
    } catch (error) {
      console.error("Login error:", error);
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const message =
        err.response?.data?.message ||
        err.message ||
        "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Đăng nhập tài khoản</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Nhập số điện thoại của bạn dưới đây để đăng nhập vào hệ thống
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="phone">Số điện thoại</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="Nhập số điện thoại"
            disabled={isLoading}
            {...register("phone")}
          />
          {errors.phone && (
            <p className="text-xs font-medium text-destructive">
              {errors.phone.message}
            </p>
          )}
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Mật khẩu</Label>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                toast.info("Tính năng đang được phát triển.");
              }}
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Quên mật khẩu?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            disabled={isLoading}
            placeholder="Nhập mật khẩu"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs font-medium text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>
        <Button
          type="submit"
          className="w-full cursor-pointer"
          disabled={isLoading}
        >
          {isLoading ? "Đang xử lý..." : "Đăng nhập"}
        </Button>
      </div>
      <div className="text-center text-sm">
        Chưa có tài khoản?{" "}
        <a href="/sign-up" className="underline underline-offset-4">
          Đăng ký ngay
        </a>
      </div>
    </form>
  );
}
