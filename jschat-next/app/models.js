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
import { DefaultEffort } from "@openrouter/sdk/models";

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
    name: "GPT 5.6 Sol",
    model: "gpt-5.6-sol",
    meta: "Flagship Model Used in ChatGPT Pro",
    new: true,
    vision: true,
    hasReasoning: true,
    reasoningLevels: [
      "none",
      "minimal",
      "low",
      "medium",
      "high",
      "xhigh",
      "max",
    ],
    defaultReasoningEffort: "minimal",
    hasDeepResearch: false,
    hasSearch: true,
    hasAgentic: false,
    icon: DetailedIcon,
  },
  {
    name: "GPT 5.6 Terra",
    model: "gpt-5.6-terra",
    meta: "Flagship Model Used in ChatGPT Pro",
    new: true,
    vision: true,
    hasReasoning: true,
    reasoningLevels: [
      "none",
      "minimal",
      "low",
      "medium",
      "high",
      "xhigh",
      "max",
    ],
    defaultReasoningEffort: "minimal",
    hasDeepResearch: false,
    hasSearch: true,
    hasAgentic: false,
    icon: DetailedIcon,
  },
  {
    name: "GPT 5.6 Luna",
    model: "gpt-5.6-luna",
    meta: "Flagship Model Used in ChatGPT Pro",
    new: true,
    vision: true,
    hasReasoning: true,
    reasoningLevels: [
      "none",
      "minimal",
      "low",
      "medium",
      "high",
      "xhigh",
      "max",
    ],
    defaultReasoningEffort: "minimal",
    hasDeepResearch: false,
    hasSearch: true,
    hasAgentic: false,
    icon: DetailedIcon,
  },
  {
    name: "GPT 5.5",
    model: "gpt-5.5",
    meta: "Flagship Model Used in ChatGPT Pro",
    new: true,
    vision: true,
    hasReasoning: true,
    reasoningLevels: [
      "none",
      "minimal",
      "low",
      "medium",
      "high",
      "xhigh",
      "max",
    ],
    defaultReasoningEffort: "minimal",
    hasDeepResearch: false,
    hasSearch: true,
    hasAgentic: false,
    icon: DetailedIcon,
  },
  {
    name: "GPT 5.5 Pro",
    model: "gpt-5.5-pro",
    meta: "Flagship Model Used in ChatGPT Pro",
    new: true,
    vision: true,
    hasReasoning: true,
    reasoningLevels: [
      "none",
      "minimal",
      "low",
      "medium",
      "high",
      "xhigh",
      "max",
    ],
    defaultReasoningEffort: "minimal",
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
];

export const openrouterModelsWithMeta = [
  {
    name: "Kimi K3",
    model: "moonshotai/kimi-k3",
    meta: "Moonshot AI's Most Intelligent Model for Complex Agents and Coding, Capable of Reasoning",
    new: true,
    vision: true,
    hasReasoning: true,
    reasoningLevels: ["minimal", "low", "medium", "high", "xhigh", "max"],
    defaultReasoningEffort: "xhigh",
    hasSearch: false,
    icon: BrainIcon,
  },
];

export const anthropicModelsWithMeta = [
  {
    name: "Claude Fable 5",
    model: "claude-fable-5",
    meta: "Anthropic's Most Intelligent Model for Complex Agents and Coding, Capable of Reasoning",
    new: true,
    vision: true,
    hasReasoning: true,
    reasoningLevels: ["low", "medium", "high", "xhigh", "max"],
    defaultReasoningEffort: "low",
    hasSearch: true,
    icon: BrainIcon,
  },
  {
    name: "Claude Opus 5",
    model: "claude-opus-5",
    meta: "Anthropic's Most Intelligent Model for Complex Agents and Coding, Capable of Reasoning",
    new: true,
    vision: true,
    hasReasoning: true,
    reasoningLevels: ["low", "medium", "high", "xhigh", "max"],
    defaultReasoningEffort: "low",
    hasSearch: true,
    icon: BrainIcon,
  },
  {
    name: "Claude Sonnet 5",
    model: "claude-sonnet-5",
    meta: "Anthropic's Most Intelligent Model for Complex Agents and Coding, Capable of Reasoning",
    new: true,
    vision: true,
    hasReasoning: true,
    reasoningLevels: ["low", "medium", "high", "xhigh", "max"],
    defaultReasoningEffort: "low",
    hasSearch: true,
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
  // {
  //   name: "Grok 4 Fast (Reasoning)",
  //   model: "grok-4-fast-reasoning",
  //   meta: "xAI's latest advancement in cost-efficient reasoning models.",
  //   new: false,
  //   vision: true,
  //   hasReasoning: true,
  //   icon: BrainIcon,
  // },
  // {
  //   name: "Grok 4 Fast (Non-Reasoning)",
  //   model: "grok-4-fast-non-reasoning",
  //   meta: "xAI's latest advancement in cost-efficient models.",
  //   new: false,
  //   vision: true,
  //   hasReasoning: false,
  //   icon: DetailedIcon,
  // },
  {
    name: "Grok Code Fast",
    model: "grok-code-fast-1",
    meta: "xAI's speedy and economical reasoning model that excels at agentic coding",
    new: true,
    vision: false,
    hasReasoning: true,
    icon: CodeIcon,
  },
  // {
  //   name: "Grok 3 mini high",
  //   model: "grok-3-mini-latest",
  //   meta: "xAI's Flagship LLM With High Reasoning",
  //   new: false,
  //   vision: false,
  //   hasReasoning: true,
  //   icon: BrainIcon,
  // },
];
export const geminiModelsWithMeta = [
  {
    name: "Gemini 3.1 Pro",
    model: "gemini-3.1-pro-preview",
    meta: "Google's Latest LLM With Web Search and Thinking Capabilities",
    new: true,
    vision: false,
    hasReasoning: true,
    reasoningLevels: ["minimal", "low", "medium", "high"],
    defaultReasoningEffort: "high",
    hasDeepResearch: true,
    hasSearch: true,
    icon: BrainIcon,
    default: false,
  },

  {
    name: "Gemini 3.8 Flash",
    model: "gemini-3.8-flash",
    meta: "Google's Latest and Fastest LLM With Web Search and Thinking Capabilities",
    new: true,
    vision: true,
    hasReasoning: true,
    reasoningLevels: ["minimal", "low", "medium", "high"],
    defaultReasoningEffort: "high",
    hasDeepResearch: true,
    hasSearch: true,
    default: true,
    icon: FastIcon,
  },
  {
    name: "Gemini 3.7 Flash",
    model: "gemini-3.7-flash",
    meta: "Google's Latest and Fastest LLM With Web Search and Thinking Capabilities",
    new: false,
    vision: true,
    hasReasoning: true,
    reasoningLevels: ["minimal", "low", "medium", "high"],
    defaultReasoningEffort: "high",
    hasDeepResearch: true,
    hasSearch: true,
    default: false,
    icon: FastIcon,
  },
  {
    name: "Gemini 3.5 Flash Lite",
    model: "gemini-3.5-flash-lite",
    meta: "Google's Latest Fast and Efficient Model",
    new: true,
    vision: true,
    hasReasoning: true,
    reasoningLevels: ["minimal", "low", "medium", "high"],
    defaultReasoningEffort: "high",
    hasDeepResearch: true,
    hasSearch: true,
    icon: FastIcon,
    default: false,
  },
];

export const alibabaModelsWithMeta = [
  {
    name: "Qwen3.8-Max",
    model: "qwen3.8-max",
    meta: "The Qwen 3 series Max model has undergone specialized upgrades in agent programming and tool invocation compared to the preview version. The officially released model this time has achieved state-of-the-art (SOTA) performance in its field and is better suited to meet the demands of agents operating in more complex scenarios.",
    new: true,
    vision: true,
    hasReasoning: true,
    reasoningLevels: ["low", "medium", "xhigh"],
    defaultReasoningEffort: "low",
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
];

export const testModels = [
  {
    name: "test llm",
    model: "test-llm",
    meta: "LLM for testing",
    new: true,
    vision: true,
    hasReasoning: true,
    reasoningLevels: ["low", "medium", "high", "xhigh", "max"],
    defaultReasoningEffort: "high",
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
  ...openrouterModelsWithMeta,
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
export const openrouterModels = openrouterModelsWithMeta.map((m) => m.model);

// console.log(groqModels);
// console.log(deepinfraModels);
// console.log(openaiModels);
