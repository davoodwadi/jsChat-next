import { SuccessCardClient } from "./ClientComponent";
import { Suspense } from "react";
export default function Page() {
  return (
    <Suspense>
      <SuccessCardClient />
    </Suspense>
  );
}
