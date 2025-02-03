const authStatus = await getAuth()
console.log('authStatus', authStatus)

if (authStatus === 400) {
  console.log(
    "Not Authenticated",
    authStatus
  );
  setIsDialogOpen(true);
  return;
} else if (authStatus===401){
  console.log(
    "authStatus Not Enough Tokens",
    authStatus
  );
  setIsTopupDialogOpen(true);
  return
}
    const data = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/chat`,{
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages: chain, model: model, email:authStatus })
    });
    // console.log('data', data)
    const reader = data.body.getReader();
    const decoder = new TextDecoder();
    tempChunks = "";

    newBotEntry = {
      key: JSON.stringify(array),
      globalIdBot: newGlobalIdBot,
      content: tempChunks,
      role: "bot",
      status: "pending", // pending | reading | done
      model: model,
    };

    setBotMessages((v) => {
      return [...v, newBotEntry];
    });
    newBotEntry = {
      key: JSON.stringify(array),
      globalIdBot: newGlobalIdBot,
      content: tempChunks,
      role: "bot",
      status: "pending reading", // pending | reading | done
      model: model,
    };
    setBotMessages((v) => {
      // console.log("botMessages pending", v);
      return v.map((m) => (m.key === JSON.stringify(array) ? newBotEntry : m));
    });  

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    let chunk = decoder.decode(value, { stream: true });
    // chunk = `{${chunk.replace('\n', ',')}}`
    console.log('Received chunk:', chunk);

    tempChunks = chunk ? tempChunks + chunk : tempChunks;

    newBotEntry = {
      key: JSON.stringify(array),
      globalIdBot: newGlobalIdBot,
      content: tempChunks,
      role: "bot",
      status: "reading",
      model: model,
    };
    setBotMessages((v) => {
      // console.log("botMessages counter:", counter, delta, v);

      return v.map((m) =>
        m.key === JSON.stringify(array) ? newBotEntry : m
      );
    });

  }
    // END: streaming the LLM
    /