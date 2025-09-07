import { NextRouter } from "next/router";

export type UserMessages = {
  key: string;
  content: string;
  role: string;
  globalIdUser: number;
}[];

export type BotMessages = {
  key: string;
  content: string;
  role: string;
  globalIdBot: number;
  status: string;
  model: string;
}[];

export type SetUserMessages = (userMessages: UserMessages) => void;
export type SetBotMessages = (botMessages: BotMessages) => void;
export type SetSystemPrompt = (systemPrompt: string) => void;
export type SetCanvasText = (canvasText: string) => void;
export type SetReferencesText = (references: string) => void;
export type SetLLMInstructions = (llmInstructions: string) => void;
export type SetExtraContext = (extraContext: string) => void;

export type SaveItemParams = {
  chatId: string;
  userMessages: UserMessages;
  botMessages: BotMessages;
  setUserMessages: SetUserMessages;
  setBotMessages: SetBotMessages;
  systemPrompt: string;
  setSystemPrompt: SetSystemPrompt;
};

export type SaveItemCanvasParams = {
  canvasId: string;
  canvasText: string;
  setCanvasText: SetCanvasText;
  llmInstructions: string;
  setLLMInstructions: SetLLMInstructions;
  extraContext: string;
  setExtraContext: SetExtraContext;
  references: string;
  setReferences: SetReferencesText;
  searchParams: { [key: string]: string | string[] | undefined };
  pathname: string;
};

export type SaveChatSessionParams = {
  chatId: string;
  userMessages: UserMessages;
  botMessages: BotMessages;
  systemPrompt: string;
};

export function createSaveCanvasSessionParams(params: SaveItemCanvasParams) {
  const { canvasId, canvasText, references, llmInstructions, extraContext } =
    params;
  return { canvasId, canvasText, references, llmInstructions, extraContext };
}
