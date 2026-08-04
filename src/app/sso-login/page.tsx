import { Suspense } from "react";
import SSOLoginClient from "./SSOLoginClient";

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <SSOLoginClient />
    </Suspense>
  );
}