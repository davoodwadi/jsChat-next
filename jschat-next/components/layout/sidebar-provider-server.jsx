import { cookies } from "next/headers";

import { SidebarProvider } from "@/components/ui/sidebar";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { MultilineSkeleton } from "@/components/ui/skeleton";
import { Suspense, lazy } from "react";

const AuthButton = lazy(() => import("@/components/auth/AuthButtonsServer"));
import TopupButton from "@/components/layout/TopupButton";

export async function SidebarProviderServer({ params, children }) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";
  const today = new Date();
  // console.log("sidebar rerendered");

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <>
        <AppSidebar />
        <div
          className={` flex flex-col overflow-hidden min-h-screen mx-auto w-full `} //
        >
          <div className="fixed top-0 z-50 items-center place-items-center ">
            <SidebarTrigger className="content-center items-center" />
          </div>
          <div className="flex flex-row mt-2 mb-6 justify-end">
            <div className="flex flex-row  ">
              <Suspense
                fallback={
                  <div className="w-3/4 mx-auto">
                    <MultilineSkeleton lines={4} />
                  </div>
                }
              >
                <AuthButton className="mx-1" />
              </Suspense>

              <TopupButton />
              <ThemeToggle className="mx-1" />
            </div>
          </div>

          {children}
          <footer className="flex gap-2 p-6 flex-wrap items-center justify-center mt-auto text-xs md:text-sm">
            <p className="flex items-center gap-2">
              © {today.getFullYear()} Spreed.chat. All rights reserved.
            </p>
            <a
              className="flex items-center gap-2 hover:underline hover:underline-offset-4"
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </a>
          </footer>
        </div>
      </>
    </SidebarProvider>
  );
}
