import Link from "next/link";
import { ArrowRight, GitBranch, Cpu } from "lucide-react";
import { redirect } from "next/navigation";

export default function HeroPage() {
  return (
    <section className="min-h-[90vh] flex items-center">
      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <div className="space-y-8">
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-medium border border-blue-100">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <div className="text-sm">
              Now supporting Gemini 3.1 Pro, GPT-5.2 High Reasoning, Claude 4.6
              Opus, and Qwen 3 Max
            </div>
          </div>

          <div className="flex flex-col">
            {/* Line 1: Standard Foreground Color */}
            <h1 className="text-6xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[0.85]">
              One Prompt.
            </h1>
            {/* Line 2: Contrasting Gradient & Glass Effect */}
            <h1 className="text-6xl md:text-6xl font-extrabold tracking-tight leading-[0.85] relative">
              {/* Option A: Gradient Text (Cleanest) */}
              <span className="glass-highlight text-foreground/30 bg-yellow-400/90 bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                Infinite Paths.
              </span>
            </h1>
          </div>

          <p className="text-lg text-slate-600 max-w-lg">
            Spreed is the omni-model workspace. Ask GPT-4 a question, follow up
            with Claude, and branch the conversation with Llama. Don&apos;t let
            a single model limit your thinking.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => {
                redirect("/chat");
              }}
              className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-lg font-medium hover:bg-slate-800 transition-colors"
            >
              Try Spreed Now <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-8 border-t border-slate-100 grid grid-cols-2 gap-6">
            <div className="flex gap-3 items-start">
              <GitBranch className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-bold">Branching Logic</h3>
                <p className="text-sm text-slate-500">
                  Explore multiple ideas from a single response.
                </p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <Cpu className="w-6 h-6 text-purple-600 mt-1" />
              <div>
                <h3 className="font-bold">Model Hot-Swap</h3>
                <p className="text-sm text-slate-500">
                  Switch providers mid-conversation seamlessly.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Visual */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-purple-100 rounded-3xl -rotate-2 scale-95 -z-10" />
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-8 min-h-[500px] flex flex-col">
            {/* Mock Chat Interface */}
            <div className="flex items-center gap-3 mb-6 border-b pb-4">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <div className="ml-auto text-xs text-slate-400">
                spreedsheet-alpha
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg rounded-tl-none border border-slate-100 text-sm text-primary dark:text-secondary">
                <strong>User:</strong> Write a python function to scrape a
                website.
              </div>
              <div className="flex gap-2">
                <div className="w-1/2 bg-blue-50 p-4 rounded-lg border border-blue-100 text-xs text-slate-700">
                  <span className="text-blue-600 font-bold text-[10px] uppercase mb-1 block">
                    GPT-4
                  </span>
                  Here is a script using BeautifulSoup...
                </div>
                <div className="w-1/2 bg-purple-50 p-4 rounded-lg border border-purple-100 text-xs text-slate-700">
                  <span className="text-purple-600 font-bold text-[10px] uppercase mb-1 block">
                    Claude 3.5 Sonnet
                  </span>
                  I recommend using Scrapy for scale...
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
