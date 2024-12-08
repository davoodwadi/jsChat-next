export default function Toast(props) {
  return (
    <div
      id="toast-success"
      className="fixed bottom-5 right-5 rounded bg-green-500 px-4 py-2 font-bold text-white opacity-100 shadow-lg transition-opacity duration-300"
      style={{ display: "block" }}
    >
      {props.children}
    </div>
  )
}
