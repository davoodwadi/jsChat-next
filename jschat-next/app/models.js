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
  // {
  //   name: "Llama 4 Maverick 17b 128 Experts",
  //   model: "meta-llama/llama-4-maverick-17b-128e-instruct",
  //   meta: "Latest Model From Meta Using Mixture-of-Experts With 128 Experts",
  //   icon: FastIcon,
  // },
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
    name: "Grok 2",
    model: "grok-2-latest",
    meta: "xAI's Flagship LLM",
    new: false,
    vision: false,
    reasoning: false,
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
