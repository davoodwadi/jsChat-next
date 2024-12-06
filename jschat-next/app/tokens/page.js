import { getUserTokensLeft } from "@/app/api/chat/actions"
import { TopUpButton } from "@/app/components/TopUpButton"

export default async function Tokens() {
  const { user } = await getUserTokensLeft({ user: null })
  const userArray = Object.entries(user)

  console.log("user", user)
  console.log("user", typeof user._id)
  console.log("user", typeof user.createdAt)
  console.log("user", String(user.createdAt))
  console.log("uuu", typeof user.tokensConsumed)
  const now = new Date()
  console.log(user.createdAt)
  console.log(now)
  const amount = 10
  return (
    <>
      <div className="flex flex-col mt-auto pt-4">
        <p className="mx-auto">Tokens page</p>
        <ol className="grid grid-rows-2">
          <li key={"tokensConsumed"} className="m-2">
            tokensConsumed: {user.tokensConsumed}
          </li>
          <li key={"tokensRemaining"} className="m-2">
            tokensRemaining: {user.tokensRemaining}
          </li>
          <li key={"createdAt"} className="m-2">
            createdAt: {String(user.createdAt)}
          </li>
          <li key={"quotaRefreshedAt"} className="m-2">
            quotaRefreshedAt: {String(user.quotaRefreshedAt)}
          </li>
        </ol>
        <TopUpButton amount={amount} />
      </div>
    </>
  )
}
