import { test } from "@/lib/test";
import { delay } from "@/lib/myTools";
import { useToast } from "@/hooks/use-toast";

import { Suspense, useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { MultilineSkeleton } from "@/components/ui/skeleton";

import BranchContainer from "./BranchContainer";
import Branch from "./Branch";
// const Branch = dynamic(() => import("./Branch").then((mod) => mod.Branch), {
//   loading: () => <MultilineSkeleton lines={5} />,
// });

export default function RecursiveBranch(props) {
  // console.log("RecursiveBranch props", props);
  // console.log('runtime', typeof globalThis)

  // tempMessages should be messages whose length is props.parentKey.length+1
  // and .slice(0,-1) JSON.stringify is equal to parent
  let tempUserMessages;
  if (props.parentKey) {
    // userMessages whose length is same as parent
    // (parent: the userMessage that called recursive)
    // &&
    // userMessages whose key matches the parent
    tempUserMessages = props.userMessages.filter(
      (m) =>
        JSON.parse(m.key).length - 1 === JSON.parse(props.parentKey).length &&
        JSON.stringify(JSON.parse(m.key).slice(0, -1)) === props.parentKey
    );
  } else {
    tempUserMessages = props.userMessages.filter(
      (m) => JSON.parse(m.key).length === 1
    );
  }
  // console.log("tempUserMessages", tempUserMessages);
  return (
    tempUserMessages[0] && (
      <Suspense
        fallback={
          <div className="w-3/4 mx-auto">
            <MultilineSkeleton lines={4} />
          </div>
        }
      >
        <BranchContainer id={props.level} key={props.level}>
          {tempUserMessages.map((tm, i) => {
            return (
              <Branch
                tm={tm}
                key={`${props.level} ${i}`}
                id={`${props.level} ${i}`}
                {...props}
              />
            );
          })}
        </BranchContainer>
      </Suspense>
    )
  );
}
