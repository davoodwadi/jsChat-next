import Link from "next/link";
import { ArrowRight, GitBranch, Cpu, User, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function HeroPage() {
  return (
    <section className="min-h-[90vh] flex items-center text-foreground py-8 lg:py-12 overflow-x-hidden w-full">
      <div className="container mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full max-w-full">
        {/* Left Content */}
        <div className="space-y-8 min-w-0">
          <Badge
            variant="secondary"
            className="px-3 py-1.5 text-sm font-medium border-spreed-blue/20 bg-spreed-blue/5 text-spreed-blue hover:bg-spreed-blue/10 transition-colors dark:bg-spreed-blue/10 dark:text-spreed-blue-dark h-auto whitespace-normal text-left flex items-start gap-2 w-full max-w-full"
          >
            <span className="relative flex h-2 w-2 shrink-0 mt-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-spreed-blue/40 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-spreed-blue"></span>
            </span>
            <span className="flex-1 min-w-0 break-words">
              Now supporting Gemini 3.1 Pro, GPT-5.2 High Reasoning, Claude 4.6
              Opus, and Qwen 3 Max
            </span>
          </Badge>

          <div className="flex flex-col">
            {/* Line 1: Standard Foreground Color */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-none">
              One Interface.
            </h1>
            {/* Line 2: Contrasting Gradient & Glass Effect */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-none relative mt-2">
              <span className="glass-morphic-text">All Models.</span>
            </h1>
          </div>

          <p className="text-base sm:text-lg text-muted-foreground max-w-lg">
            Spreed is an omni-model workspace that lets you compare models
            side-by-side. Spawn multiple conversation branches from a single
            prompt, evaluate responses from GPT-5.2, Gemini 3.1 Pro, Grok 4.1,
            and Claude, and continue down the path that works best for you.
            Don&apos;t let a single model limit your workflow.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/chat">
              <Button size="lg" className="gap-2">
                Try Spreed Now <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="pt-8 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="border-none shadow-none bg-transparent">
              <CardContent className="p-0 flex gap-3 items-start">
                <GitBranch className="w-6 h-6 text-spreed-blue mt-1" />
                <div>
                  <h3 className="font-bold">Branching Logic</h3>
                  <p className="text-sm text-muted-foreground">
                    Explore multiple ideas from a single response.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-none bg-transparent">
              <CardContent className="p-0 flex gap-3 items-start">
                <Cpu className="w-6 h-6 text-spreed-yellow mt-1" />
                <div>
                  <h3 className="font-bold">Model Hot-Swap</h3>
                  <p className="text-sm text-muted-foreground">
                    Switch providers mid-conversation seamlessly.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Visual */}
        <div className="relative min-w-0 w-full max-w-full">
          <div className="absolute inset-0 bg-gradient-to-tr from-spreed-blue/20 to-spreed-yellow/20 rounded-3xl -rotate-2 scale-95 -z-10 dark:from-spreed-blue/10 dark:to-spreed-yellow/10" />
          <Card className="glass min-h-[400px] lg:min-h-[500px] flex flex-col overflow-hidden shadow-2xl w-full max-w-full">
            {/* Mock Chat Interface */}
            <CardHeader className="border-b border-white/10 dark:border-white/5 px-6 py-4 flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-foreground/10 transition-all duration-500 hover:bg-spreed-blue/40 hover:shadow-[0_0_12px_rgba(31,159,255,0.4)] cursor-pointer" />
                <div className="w-3 h-3 rounded-full bg-foreground/10 transition-all duration-500 hover:bg-spreed-yellow/40 hover:shadow-[0_0_12px_rgba(255,192,80,0.4)] cursor-pointer" />
                <div className="w-3 h-3 rounded-full bg-foreground/10 transition-all duration-500 hover:bg-spreed-blue/40 hover:shadow-[0_0_12px_rgba(31,159,255,0.4)] cursor-pointer" />
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                spreedsheet
              </div>
            </CardHeader>

            <CardContent className="flex-1 p-0 relative">
              <ScrollArea className="h-[350px] lg:h-[450px] p-4 w-full">
                <div className="flex gap-2 min-w-[350px] overflow-x-auto pb-2 px-2 origin-top-left transform scale-[0.85] sm:scale-100 w-[118%] sm:w-full">
                  {/* Branch 1 */}
                  <div className="w-[160px] shrink-0 space-y-3">
                    {/* User Prompt */}
                    <div className="flex flex-col p-3 m-0.5 rounded-xl glass-subtle text-[11px] shadow-sm">
                      <div className="text-[10px] text-muted-foreground mb-1 font-medium">
                        User
                      </div>
                      <div className="text-foreground/90">
                        Write a python function to scrape a website.
                      </div>
                    </div>
                    {/* AI Response 1 */}
                    <div className="p-3 m-0.5 relative rounded-xl glass shadow-md">
                      <div className="flex flex-row justify-between text-[11px] mb-2 border-b border-border/50 pb-2">
                        <p className="text-[11px] antialiased italic font-bold text-spreed-blue drop-shadow-sm">
                          Gemini 3.1 Pro
                        </p>
                      </div>
                      <div className="text-[10px] text-foreground/80 leading-relaxed">
                        Here is a concise Python function using the{" "}
                        <code className="bg-foreground/10 px-0.5  rounded font-mono text-[8px] border border-foreground/5">
                          requests
                        </code>{" "}
                        and{" "}
                        <code className="bg-foreground/10 px-0.5  rounded font-mono text-[8px] border border-foreground/5">
                          BeautifulSoup
                        </code>{" "}
                        libraries...
                      </div>
                    </div>
                    {/* Next Input */}
                    <div className="flex flex-col p-2 m-0.5 rounded-xl glass-subtle opacity-80 text-[9px] text-muted-foreground border-dashed border-2 hover:opacity-100 transition-opacity cursor-text">
                      <div className="flex justify-between items-center w-full">
                        <span className="pl-1 truncate">
                          Type your message...
                        </span>
                        <Badge
                          variant="secondary"
                          className="text-[9px] scale-90 -mr-1 px-2 h-5 bg-background/50 backdrop-blur-sm"
                        >
                          Grok 4.1
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Branch 2 */}
                  <div className="flex-1 min-w-[220px] space-y-3">
                    {/* User Prompt */}
                    <div className="flex flex-col p-3 m-0.5 rounded-xl glass-subtle text-[11px] shadow-sm">
                      <div className="text-[10px] text-muted-foreground mb-1 font-medium">
                        User
                      </div>
                      <div className="text-foreground/90">
                        Write a python function to scrape a website.
                      </div>
                    </div>
                    {/* AI Response 2 */}
                    <div className="p-3 m-0.5 relative rounded-xl glass shadow-md">
                      <div className="flex flex-row justify-between text-[11px] mb-2 border-b border-border/50 pb-2">
                        <p className="text-[11px] antialiased italic font-bold text-emerald-500 drop-shadow-sm">
                          GPT-5.2
                        </p>
                      </div>
                      <div className="overflow-hidden rounded-lg border border-foreground/10 bg-foreground/5 p-2 font-mono text-[10px] text-foreground/80 shadow-inner">
                        <pre className="m-0 overflow-x-auto bg-transparent p-0 leading-relaxed">
                          <code>{`import requests
from bs4 import BeautifulSoup

def scrape(url: str):
    # Fetch page...`}</code>
                        </pre>
                      </div>
                    </div>
                    {/* Next Input */}
                    <div className="flex flex-col p-2.5 m-0.5 rounded-xl glass-subtle opacity-80 text-[10px] text-muted-foreground border-dashed border-2 hover:opacity-100 transition-opacity cursor-text">
                      <div className="flex justify-between items-center w-full">
                        <span className="pl-1">Type your message...</span>
                        <Badge
                          variant="secondary"
                          className="text-[9px] scale-90 -mr-1 px-2 h-5 bg-background/50 backdrop-blur-sm"
                        >
                          Claude Opus 4.6
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
