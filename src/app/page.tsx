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
      <main className="flex-1">
        <section className="w-full bg-gray-50 py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Réservez votre salle idéale
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 dark:text-gray-400 md:text-xl">
                  EasyBooking simplifie la recherche et la réservation de salles
                  pour vos réunions et événements.
                </p>
              </div>
              <div className="space-x-4">
                {user ? (
                  <Link href="/dashboard">
                    <Button size="lg">Commencer</Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/signup">
                      <Button size="lg">Commencer</Button>
                    </Link>
                    <Link href="/login">
                      <Button variant="outline" size="lg">
                        Se connecter
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
        <section className="w-full bg-white py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-10 sm:px-10 md:grid-cols-2 md:gap-16">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm">
                  Simple
                </div>
                <h2 className="lg:leading-tighter text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl xl:text-[3.4rem] 2xl:text-[3.75rem]">
                  La réservation simplifiée.
                </h2>
                {user ? (
                  <Link
                    className="inline-flex h-9 items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50"
                    href="/dashboard"
                  >
                    Commencer
                  </Link>
                ) : (
                  <Link
                    className="inline-flex h-9 items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50"
                    href="/signup"
                  >
                    Créer un compte
                  </Link>
                )}
              </div>
              <div className="flex flex-col items-start space-y-4">
                <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm">
                  Rapide
                </div>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed">
                  Notre plateforme est conçue pour être rapide et efficace.
                  Trouvez ce dont vous avez besoin en quelques secondes.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex w-full shrink-0 flex-col items-center gap-2 border-t px-4 py-6 sm:flex-row md:px-6">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2026 EasyBooking. Tous droits réservés.
        </p>
        <nav className="flex gap-4 sm:ml-auto sm:gap-6">
          <Link className="text-xs underline-offset-4 hover:underline" href="#">
            Conditions d'utilisation
          </Link>
          <Link className="text-xs underline-offset-4 hover:underline" href="#">
            Confidentialité
          </Link>
        </nav>
      </footer>
    </div>
  );
}
