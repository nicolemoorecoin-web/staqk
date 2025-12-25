// src/app/page.js
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../lib/auth";
import StaqksWelcome from "./components/StaqksWelcome";

export default async function Page() {
  const session = await getServerSession(authOptions);

  // If already logged in, skip welcome and go straight to dashboard
  if (session) redirect("/home");

  return <StaqksWelcome />;
}
