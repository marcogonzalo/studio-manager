import { redirect } from "next/navigation";
import { appPath } from "@/lib/app-paths";

export default function ProfilePage() {
  redirect(appPath("/settings/account"));
}
