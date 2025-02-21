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

export type SaveItemParams = {
  chatId: string;
  userMessages: UserMessages;
  botMessages: BotMessages;
  setUserMessages: SetUserMessages;
  setBotMessages: SetBotMessages;
  systemPrompt: string;
  setSystemPrompt: SetSystemPrompt;
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
