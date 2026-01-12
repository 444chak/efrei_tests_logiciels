import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // if (user) {
  //   redirect("/dashboard");
  // }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <Link
          className="flex items-center justify-center font-bold text-xl"
          href="#"
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
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gray-50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Book Your Perfect Room
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  EasyBooking makes it simple to find and reserve rooms for your
                  meetings, events, or stays.
                </p>
              </div>
              <div className="space-x-4">
                {user ? (
                  <Link href="/dashboard">
                    <Button size="lg">Get Started</Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/signup">
                      <Button size="lg">Get Started</Button>
                    </Link>
                    <Link href="/login">
                      <Button variant="outline" size="lg">
                        Log In
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-10 sm:px-10 md:gap-16 md:grid-cols-2">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm">
                  Simple
                </div>
                <h2 className="lg:leading-tighter text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl xl:text-[3.4rem] 2xl:text-[3.75rem]">
                  Booking made easy.
                </h2>
                <Link
                  className="inline-flex h-9 items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50"
                  href="/signup"
                >
                  Create an account
                </Link>
              </div>
              <div className="flex flex-col items-start space-y-4">
                <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm">
                  Fast
                </div>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed">
                  Our platform is designed to be fast and efficient. Find what
                  you need in seconds.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2024 EasyBooking. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
