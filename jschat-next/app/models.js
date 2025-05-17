import {
  Atom,
  Rabbit,
  Zap,
  TextSearch,
  OctagonAlert,
  Search,
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

export const groqModelsWithMeta = [
  {
    name: "Groq's Compound AI System",
    model: "compound-beta",
    meta: "Compound-beta is a compound AI system powered by multiple LLMs to intelligently and selectively use tools to answer user queries, starting first with web search and code execution.",
    new: true,
    vision: false,
    reasoning: true,
    icon: SearchIcon,
  },
  {
    name: "Llama 4 Scout 17b - 16 Experts",
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    meta: "Latest Model From Meta Using Mixture-of-Experts With 16 Experts",
    new: true,
    vision: true,
    reasoning: false,
    icon: FastIcon,
  },
  {
    name: "Qwen QWQ 32b",
    model: "qwen-qwq-32b",
    meta: "The Reasoning Model Of The Qwen Series By Alibaba Cloud - Capable Of Thinking And Reasoning",
    new: false,
    vision: false,
    reasoning: true,
    icon: BrainIcon,
  },
  {
    name: "Llama-3.3-70b-versatile",
    model: "llama-3.3-70b-versatile",
    meta: "70-Billion Parameter Model From Meta",
    new: false,
    vision: false,
    reasoning: false,
    icon: FastIcon,
  },
  {
    name: "Llama-3.3-70b-specdec",
    model: "llama-3.3-70b-specdec",
    meta: "70-Billion Parameter Model From Meta With Speculative Decoding (Faster)",
    new: false,
    vision: false,
    reasoning: false,
    icon: FastIcon,
  },
  {
    name: "Deepseek-r1-distill-llama-70b",
    model: "deepseek-r1-distill-llama-70b",
    meta: "Meta Llama Distilled Using DeepSeek R1 Reinforcement Learning",
    new: false,
    vision: false,
    reasoning: true,
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
    reasoning: false,
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
    reasoning: true,
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
    reasoning: true,
    icon: BrainIcon,
  },
  {
    name: "DeepSeek-R1-Turbo",
    model: "deepseek-ai/DeepSeek-R1-Turbo",
    meta: "Turbo Version of DeepSeek R1 Model (Fast)",
    new: false,
    vision: false,
    reasoning: true,
    icon: BrainIcon,
  },
  {
    name: "Llama-3.1-Nemotron-70B-Instruct",
    model: "nvidia/Llama-3.1-Nemotron-70B-Instruct",
    meta: "Nvidia Fine-Tune of Llama 3.1 (More Detailed Responses)",
    new: false,
    vision: false,
    reasoning: false,
    icon: DetailedIcon,
  },
  {
    name: "DeepSeek-R1-Distill-Qwen-32B",
    model: "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B",
    meta: "Qwen By Alibaba Cloud Distilled Using DeepSeek R1 Reinforcement Learning",
    new: false,
    vision: false,
    reasoning: true,
    icon: BrainIcon,
  },
  {
    name: "Qwen2.5-72B-Instruct",
    model: "Qwen/Qwen2.5-72B-Instruct",
    meta: "Largest Qwen Model By Alibaba Cloud",
    new: false,
    vision: false,
    reasoning: false,
    icon: DifferentIcon,
  },
  {
    name: "DeepSeek-R1",
    model: "deepseek-ai/DeepSeek-R1",
    meta: "Original DeepSeek R1 Model (Slow)",
    new: false,
    vision: false,
    reasoning: true,
    icon: BrainIcon,
  },
];

export const openaiModelsWithMeta = [
  {
    name: "GPT 4.1 mini",
    model: "gpt-4.1-mini",
    meta: "Latest Mini Version of OpenAI's GPT Model Series (Fastest)",
    new: true,
    vision: true,
    reasoning: false,
    icon: FastIcon,
  },
  {
    name: "o4 mini",
    model: "o4-mini",
    meta: "Latest Reasoning Model From OpenAI | High Effort (Slow - Needs Thinking)",
    reasoning: true,
    new: true,
    vision: true,
    icon: BrainIcon,
  },
  {
    name: "GPT 4.1 nano",
    model: "gpt-4.1-nano",
    meta: "Latest Nano Version of OpenAI's GPT Model Series (Fastest)",
    new: true,
    vision: true,
    reasoning: false,
    icon: FastIcon,
  },
  {
    name: "GPT 4.1",
    model: "gpt-4.1",
    meta: "Latest Version of OpenAI's GPT Model Series (Fastest)",
    new: true,
    vision: true,
    reasoning: false,
    icon: DetailedIcon,
  },
  {
    name: "GPT 4o mini",
    model: "gpt-4o-mini",
    meta: "Mini Version of OpenAI's Omni Model Series (Fastest)",
    new: false,
    vision: true,
    reasoning: false,
    icon: FastIcon,
  },

  {
    name: "o3 mini",
    model: "o3-mini",
    meta: "Smaller Version of o3 Reasoning Model From OpenAI | High Effort (Slow - Needs Thinking)",
    reasoning: true,
    new: false,
    vision: false,
    icon: BrainIcon,
  },
  {
    name: "GPT 4o",
    model: "gpt-4o",
    meta: "Latest Flagship Omni Model From OpenAI",
    new: false,
    vision: true,
    reasoning: false,
    icon: DetailedIcon,
  },
  {
    name: "ChatGPT 4o latest",
    model: "chatgpt-4o-latest",
    meta: "Flagship Omni Model Used in ChatGPT",
    new: false,
    vision: true,
    reasoning: false,
    icon: DetailedIcon,
  },
];

export const anthropicModelsWithMeta = [
  {
    name: "Claude 3.5 Haiku",
    model: "claude-3-5-haiku-latest",
    meta: "Fastest Anthropic Model For Daily Tasks",
    new: false,
    vision: true,
    reasoning: false,
    icon: FastIcon,
  },
  {
    name: "Claude 3.7 Sonnet",
    model: "claude-3-7-sonnet-latest",
    meta: "Anthropic's Most Intelligent Model Capable of Reasoning",
    new: false,
    vision: true,
    reasoning: true,
    icon: BrainIcon,
  },
];

export const xAIModelsWithMeta = [
  {
    name: "Grok 3",
    model: "grok-3-latest",
    meta: "xAI's Flagship LLM",
    new: true,
    vision: false,
    reasoning: false,
    icon: DetailedIcon,
  },
  {
    name: "Grok 3 mini high",
    model: "grok-3-mini-latest",
    meta: "xAI's Flagship LLM With High Reasoning",
    new: true,
    vision: false,
    reasoning: true,
    icon: BrainIcon,
  },
  {
    name: "Grok 2",
    model: "grok-2-latest",
    meta: "xAI's LLM",
    new: false,
    vision: false,
    reasoning: false,
    icon: DifferentIcon,
  },
];
export const geminiModelsWithMeta = [
  // {
  //   name: "Gemini 2.0 Flash",
  //   model: "gemini-2.0-flash",
  //   meta: "Google's Fastest LLM",
  //   new: true,
  //   vision: false,
  //   reasoning: false,
  //   icon: FastIcon,
  // },
  {
    name: "Gemini 2.5 Flash",
    model: "gemini-2.5-flash-preview-04-17",
    meta: "Google's Fastest LLM With Thinking Capabilities",
    new: true,
    vision: false,
    reasoning: true,
    icon: SearchIcon,
  },

  {
    name: "Gemini 2.5 Pro",
    model: "gemini-2.5-pro-preview-05-06",
    meta: "Google's State-of-the-art Thinking Model",
    new: true,
    vision: false,
    reasoning: true,
    icon: BrainIcon,
  },
];
const allModels = [
  ...openaiModelsWithMeta,
  ...groqModelsWithMeta,
  ...deepinfraModelsWithMeta,
  ...anthropicModelsWithMeta,
  ...xAIModelsWithMeta,
  ...geminiModelsWithMeta,
];
export const allModelsWithoutIcon = allModels.map(
  ({ icon, ...model }) => model
);

export const groqModels = groqModelsWithMeta.map((m) => m.model);
export const deepinfraModels = deepinfraModelsWithMeta.map((m) => m.model);
export const openaiModels = openaiModelsWithMeta.map((m) => m.model);
export const anthropicModels = anthropicModelsWithMeta.map((m) => m.model);
export const xAIModels = xAIModelsWithMeta.map((m) => m.model);
export const geminiModels = geminiModelsWithMeta.map((m) => m.model);

// console.log(groqModels);
// console.log(deepinfraModels);
// console.log(openaiModels);
