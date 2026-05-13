import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getCurrentUser } from "@/lib/auth";

// Server component: gate on auth, then serve the report HTML from /public.
export default async function Home() {
  const h = await headers();
  const req = new Request("https://example.com", {
    headers: { cookie: h.get("cookie") ?? "" }
  });
  const user = await getCurrentUser(req);
  if (!user) redirect("/login");
  // Authenticated → load the report HTML inside an iframe-style container
  return (
    <iframe
      src="/report.html"
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", border: 0 }}
      title="RC Monthly Report"
    />
  );
}
