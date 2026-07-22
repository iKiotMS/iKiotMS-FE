"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetPassword,
} from "@/lib/api/auth";
import { Loader2, CheckCircle2, KeyRound } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

// Skip SMS OTP step in local dev if configured
const OTP_BYPASS = process.env.NEXT_PUBLIC_OTP_BYPASS === "true";

export function ForgotPasswordForm2({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // STEP 1: Send OTP to Phone Number
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0) return;
    if (!phoneNumber || phoneNumber.trim().length < 9) {
      toast.error("Vui lòng nhập số điện thoại hợp lệ.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      if (OTP_BYPASS) {
        // In dev bypass, skip directly to Step 2 with sentinel OTP or verify directly
        const res = await verifyForgotPasswordOtp(
          phoneNumber.trim(),
          "DEV_BYPASS",
        );
        setResetToken(res.resetToken);
        setStep(3);
        toast.success(
          "Bỏ qua OTP trong môi trường Dev, sang bước đặt lại mật khẩu.",
        );
        return;
      }

      await sendForgotPasswordOtp(phoneNumber.trim());
      setStep(2);
      setOtpCode("");
      setCooldown(90);
      toast.success(`Đã gửi mã OTP đến số ${phoneNumber}.`);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể gửi mã OTP. Vui lòng kiểm tra lại số điện thoại.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.trim().length < 6) {
      toast.error("Vui lòng nhập đủ 6 chữ số mã OTP.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const res = await verifyForgotPasswordOtp(
        phoneNumber.trim(),
        otpCode.trim(),
      );
      setResetToken(res.resetToken);
      setStep(3);
      toast.success("Xác thực OTP thành công. Vui lòng nhập mật khẩu mới.");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Mã OTP không chính xác hoặc đã hết hạn.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP with 90s countdown
  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setIsSendingOtp(true);
    setErrorMessage("");
    try {
      await sendForgotPasswordOtp(phoneNumber.trim());
      setOtpCode("");
      setCooldown(90);
      toast.success(`Đã gửi lại mã OTP đến ${phoneNumber}.`);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể gửi lại mã OTP.";
      toast.error(msg);
    } finally {
      setIsSendingOtp(false);
    }
  };

  // STEP 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      await resetPassword({
        resetToken,
        token: resetToken,
        newPassword,
        confirmPassword,
      });

      setSuccess(true);
      toast.success("Đặt lại mật khẩu thành công!");
      setTimeout(() => {
        router.push("/sign-in");
      }, 2000);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Đặt lại mật khẩu thất bại. Vui lòng thử lại.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // SUCCESS SCREEN
  if (success) {
    return (
      <div
        className={cn(
          "flex flex-col items-center gap-6 text-center",
          className,
        )}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Đặt lại mật khẩu thành công!</h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
            Mật khẩu của bạn đã được thay đổi. Đang tự động chuyển hướng đến
            trang đăng nhập...
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

  // STEP 2 FORM: OTP Verification
  if (step === 2) {
    return (
      <form
        onSubmit={handleVerifyOtp}
        className={cn("flex flex-col gap-6", className)}
        {...props}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Xác thực mã OTP</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Nhập mã OTP gồm 6 chữ số đã gửi đến{" "}
            <span className="font-medium text-foreground">{phoneNumber}</span>
          </p>
        </div>

        {errorMessage && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive text-center font-medium">
            {errorMessage}
          </div>
        )}

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="otpCode">Mã OTP</Label>
            <Input
              id="otpCode"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              className="text-center text-xl tracking-[0.5em] font-mono"
              value={otpCode}
              onChange={(e) =>
                setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              disabled={loading}
              autoFocus
            />
          </div>

          <Button
            type="submit"
            className="w-full cursor-pointer"
            disabled={loading || otpCode.length < 6}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xác thực...
              </>
            ) : (
              "Xác thực mã OTP"
            )}
          </Button>
        </div>

        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={() => {
              setStep(1);
              setErrorMessage("");
            }}
            disabled={loading}
            className="underline underline-offset-4 hover:text-primary disabled:opacity-50"
          >
            Quay lại
          </button>
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={cooldown > 0 || isSendingOtp || loading}
            className="underline underline-offset-4 hover:text-primary disabled:opacity-50"
          >
            {isSendingOtp
              ? "Đang gửi lại..."
              : cooldown > 0
                ? `Gửi lại mã (${cooldown}s)`
                : "Gửi lại mã OTP"}
          </button>
        </div>
      </form>
    );
  }

  // STEP 3 FORM: Enter New Password
  if (step === 3) {
    return (
      <form
        onSubmit={handleResetPassword}
        className={cn("flex flex-col gap-6", className)}
        {...props}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-1">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold">Đặt mật khẩu mới</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Tài khoản cho số{" "}
            <span className="font-medium text-foreground">{phoneNumber}</span>
          </p>
        </div>

        {errorMessage && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive text-center font-medium">
            {errorMessage}
          </div>
        )}

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="newPassword">Mật khẩu mới</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Tối thiểu 6 ký tự"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="grid gap-2">
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

          <Button
            type="submit"
            className="w-full cursor-pointer mt-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang lưu mật khẩu...
              </>
            ) : (
              "Hoàn tất đặt lại mật khẩu"
            )}
          </Button>
        </div>
      </form>
    );
  }

  // STEP 1 FORM: Phone Number Input
  return (
    <form
      onSubmit={handleSendOtp}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Quên mật khẩu?</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Nhập số điện thoại đã đăng ký tài khoản của bạn để nhận mã xác thực
          OTP qua SMS.
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive text-center font-medium">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="phoneNumber">Số điện thoại đăng nhập</Label>
          <Input
            id="phoneNumber"
            type="tel"
            placeholder="0912345678"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
            disabled={loading}
            autoFocus
          />
        </div>

        <Button
          type="submit"
          className="w-full cursor-pointer"
          disabled={cooldown > 0 || loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang gửi mã OTP...
            </>
          ) : cooldown > 0 ? (
            `Tiếp tục & nhận mã OTP (${cooldown}s)`
          ) : (
            "Tiếp tục & nhận mã OTP"
          )}
        </Button>
      </div>

      <div className="text-center text-sm">
        Đã nhớ mật khẩu?{" "}
        <Link
          href="/sign-in"
          className="underline underline-offset-4 font-medium hover:text-primary"
        >
          Đăng nhập ngay
        </Link>
      </div>
    </form>
  );
}
