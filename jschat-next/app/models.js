import { test } from "@/lib/test";
import {
  Atom,
  Rabbit,
  Zap,
  TextSearch,
  OctagonAlert,
  Search,
  Code,
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBrain,
  faBolt,
  faMagnifyingGlassChart,
} from "@fortawesome/free-solid-svg-icons";

const DifferentIcon = () => (
  <OctagonAlert size={16} className="relative top-[4px]" />
);
const AtomIcon = () => <Atom size={16} className="relative top-[4px]" />;
// const FastIcon = () => <Zap size={16} className="relative top-[4px]" />;
const FastIcon = () => (
  <FontAwesomeIcon icon={faBolt} className="relative top-[1px]" />
);

const DetailedIcon = () => (
  <TextSearch size={16} className="relative top-[4px]" />
);
const CodeIcon = () => <Code size={16} className="relative top-[4px]" />;

const SearchIcon = () => <Search size={16} className="relative top-[4px]" />;

// const DetailedIcon = () => (
//   <FontAwesomeIcon
//     icon={faMagnifyingGlassChart}
//     className="relative top-[1px]"
//   />
// );

const BrainIcon = () => (
  <FontAwesomeIcon icon={faBrain} className="relative top-[1px]" />
);
export const perplexityModelsWithMeta = [
  {
    name: "Perplexity Search",
    model: "Perplexity Search Model",
    meta: "Advanced Grounded Model Capable of Searching and Deep Reasoning",
    new: true,
    vision: false,
    hasReasoning: false,
    hasDeepResearch: true,
    hasSearch: true,
    hasAcademic: true,
    icon: SearchIcon,
  },
];
export const groqModelsWithMeta = [
  {
    name: "Kimi K2 Instruct",
    model: "moonshotai/kimi-k2-instruct",
    meta: "State-of-the-art Mixture-of-Experts (MoE) language model with 1 trillion total parameters and 32 billion activated parameters. Designed for agentic intelligence, it excels at tool use, coding, and autonomous problem-solving across diverse domains.",
    new: true,
    vision: false,
    hasReasoning: false,
    icon: DetailedIcon,
  },
  {
    name: "Groq's Compound AI System",
    model: "compound-beta",
    meta: "Compound-beta is a compound AI system powered by multiple LLMs to intelligently and selectively use tools to answer user queries, starting first with web search and code execution.",
    new: true,
    vision: false,
    hasReasoning: true,
    icon: SearchIcon,
  },
  {
    name: "Llama 4 Scout 17b - 16 Experts",
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    meta: "Latest Model From Meta Using Mixture-of-Experts With 16 Experts",
    new: true,
    vision: true,
    hasReasoning: false,
    icon: FastIcon,
  },
  {
    name: "Llama-3.3-70b-versatile",
    model: "llama-3.3-70b-versatile",
    meta: "70-Billion Parameter Model From Meta",
    new: false,
    vision: false,
    hasReasoning: false,
    icon: FastIcon,
  },
  {
    name: "Deepseek-r1-distill-llama-70b",
    model: "deepseek-r1-distill-llama-70b",
    meta: "Meta Llama Distilled Using DeepSeek R1 Reinforcement Learning",
    new: false,
    vision: false,
    hasReasoning: true,
    icon: BrainIcon,
  },
];

export const deepinfraModelsWithMeta = [
  {
    name: "Llama 4 Maverick 17b - 128 Experts",
    model: "meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
    meta: "Latest Model From Meta Using Mixture-of-Experts With 128 Experts",
    new: true,
    vision: true,
    hasReasoning: false,
    icon: DetailedIcon,
  },
  {
    name: "Qwen3 235B A22B",
    model: "Qwen/Qwen3-235B-A22B",
    meta: `Latest LLM in the Qwen Series, Using Mixture-of-Experts (MoE).
Significant enhancement in its reasoning capabilities, surpassing previous QwQ (in thinking mode) and Qwen2.5 instruct models (in non-thinking mode) on mathematics, code generation, and commonsense logical reasoning.
Superior human preference alignment, excelling in creative writing, role-playing, multi-turn dialogues, and instruction following, to deliver a more natural, engaging, and immersive conversational experience.
Expertise in agent capabilities, enabling precise integration with external tools in both thinking and unthinking modes and achieving leading performance among open-source models in complex agent-based tasks.
Support of 100+ languages and dialects with strong capabilities for multilingual instruction following and translation.`,
    new: true,
    vision: false,
    hasReasoning: true,
    icon: BrainIcon,
  },
  {
    name: "DeepSeek Prover V2 671B",
    model: "deepseek-ai/DeepSeek-Prover-V2-671B",
    meta: `An LLM Designed for Formal Theorem Proving. 
It decompose complex problems into a series of subgoals. 
The proofs of resolved subgoals are synthesized into a chain-of-thought process, 
combined with DeepSeek-V3's step-by-step reasoning, 
to create an initial cold start for reinforcement learning. 
This process enables the LLM to integrate both informal and formal mathematical reasoning 
into a unified model.`,
    new: true,
    vision: false,
    hasReasoning: true,
    icon: BrainIcon,
  },
  {
    name: "DeepSeek-R1-Turbo",
    model: "deepseek-ai/DeepSeek-R1-Turbo",
    meta: "Turbo Version of DeepSeek R1 Model (Fast)",
    new: false,
    vision: false,
    hasReasoning: true,
    icon: BrainIcon,
  },
  {
    name: "Llama-3.1-Nemotron-70B-Instruct",
    model: "nvidia/Llama-3.1-Nemotron-70B-Instruct",
    meta: "Nvidia Fine-Tune of Llama 3.1 (More Detailed Responses)",
    new: false,
    vision: false,
    hasReasoning: false,
    icon: DetailedIcon,
  },
  {
    name: "DeepSeek-R1-Distill-Qwen-32B",
    model: "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B",
    meta: "Qwen By Alibaba Cloud Distilled Using DeepSeek R1 Reinforcement Learning",
    new: false,
    vision: false,
    hasReasoning: true,
    icon: BrainIcon,
  },
  {
    name: "Qwen2.5-72B-Instruct",
    model: "Qwen/Qwen2.5-72B-Instruct",
    meta: "Largest Qwen Model By Alibaba Cloud",
    new: false,
    vision: false,
    hasReasoning: false,
    icon: DifferentIcon,
  },
  {
    name: "DeepSeek-R1",
    model: "deepseek-ai/DeepSeek-R1",
    meta: "Original DeepSeek R1 Model (Slow)",
    new: false,
    vision: false,
    hasReasoning: true,
    icon: BrainIcon,
  },
];

export const openaiModelsWithMeta = [
  {
    name: "GPT 5.2 Pro",
    model: "gpt-5.2-pro",
    meta: "Flagship Model Used in ChatGPT Pro",
    new: true,
    vision: true,
    hasReasoning: true,
    hasDeepResearch: false,
    hasSearch: false,
    hasAgentic: false,
    icon: DetailedIcon,
  },
  {
    name: "GPT 5.2",
    model: "gpt-5.2",
    meta: "Flagship Model Used in ChatGPT Pro",
    new: true,
    vision: true,
    hasReasoning: true,
    hasDeepResearch: false,
    hasSearch: true,
    hasAgentic: false,
    icon: DetailedIcon,
  },
  {
    name: "ChatGPT 5.2 latest",
    model: "gpt-5.2-chat-latest",
    meta: "Flagship Model Used in ChatGPT",
    new: true,
    vision: true,
    hasReasoning: false,
    hasDeepResearch: false,
    hasSearch: false,
    hasAgentic: false,
    icon: DetailedIcon,
  },
  {
    name: "ChatGPT 5 latest",
    model: "gpt-5-chat-latest",
    meta: "Flagship Model Used in ChatGPT",
    new: false,
    vision: true,
    hasReasoning: false,
    hasDeepResearch: false,
    hasSearch: false,
    hasAgentic: false,
    icon: DetailedIcon,
  },
  {
    name: "GPT 4.1 mini",
    model: "gpt-4.1-mini",
    meta: "Latest Mini Version of OpenAI's GPT Model Series (Fastest)",
    new: true,
    vision: true,
    hasReasoning: false,
    hasDeepResearch: false,
    hasSearch: true,
    hasAgentic: true,
    icon: FastIcon,
  },
  {
    name: "o4 mini Deep Research",
    model: "o4-mini-deep-research",
    meta: "Latest Deep Research & Reasoning Model From OpenAI | High Effort (Slow - Needs Thinking)",
    hasReasoning: true,
    new: true,
    vision: true,
    hasDeepResearch: true,
    hasSearch: false,
    hasAgentic: false,
    icon: BrainIcon,
  },
  {
    name: "o4 mini",
    model: "o4-mini",
    meta: "Latest Reasoning Model From OpenAI | High Effort (Slow - Needs Thinking)",
    hasReasoning: true,
    new: true,
    vision: true,
    hasDeepResearch: false,
    hasSearch: true,
    hasAgentic: true,
    icon: BrainIcon,
  },
  {
    name: "GPT 4.1 nano",
    model: "gpt-4.1-nano",
    meta: "Latest Nano Version of OpenAI's GPT Model Series (Fastest)",
    new: false,
    vision: true,
    hasReasoning: false,
    icon: FastIcon,
  },
  {
    name: "GPT 4.1",
    model: "gpt-4.1",
    meta: "Latest Version of OpenAI's GPT Model Series (Fastest)",
    new: false,
    vision: true,
    hasReasoning: false,
    hasDeepResearch: false,
    hasSearch: true,
    hasAgentic: true,
    icon: DetailedIcon,
  },
  {
    name: "GPT 4o mini",
    model: "gpt-4o-mini",
    meta: "Mini Version of OpenAI's Omni Model Series (Fastest)",
    new: false,
    vision: true,
    hasReasoning: false,
    hasDeepResearch: false,
    hasSearch: true,
    hasAgentic: true,
    icon: FastIcon,
  },
  {
    name: "GPT 4o",
    model: "gpt-4o",
    meta: "Latest Flagship Omni Model From OpenAI",
    new: false,
    vision: true,
    hasReasoning: false,
    hasDeepResearch: false,
    hasSearch: true,
    hasAgentic: true,
    icon: DetailedIcon,
  },
  {
    name: "ChatGPT 4o latest",
    model: "chatgpt-4o-latest",
    meta: "Flagship Omni Model Used in ChatGPT",
    new: false,
    vision: true,
    hasReasoning: false,
    hasDeepResearch: false,
    hasSearch: true,
    hasAgentic: true,
    icon: DetailedIcon,
  },
];

export const anthropicModelsWithMeta = [
  {
    name: "Claude Opus 4.6",
    model: "claude-opus-4-6",
    meta: "Anthropic's Most Intelligent Model for Complext Agents and Coding, Capable of Reasoning",
    new: true,
    vision: true,
    hasReasoning: true,
    icon: BrainIcon,
  },
  {
    name: "Claude Sonnet 4.5",
    model: "claude-sonnet-4-5",
    meta: "Anthropic's Model for Complext Agents and Coding, Capable of Reasoning",
    new: false,
    vision: true,
    hasReasoning: true,
    icon: BrainIcon,
  },
  {
    name: "Claude 4.5 Haiku",
    model: "claude-haiku-4-5",
    meta: "Fastest Anthropic Model With Frontier Speed",
    new: false,
    vision: true,
    hasReasoning: true,
    icon: FastIcon,
  },
  {
    name: "Claude 3.5 Haiku",
    model: "claude-3-5-haiku-latest",
    meta: "Legacy Anthropic Model For Daily Tasks",
    new: false,
    vision: true,
    hasReasoning: false,
    icon: FastIcon,
  },
  {
    name: "Claude Sonnet 4",
    model: "claude-sonnet-4-20250514",
    meta: "Anthropic's Model Capable of Reasoning",
    new: false,
    vision: true,
    hasReasoning: true,
    icon: BrainIcon,
  },
];

export const xAIModelsWithMeta = [
  {
    name: "Grok 4.1 Fast (Reasoning)",
    model: "grok-4-1-fast-reasoning",
    meta: "xAI's latest advancement in cost-efficient reasoning models.",
    new: true,
    vision: true,
    hasReasoning: true,
    icon: BrainIcon,
  },
  {
    name: "Grok 4.1 Fast (Non-Reasoning)",
    model: "grok-4-1-fast-non-reasoning",
    meta: "xAI's latest advancement in cost-efficient models.",
    new: true,
    vision: true,
    hasReasoning: false,
    icon: DetailedIcon,
  },
  {
    name: "Grok 4",
    model: "grok-4-latest",
    meta: "xAI's Flagship LLM",
    new: false,
    vision: true,
    hasReasoning: false,
    icon: BrainIcon,
  },
  {
    name: "Grok 4 Fast (Reasoning)",
    model: "grok-4-fast-reasoning",
    meta: "xAI's latest advancement in cost-efficient reasoning models.",
    new: false,
    vision: true,
    hasReasoning: true,
    icon: BrainIcon,
  },
  {
    name: "Grok 4 Fast (Non-Reasoning)",
    model: "grok-4-fast-non-reasoning",
    meta: "xAI's latest advancement in cost-efficient models.",
    new: false,
    vision: true,
    hasReasoning: false,
    icon: DetailedIcon,
  },
  {
    name: "Grok Code Fast",
    model: "grok-code-fast-1",
    meta: "xAI's speedy and economical reasoning model that excels at agentic coding",
    new: true,
    vision: false,
    hasReasoning: true,
    icon: CodeIcon,
  },
  {
    name: "Grok 3 mini high",
    model: "grok-3-mini-latest",
    meta: "xAI's Flagship LLM With High Reasoning",
    new: false,
    vision: false,
    hasReasoning: true,
    icon: BrainIcon,
  },
];
export const geminiModelsWithMeta = [
  {
    name: "Gemini 3.1 Pro",
    model: "models/gemini-3.1-pro-preview",
    meta: "Google's Latest LLM With Web Search and Thinking Capabilities",
    new: true,
    vision: false,
    hasReasoning: true,
    hasDeepResearch: false,
    hasSearch: true,
    icon: BrainIcon,
    default: false,
  },

  {
    name: "Gemini 3 Pro",
    model: "models/gemini-3-pro-preview",
    meta: "Google's Latest LLM With Web Search and Thinking Capabilities",
    new: false,
    vision: false,
    hasReasoning: true,
    hasDeepResearch: false,
    hasSearch: true,
    icon: BrainIcon,
    default: false,
  },
  {
    name: "Gemini 3 Flash",
    model: "gemini-3-flash-preview",
    meta: "Google's Latest and Fastest LLM With Web Search and Thinking Capabilities",
    new: true,
    vision: true,
    hasReasoning: true,
    hasDeepResearch: false,
    hasSearch: true,
    default: true,
    icon: BrainIcon,
  },

  {
    name: "Gemini 2.5 Flash",
    model: "models/gemini-2.5-flash",
    meta: "Google's Fastest LLM With Web Search and Thinking Capabilities",
    new: false,
    vision: false,
    hasReasoning: true,
    hasDeepResearch: false,
    hasSearch: true,
    icon: BrainIcon,
  },
  {
    name: "Gemini 2.5 Pro",
    model: "gemini-2.5-pro",
    meta: "Google's State-of-the-art Thinking Model With Web Search",
    new: false,
    vision: false,
    hasReasoning: true,
    hasDeepResearch: false,
    hasSearch: true,
    icon: BrainIcon,
  },
];

export const alibabaModelsWithMeta = [
  {
    name: "Qwen 3.5 Plus",
    model: "qwen3.5-plus",
    meta: "The Qwen 3 series Max model has undergone specialized upgrades in agent programming and tool invocation compared to the preview version. The officially released model this time has achieved state-of-the-art (SOTA) performance in its field and is better suited to meet the demands of agents operating in more complex scenarios.",
    new: true,
    vision: true,
    hasReasoning: true,
    hasDeepResearch: false,
    hasSearch: false,
    icon: DetailedIcon,
  },
  {
    name: "Qwen3 Max",
    model: "qwen3-max-preview",
    meta: "The Qwen 3 series Max model has undergone specialized upgrades in agent programming and tool invocation compared to the preview version. The officially released model this time has achieved state-of-the-art (SOTA) performance in its field and is better suited to meet the demands of agents operating in more complex scenarios.",
    new: true,
    vision: false,
    hasReasoning: true,
    hasDeepResearch: false,
    hasSearch: false,
    icon: DetailedIcon,
  },
  {
    name: "Qwen3 Flash",
    model: "qwen-flash",
    meta: "The Qwen3 Flash model offers a powerful fusion of thinking and non-thinking modes with dynamic in-conversation switching, excelling in complex reasoning while showing significant gains in instruction following and text comprehension. It supports a 1M context length and is billed on a tiered model corresponding to context usage.",
    new: true,
    vision: false,
    hasReasoning: true,
    hasDeepResearch: false,
    hasSearch: false,
    icon: DetailedIcon,
  },
  {
    name: "Qwen3 Coder Plus",
    model: "qwen3-coder-plus",
    meta: "Powered by Qwen3, this is a powerful Coding Agent that excels in tool calling and environment interaction to achieve autonomous programming. It combines outstanding coding proficiency with versatile general-purpose abilities.",
    new: true,
    vision: false,
    hasReasoning: false,
    hasDeepResearch: false,
    hasSearch: false,
    icon: CodeIcon,
  },
];

export const testModels = [
  {
    name: "test llm",
    model: "test-llm",
    meta: "LLM for testing",
    new: true,
    vision: true,
    hasReasoning: true,
    hasDeepResearch: true,
    hasSearch: true,
    hasAgentic: true,
    icon: SearchIcon,
  },
];
const allModels = [
  ...alibabaModelsWithMeta,
  ...perplexityModelsWithMeta,
  ...openaiModelsWithMeta,
  ...groqModelsWithMeta,
  ...deepinfraModelsWithMeta,
  ...anthropicModelsWithMeta,
  ...xAIModelsWithMeta,
  ...geminiModelsWithMeta,
];
if (test) {
  allModels.unshift(...testModels);
}
export { allModels };

export const allModelsWithoutIcon = allModels.map(
  ({ icon, ...model }) => model,
);

export const alibabaModels = alibabaModelsWithMeta.map((m) => m.model);
export const perplexityModels = perplexityModelsWithMeta.map((m) => m.model);
export const groqModels = groqModelsWithMeta.map((m) => m.model);
export const deepinfraModels = deepinfraModelsWithMeta.map((m) => m.model);
export const openaiModels = openaiModelsWithMeta.map((m) => m.model);
export const anthropicModels = anthropicModelsWithMeta.map((m) => m.model);
export const xAIModels = xAIModelsWithMeta.map((m) => m.model);
export const geminiModels = geminiModelsWithMeta.map((m) => m.model);

// console.log(groqModels);
// console.log(deepinfraModels);
// console.log(openaiModels);
