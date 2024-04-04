import ReactFlow from "react-flow-renderer";

const ReactFlowProvider = ({ children, ...props }) => {
  return <ReactFlow {...props}>{children}</ReactFlow>;
};

export default ReactFlowProvider;
