export default async function Page({ searchParams }) {
  const filters = await searchParams
  console.log("filters", filters)
  console.log("typeof session_id", typeof filters.session_id)
  return <div>Payment failed: {filters.session_id}</div>
}
