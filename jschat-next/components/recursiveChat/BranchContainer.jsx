export default function BranchContainer(props) {
  // console.log("BranchContainer props", props);

  return (
    <div
      id={"branch-container-" + props.id}
      className="flex flex-row " //border-4 border-green-300 overflow-scroll flex-nowrap justify-between
    >
      {props.children}
    </div>
  );
}
