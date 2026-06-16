import { Skeleton } from "@/components/ui/skeleton";

export default function SubscriptionsLoading() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  );
}
