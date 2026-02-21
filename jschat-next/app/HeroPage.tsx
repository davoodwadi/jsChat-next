import Link from "next/link";
import { ArrowRight, GitBranch, Cpu, User, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function HeroPage() {
  return (
    <section className="min-h-[90vh] flex items-center  text-foreground">
      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <div className="space-y-8">
          <Badge
            variant="secondary"
            className="px-3 py-1 text-sm font-medium border-spreed-blue/20 bg-spreed-blue/5 text-spreed-blue hover:bg-spreed-blue/10 transition-colors dark:bg-spreed-blue/10 dark:text-spreed-blue-dark"
          >
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-spreed-blue/40 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-spreed-blue"></span>
            </span>
            Now supporting Gemini 3.1 Pro, GPT-5.2 High Reasoning, Claude 4.6
            Opus, and Qwen 3 Max
          </Badge>

          <div className="flex flex-col">
            {/* Line 1: Standard Foreground Color */}
            <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-foreground leading-none">
              One Prompt.
            </h1>
            {/* Line 2: Contrasting Gradient & Glass Effect */}
            <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight leading-none relative mt-2">
              <span className="glass-morphic-text">Infinite Paths.</span>
            </h1>
          </div>

          <p className="text-lg text-muted-foreground max-w-lg">
            Spreed is the omni-model workspace. Ask GPT-4 a question, follow up
            with Claude, and branch the conversation with Llama. Don&apos;t let
            a single model limit your thinking.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/chat">
              <Button size="lg" className="gap-2">
                Try Spreed Now <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="pt-8 border-t border-border grid grid-cols-2 gap-6">
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
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-spreed-blue/20 to-spreed-yellow/20 rounded-3xl -rotate-2 scale-95 -z-10 dark:from-spreed-blue/10 dark:to-spreed-yellow/10" />
          <Card className="glass min-h-[500px] flex flex-col overflow-hidden shadow-2xl">
            {/* Mock Chat Interface */}
            <CardHeader className="border-b border-white/10 dark:border-white/5 px-6 py-4 flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-foreground/10 transition-all duration-500 hover:bg-spreed-blue/40 hover:shadow-[0_0_12px_rgba(31,159,255,0.4)] cursor-pointer" />
                <div className="w-3 h-3 rounded-full bg-foreground/10 transition-all duration-500 hover:bg-spreed-yellow/40 hover:shadow-[0_0_12px_rgba(255,192,80,0.4)] cursor-pointer" />
                <div className="w-3 h-3 rounded-full bg-foreground/10 transition-all duration-500 hover:bg-spreed-blue/40 hover:shadow-[0_0_12px_rgba(31,159,255,0.4)] cursor-pointer" />
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                spreedsheet-alpha
              </div>
            </CardHeader>

            <CardContent className="flex-1 p-0 relative">
              <ScrollArea className="h-[450px] p-6">
                <div className="space-y-6">
                  {/* User Message */}
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex-1 space-y-2">
                      <Avatar className="h-8 w-8 mx-auto">
                        <AvatarImage src="/avatars/user.png" />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="glass-active p-3 rounded-lg text-sm">
                        Write a python function to scrape a website.
                      </div>
                    </div>
                  </div>

                  {/* AI Responses */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Response 1 */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <Badge
                          variant="outline"
                          className="text-spreed-blue border-spreed-blue/20 bg-spreed-blue/5 dark:border-spreed-blue/30 dark:bg-spreed-blue/10"
                        >
                          GPT-5.2
                        </Badge>
                      </div>
                      <div className="glass-subtle p-3 rounded-lg text-xs text-muted-foreground shadow-sm">
                        Here is a script using BeautifulSoup...
                      </div>
                    </div>

                    {/* Response 2 */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-center  gap-2">
                        <Badge
                          variant="outline"
                          className="text-spreed-yellow border-spreed-yellow/20 bg-spreed-yellow/5 dark:border-spreed-yellow/30 dark:bg-spreed-yellow/10"
                        >
                          Claude Opus 4.6
                        </Badge>
                      </div>
                      <div className="glass-subtle p-3 rounded-lg text-xs text-muted-foreground shadow-sm">
                        I recommend using Scrapy for scale...
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
