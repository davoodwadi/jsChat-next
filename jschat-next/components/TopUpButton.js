"use client"

import { addUserToken } from "@/lib/actions"

const handleClick = async () => {
  const acknowledged = await addUserToken({ user: null })
  console.log("purchased!", acknowledged)
}

export function TopUpButton(props) {
  return <button onClick={handleClick}>Top up +{props.amount}</button>
}
