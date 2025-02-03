

export default async function Page() {
  const data = await fetch('http://localhost:3000/api/chat')
  // const json = await data.text()
  // console.log('json', json, data.status)
  const reader = data.body.getReader();
const decoder = new TextDecoder();
let result = '';

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value, { stream: true });
  console.log('Received chunk:', chunk);
  result += chunk; // Append the chunk to the result
}
  return (
    <>
      <div className="overflow-auto w-[30vw] h-[30vh] border border-red-500">
        <div className="flex flex-row">
          <div className="w-[50vw] mx-auto shrink-0 border border-red-200">
            hi
          </div>
          <div className="h-[50vh] mx-auto shrink-0 border border-red-200">
            bye
          </div>
        </div>
      </div>
    </>
  );
}
