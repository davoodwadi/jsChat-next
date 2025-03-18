import { Atom, Rabbit, Zap, TextSearch, OctagonAlert } from "lucide-react";
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
    name: "llama-3.3-70b-versatile",
    model: "llama-3.3-70b-versatile",
    meta: "Latest Model From Meta",
    icon: FastIcon,
  },
  {
    name: "llama-3.3-70b-specdec",
    model: "llama-3.3-70b-specdec",
    meta: "Latest Model From Meta With Speculative Decoding (Faster)",
    icon: FastIcon,
  },
  {
    name: "deepseek-r1-distill-llama-70b",
    model: "deepseek-r1-distill-llama-70b",
    meta: "Meta Llama Distilled Using DeepSeek R1 Reinforcement Learning",
    icon: BrainIcon,
  },
];

export const deepinfraModelsWithMeta = [
  {
    name: "DeepSeek-R1-Turbo",
    model: "deepseek-ai/DeepSeek-R1-Turbo",
    meta: "Turbo Version of DeepSeek R1 Model (Fast)",
    icon: BrainIcon,
  },
  {
    name: "Llama-3.1-Nemotron-70B-Instruct",
    model: "nvidia/Llama-3.1-Nemotron-70B-Instruct",
    meta: "Nvidia Fine-Tune of Llama 3.1 (More Detailed Responses)",
    icon: DetailedIcon,
  },
  {
    name: "DeepSeek-R1-Distill-Qwen-32B",
    model: "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B",
    meta: "Qwen Distilled Using DeepSeek R1 Reinforcement Learning",
    icon: BrainIcon,
  },
  {
    name: "Qwen2.5-72B-Instruct",
    model: "Qwen/Qwen2.5-72B-Instruct",
    meta: "Largest Qwen Model",
    icon: DifferentIcon,
  },
  {
    name: "DeepSeek-R1",

    model: "deepseek-ai/DeepSeek-R1",
    meta: "Original DeepSeek R1 Model (Slow)",
    icon: BrainIcon,
  },
];

export const openaiModelsWithMeta = [
  {
    name: "gpt-4o-mini",
    model: "gpt-4o-mini",
    meta: "Latest Mini Version of OpenAI's GPT Model Series (Fastest)",
    icon: FastIcon,
  },
  {
    name: "o3-mini",
    model: "o3-mini",
    meta: "Latest Reasoning Model From OpenAI (Slow - Needs Thinking)",
    icon: BrainIcon,
  },
  {
    name: "gpt-4o",
    model: "gpt-4o",
    meta: "Latest Flagship GPT Model From OpenAI",
    icon: DetailedIcon,
  },
  {
    name: "chatgpt-4o-latest",
    model: "chatgpt-4o-latest",
    meta: "Flagship GPT Model Used in ChatGPT",
    icon: DetailedIcon,
  },
];

export const anthropicModelsWithMeta = [
  {
    name: "Claude 3.5 Haiku",
    model: "claude-3-5-haiku-latest",
    meta: "Fastest Anthropic Model For Daily Tasks",
    icon: FastIcon,
  },
  {
    name: "Claude 3.7 Sonnet",
    model: "claude-3-7-sonnet-latest",
    meta: "Anthropic's Most Intelligent Model Capable of Reasoning",
    icon: BrainIcon,
  },
];

export const xAIModelsWithMeta = [
  {
    name: "Groq 2",
    model: "grok-2-latest",
    meta: "xAI's Flagship LLM",
    icon: DifferentIcon,
  },
];

export const groqModels = groqModelsWithMeta.map((m) => m.model);
export const deepinfraModels = deepinfraModelsWithMeta.map((m) => m.model);
export const openaiModels = openaiModelsWithMeta.map((m) => m.model);
export const anthropicModels = anthropicModelsWithMeta.map((m) => m.model);
export const xAIModels = xAIModelsWithMeta.map((m) => m.model);

// console.log(groqModels);
// console.log(deepinfraModels);
// console.log(openaiModels);
