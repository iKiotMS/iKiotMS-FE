"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/lib/api/auth";
import { Loader2, KeyRound, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setErrorMessage("Liên kết không hợp lệ. Vui lòng kiểm tra lại đường dẫn trong email.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("Mật khẩu mới phải chứa ít nhất 6 ký tự.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Xác nhận mật khẩu mới không khớp.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      await resetPassword({
        token,
        newPassword,
        confirmPassword,
      });
      setSuccess(true);
      setTimeout(() => {
        router.push("/sign-in");
      }, 2500);
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || err?.message || "Đặt lại mật khẩu thất bại. Token có thể đã hết hạn."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={cn("flex flex-col items-center gap-6 text-center", className)}>
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Đặt lại mật khẩu thành công!</h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
            Mật khẩu của bạn đã được cập nhật thành công. Hệ thống đang tự động chuyển hướng đến trang đăng nhập...
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/sign-in"
            className="text-sm font-medium text-primary hover:underline underline-offset-4"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className={cn("flex flex-col items-center gap-6 text-center", className)}>
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
          <KeyRound className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Liên kết không hợp lệ</h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
            Không tìm thấy mã xác thực (token) trên đường dẫn. Vui lòng sử dụng liên kết trong email gửi tới bạn hoặc gửi lại yêu cầu mới.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-primary hover:underline underline-offset-4"
          >
            Yêu cầu lại liên kết mới
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Đặt lại mật khẩu</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Nhập mật khẩu mới của bạn bên dưới để hoàn tất thay đổi.
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive text-center font-medium">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="newPassword">Mật khẩu mới</Label>
          <Input
            id="newPassword"
            type="password"
            placeholder="Tối thiểu 6 ký tự"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="grid gap-3">
          <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Nhập lại mật khẩu mới"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang lưu mật khẩu mới...
            </>
          ) : (
            "Cập nhật mật khẩu"
          )}
        </Button>
      </div>

      <div className="text-center text-sm">
        <Link href="/sign-in" className="underline underline-offset-4 font-medium hover:text-primary">
          Quay lại trang đăng nhập
        </Link>
      </div>
    </form>
  );
}
