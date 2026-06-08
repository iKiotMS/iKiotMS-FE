"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      position="top-right"
      richColors
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      theme="light"
      style={
        {
          "--normal-bg": "var(--color-surface-container-high)",
          "--normal-text": "var(--color-on-surface)",
          "--normal-border": "var(--color-outline-variant)",
          "--normal-icon": "var(--color-on-surface)",
          "--success-bg": "#f0fdf4",
          "--success-border": "#dcfce7",
          "--success-text": "#166534",
          "--error-bg": "#fef2f2",
          "--error-border": "#fee2e2",
          "--error-text": "var(--color-error)",
          "--warning-bg": "#fffbeb",
          "--warning-border": "#fef3c7",
          "--warning-text": "#92400e",
          "--info-bg": "#f0f9ff",
          "--info-border": "#e0f2fe",
          "--info-text": "#0c4a6e",
          "--border-radius": "0.75rem",
        } as React.CSSProperties
      }
      toastOptions={{
        duration: 4000,
        classNames: {
          toast:
            "flex gap-3 items-start p-4 rounded-[0.75rem] border shadow-md font-body text-sm",
          title: "font-headline font-bold text-sm",
          description: "font-body text-xs opacity-90",
          success:
            "bg-[--success-bg] border-[--success-border] text-[--success-text]",
          error: "bg-[--error-bg] border-[--error-border] text-[--error-text]",
          warning:
            "bg-[--warning-bg] border-[--warning-border] text-[--warning-text]",
          info: "bg-[--info-bg] border-[--info-border] text-[--info-text]",
          actionButton:
            "font-headline font-bold text-xs px-3 py-1 rounded hover:opacity-80 transition-opacity",
          cancelButton:
            "font-headline font-bold text-xs px-3 py-1 rounded hover:opacity-80 transition-opacity",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
