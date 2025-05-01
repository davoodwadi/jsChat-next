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

export function createSaveChatSessionParams(params: SaveItemParams) {
  const { chatId, userMessages, botMessages, systemPrompt } = params;
  return { chatId, userMessages, botMessages, systemPrompt };
}

export function createSaveCanvasSessionParams(params: SaveItemCanvasParams) {
  const { canvasId, canvasText, references } = params;
  return { canvasId, canvasText, references };
}
