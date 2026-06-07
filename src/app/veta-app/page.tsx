import { redirect } from "next/navigation";
import { appPath } from "@/lib/app-paths";

export default function VetaAppIndexPage() {
  redirect(appPath("/dashboard"));
}
