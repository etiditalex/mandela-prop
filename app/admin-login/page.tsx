import { redirect } from "next/navigation";

/** Staff sign-in: same form as `/login`, default redirect to the agent dashboard. */
export default function AdminLoginPage() {
  redirect("/login?next=/agent/properties");
}
