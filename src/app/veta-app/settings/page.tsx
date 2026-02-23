import { redirect } from "next/navigation";
import { appPath } from "@/lib/app-paths";

export default function SettingsPage() {
  redirect(appPath("/settings/account"));
}
