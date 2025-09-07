export function createSaveChatSessionParams(params) {
  const { chatId, userMessages, botMessages, systemPrompt, globalModelInfo } =
    params;
  return { chatId, userMessages, botMessages, systemPrompt, globalModelInfo };
}
