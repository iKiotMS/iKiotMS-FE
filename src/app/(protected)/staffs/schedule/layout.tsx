import { ScheduleDetailPanel } from "./components/schedule-detail-panel";
import { ScheduleDialogs } from "./components/schedule-dialogs";
import { ScheduleProvider } from "./components/schedule-provider";

export default function ScheduleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ScheduleProvider>
      {children}
      <ScheduleDetailPanel />
      <ScheduleDialogs />
    </ScheduleProvider>
  );
}
