import { cookies } from "next/headers";

import { SidebarProvider } from "@/components/ui/sidebar";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { MultilineGlassSkeleton } from "../ui/glassSkeleton";
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
          className={` flex flex-col min-h-screen overflow-y-auto mx-auto w-full `} //
        >
          <div className=" h-12 flex flex-row justify-between items-center">
            <SidebarTrigger className="content-center items-center fixed top-2  z-50" />
            <div className="flex flex-row  justify-end fixed  top-2 right-2 z-50">
              <Suspense
                fallback={
                  <div className="w-3/4 mx-auto">
                    <MultilineGlassSkeleton lines={1} />
                  </div>
                }
              >
                <AuthButton className="mx-1" />
              </Suspense>

              <TopupButton />
              <ThemeToggle className="mx-1  glass-button !rounded-full w-10 h-10 p-0" />
            </div>
          </div>

          {children}
          <footer className="flex text-muted-foreground gap-2 p-6 pt-24 flex-wrap items-center justify-center mt-auto text-xs md:text-sm">
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
