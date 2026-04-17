import { redirect } from "next/navigation";

export default function RootPage() {
  // Middleware sends unauthed users to /login; authed users land on /dashboard.
  redirect("/dashboard");
}
