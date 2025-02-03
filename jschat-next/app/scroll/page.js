export default async function Page() {
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
