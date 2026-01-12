import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Navbar() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="px-4 lg:px-6 h-14 flex items-center border-b">
      <Link
        className="flex items-center justify-center font-bold text-xl"
        href="/"
      >
        EasyBooking
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6">
        {user ? (
          <>
            <Link
              className="text-sm font-medium hover:underline underline-offset-4"
              href="/dashboard"
            >
              Dashboard
            </Link>
            <Link
              className="text-sm font-medium hover:underline underline-offset-4"
              href="/logout"
            >
              Logout
            </Link>
          </>
        ) : (
          <>
            <Link
              className="text-sm font-medium hover:underline underline-offset-4"
              href="/login"
            >
              Login
            </Link>
            <Link
              className="text-sm font-medium hover:underline underline-offset-4"
              href="/signup"
            >
              Sign Up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
