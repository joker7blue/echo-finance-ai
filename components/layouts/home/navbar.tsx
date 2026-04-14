"use client";
import { AILoadingIcon } from "@/components/icons/AILoadingIcon";
import { Button } from "@/components/ui/button";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
// import { TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

export const Navbar = () => {
  const router = useRouter();
  const { isSignedIn } = useUser();

  return (
    <header className="border-b border-zinc-800">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* <TrendingUp className="w-6 h-6 text-emerald-500" /> */}
          <AILoadingIcon className="w-6 h-6 animate-pulse text-emerald-500" />

          <span className="text-xl font-bold">Echo Finance AI</span>
        </div>

        <div className="flex items-center gap-4">
          {isSignedIn ? (
            <>
              <Button
                onClick={() => router.push("/dashboard")}
                variant="ghost"
                className="text-zinc-400 hover:text-white"
              >
                Dashboard
              </Button>
              <UserButton />
            </>
          ) : (
            <SignInButton mode="modal">
              <Button variant="outline" className="border-zinc-700">
                Sign In
              </Button>
            </SignInButton>
          )}
        </div>
      </nav>
    </header>
  );
};
