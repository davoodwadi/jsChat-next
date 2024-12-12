const runtime = process.env.NEXT_PUBLIC_BASE_URL;

let test = false;
if (runtime === "http://localhost:3000") {
  test = true;
}
// console.log("test", test);
export { test };
