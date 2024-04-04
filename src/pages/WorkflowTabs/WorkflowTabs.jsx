import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  ListItemSecondaryAction,
  TextField,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Alert,
  Snackbar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  updateEdge,
  Controls,
  Background,
  useReactFlow,
  ReactFlowProvider,
} from "react-flow-renderer";
import axios from "axios";
import DynamicDialog from "../../components/Dialog";
import { useNavigate } from "react-router-dom";

const initialNodes = [
  {
    id: "1",
    position: { x: 250, y: 100 },
    data: { label: "Start" },
    isDeletable: false,
  },
];
const nodeStyles = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const edgeOptions = {
  animated: true,
  style: { stroke: "black" },
};
let positionY = 100;

const connectionLineStyle = { stroke: "black" };

function WorkflowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [openAddNodeDialog, setOpenAddNodeDialog] = useState(false);
  const [openEditNodeDialog, setOpenEditNodeDialog] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedNodeLabel, setSelectedNodeLabel] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isEditable, setIsEditable] = useState(true);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [clickedNodeId, setClickedNodeId] = useState(null);
  const [openDeleteEdgeDialog, setOpenDeleteEdgeDialog] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [renderedListItems, setRenderedListItems] = useState(null)
  const [severity, setSeverity] = useState("")
  const [deeleteConfirmationError, setDeleteConfirmationError] =
    useState(false);
  const [openWorkflowTitleDialog, setOpenWorkflowTitleDialog] = useState(false);
  const navigate = useNavigate();

  const reactFlowRef = useRef(null);

  const checkOverlap = (node, existingNodes) => {
    const nodeRect = {
      x: node.position.x,
      y: node.position.y,
      width: 100,
      height: 50,
    };

    for (const existingNode of existingNodes) {
      const existingRect = {
        x: existingNode.position.x,
        y: existingNode.position.y,
        width: 100,
        height: 50,
      };

      if (
        nodeRect.x < existingRect.x + existingRect.width &&
        nodeRect.x + nodeRect.width > existingRect.x &&
        nodeRect.y < existingRect.y + existingRect.height &&
        nodeRect.y + nodeRect.height > existingRect.y
      ) {
        return true;
      }
    }

    return false;
  };

  //   const adjustPositionForOverlap = (newNode, existingNodes) => {
  //     const reactFlowEl = reactFlowRef.current;
  //     const { width, height } = reactFlowEl.getBoundingClientRect();

  //     let attempts = 0;
  //     const maxAttempts = 10;

  //     while (checkOverlap(newNode, existingNodes) && attempts < maxAttempts) {
  //       attempts++;
  //       newNode.position.x = Math.random() * (width - 100);
  //       newNode.position.y = Math.random() * (height - 50);
  //     }

  //     return newNode;
  //   };

  const hasInAndOutEdges = (nodeId, edges) => {
    return (
      edges.some((edge) => edge.source === nodeId) &&
      edges.some((edge) => edge.target === nodeId)
    );
  };

  const handleAddNode = () => {
    setOpenAddNodeDialog(true);
  };

  const handleSubmitAddNode = () => {
    console.log(positionY, "postion", typeof positionY);
    const newNode = {
      id: `node-${Date.now()}`,
      position: {
        x: 100,
        y: (positionY += 100),
      },
      data: { label: selectedNodeLabel },
      isDeletable: true,
      style: {
        ...nodeStyles,
        background: "#f0f0f0",
      },
    };

    setSelectedNodeLabel("");
    setOpenAddNodeDialog(false);

    setNodes((prevNodes) => [
      ...prevNodes,
      newNode,
      //   adjustPositionForOverlap(newNode, prevNodes),
    ]);
    const lastAddedNode = nodes[nodes.length - 1];
    const newEdge = {
      id: `edge-${Date.now()}`,
      source: lastAddedNode.id,
      target: newNode.id,
      ...edgeOptions,
    };
    setEdges((prevEdges) => [...prevEdges, newEdge]);
  };

  const handleEditNode = (nodeId, label) => {
    setSelectedNodeId(nodeId);
    setSelectedNodeLabel(label);
    setOpenEditNodeDialog(true);
  };

  const handleSubmitEditNode = () => {
    const updatedNodes = nodes.map((node) =>
      node.id === selectedNodeId
        ? { ...node, data: { label: selectedNodeLabel } }
        : node
    );
    setNodes(updatedNodes);
    setSelectedNodeId(null);
    setSelectedNodeLabel("");
    setOpenEditNodeDialog(false);
  };

  const handleDeleteNode = (nodeId) => {
    const index = getNodeIndex(nodeId);
    const prevNode = nodes[index - 1];
    const nextNode = nodes[index + 1];

    if (prevNode && nextNode) {
      // Create a new edge connecting the previous node with the next node
      const newEdge = {
        id: `edge-${Date.now()}`,
        source: prevNode.id,
        target: nextNode.id,
        ...edgeOptions,
      };
      setEdges((prevEdges) => [...prevEdges, newEdge]);
    }

    setNodes((prevNodes) => prevNodes.filter((node) => node.id !== nodeId));
    setEdges((prevEdges) =>
      prevEdges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      )
    );
  };

  const onConnect = (params) => {
    const { source, target } = params;
    if (source !== target && !hasInAndOutEdges(source, edges)) {
      setEdges((prevEdges) =>
        addEdge({ ...params, ...edgeOptions }, prevEdges)
      );
    } else {
      //   setSnackbarOpen(true);
      setEdges((prevEdges) =>
        addEdge({ ...params, ...edgeOptions }, prevEdges)
      );
      //   setSnackbarMessage("Invalid edge connection.");
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleNodeClick = (node) => {
    setClickedNodeId(node.id);
    console.log("clicked")
    // if (node.isDeletable) {
    //   handleDeleteNode(node.id);
    // }
  };

  const onSubmit = async (workflowTitle) => {
    setSubmitting(true);

    // Implement your logic to submit the workflow data (nodes and edges) to your server
    // You can use the fetch API or any other suitable method
    const token = sessionStorage.getItem('authToken');
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };

    try {
      const response = await axios
        .post(
          `http://localhost:6004/workflow-revised`,
          { workflowTitle, body: { nodes, edges } },
          config
        )

      if (response.ok) {
        // Handle successful submission (e.g., clear the workflow, show a success message)
        console.log("Workflow submitted successfully!");
        setSnackbarOpen(true);
        setSnackbarMessage(response?.data?.message || "Failed to submit workflow. Please try again.");
        setSeverity("success")
        navigate("/")
      } else {
        // Handle submission error (e.g., show an error message)
        // console.error("Error submitting workflow:", await response.text());
        setSnackbarOpen(true);
        setSnackbarMessage(response?.data?.message || "Failed to submit workflow. Please try again.");
        setSeverity("success")
        navigate("/")
      }
    } catch (error) {
      console.error("Error submitting workflow:", error);
      setSnackbarOpen(true);
      setSnackbarMessage(error?.response?.data?.message.join(", ") || "Failed to submit workflow. Please try again.");
      setSeverity("error")
    } finally {
      setSubmitting(false);
    }
  };
  const edgeIds = [];

  const handleListItemDrop = (event) => {
    event.preventDefault();
    const nodeId = event.dataTransfer.getData("text/plain");
    const newList = [...nodes];
    const newIndex = parseInt(event.target.dataset.index);

    if (!isNaN(newIndex)) {
      const draggedNodeIndex = nodes.findIndex((node) => node.id === nodeId);
      [newList[draggedNodeIndex], newList[newIndex]] = [
        newList[newIndex],
        newList[draggedNodeIndex],
      ];

      // Adjust edges based on new node order
      setEdges((prevEdges) =>
        prevEdges.map((edge) => {
          const sourceIndex = getNodeIndex(edge.source);
          const targetIndex = getNodeIndex(edge.target);

          if (sourceIndex !== -1 && targetIndex !== -1) {
            // Update source/target of edges with reordered nodes
            return {
              ...edge,
              source: newList[sourceIndex].id,
              target: newList[targetIndex].id,
            };
          } else {
            return edge;
          }
        })
      );

      setNodes(newList);
    }
  };

  const getNodeIndex = (nodeId) => {
    return nodes.findIndex((node) => node.id === nodeId);
  };

  const handleListItemDragStart = (event, node) => {
    event.dataTransfer.setData("text/plain", node.id);
  };
  const handleViewWorkflow = () => {
    setIsEditable(false);
  };

  const handleEditWorkflow = () => {
    setIsEditable(true);
  };
  const handleEdgeUpdate = useCallback(
    (updatedEdge) => {
      console.log(updatedEdge, "updae");
      if (updatedEdge?.type === "remove") {
        const edgeId = updatedEdge?.id;
        console.log("edge", edgeId);
        // setEdges((prevEdges) => prevEdges.filter((edge) => edge.id !== edgeId));
      }
    },
    [setEdges]
  );
  const handleEdgeClick = (event, edge) => {
    console.log("Edge clicked:", edge.id, edge);
    const sourceNode = nodes.find((node) => node.id === edge.source);
    const targetNode = nodes.find((node) => node.id === edge.target);
    console.log(sourceNode, targetNode);
    if (sourceNode && targetNode) {
      setOpenDeleteEdgeDialog({
        open: true,
        sourceLabel: sourceNode.data.label,
        targetLabel: targetNode.data.label,
        edgeId: edge.id,
      });
    }
    // Implement edge click functionality here, such as showing a dialog or performing an action
  };

  const handleOpenWorkflowTitleDialog = () => {
    console.log(nodes, edges)
    setOpenWorkflowTitleDialog(true);
  };

  const handleCloseWorkflowTitleDialog = () => {
    setOpenWorkflowTitleDialog(false);
  };
  const handleWorkflowTitleSubmit = async (values) => {
    console.log(values, "values")
    const { workflowTitle } = values;
    if (!workflowTitle || workflowTitle?.length <= 0) {
      setSnackbarOpen(true)
      setSnackbarMessage("Please enter the Workflow Title")
      setSeverity("error")
    }
    else {
      await onSubmit(workflowTitle);
      handleCloseWorkflowTitleDialog();
      navigate("/")
    }
  };
  const listFunction = (nodes, edges) => {
    const visitedNodes = new Set(); // Track visited nodes
    // Map to store parent-child relationships
    const parentChildMap = {};

    // Build the parent-child map
    edges.forEach(edge => {
      const parent = edge.source;
      const child = edge.target;
      if (parentChildMap[parent]) {
        parentChildMap[parent] = [parentChildMap[parent], child]
      } else
        parentChildMap[parent] = child;
    });

    // Find the root node (the one that doesn't appear as a child)
    let rootNode = null;
    edges.forEach(edge => {
      const source = edge.source;
      if (!Object.values(parentChildMap).flat().includes(source)) {
        rootNode = source;
      }
    });

    // Traverse the flow from the root node
    let currentNode = rootNode;
    while (currentNode) {
      if (typeof currentNode === 'object') {
        currentNode.map((item) => {
          if (!visitedNodes.has(item)) { // Check if visited before processing
            visitedNodes.add(item); // Mark as visited
            edgeIds.push(item);
            currentNode = parentChildMap[item];
          }
        });
      } else {
        if (!visitedNodes.has(currentNode)) { // Check if visited before processing
          visitedNodes.add(currentNode);
          edgeIds.push(currentNode);
          currentNode = parentChildMap[currentNode];
        } else {
          // Handle the scenario where a node has already been visited (cycle detected)
          console.warn("Cycle detected in node:", currentNode);
          currentNode = null; // Stop traversing this branch as it's a cycle
        }
      }
    }
    const idMap = new Map();
    edgeIds.forEach((id, index) => idMap.set(id, index));
    nodes.sort((a, b) => {
      const aIndex = idMap.get(a.id);
      const bIndex = idMap.get(b.id);
      return aIndex - bIndex;
    });
    setNodes(nodes)
    console.log(nodes, "nodes")
  }

  const renderListItems = () => {
    return (
      <List>
        {nodes.map((node, index) => (
          <ListItem
            key={node.id}
            draggable
            onDragStart={(event) => handleListItemDragStart(event, node)}
            onDrop={handleListItemDrop}
            onDragOver={(event) => event.preventDefault()}
            data-index={index}
            selected={clickedNodeId === node.id}
            onClick={() => handleNodeClick(node)}
          >
            <IconButton edge="start" style={{ color: "black" }}>
              <DragIndicatorIcon />
            </IconButton>
            <ListItemText primary={node.data.label} />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                onClick={() => handleEditNode(node.id, node.data.label)}
                disabled={submitting}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                edge="end"
                onClick={() => handleDeleteNode(node.id)}
                disabled={submitting}
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    );
  };

  useEffect(() => {
    listFunction(nodes, edges)
    setRenderedListItems(renderListItems());
  }, [nodes, edges])

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <IconButton color="inherit" onClick={() => navigate("/")}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            My Workflow
          </Typography>
          <Button
            onClick={handleViewWorkflow}
            disabled={!isEditable}
            variant="outlined"
            style={{ color: "white", borderColor: 'black', marginRight: '5px' }}
          >
            View Workflow
          </Button>
          <Button
            onClick={handleEditWorkflow}
            disabled={isEditable}
            variant="outlined"
            style={{ color: "white", borderColor: 'black' }}
          >
            Edit Workflow
          </Button>
        </Toolbar>
      </AppBar>
      {!!isEditable ? (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
          }}
        >
          <div
            style={{
              width: 250,
              borderRight: "1px solid #ddd",
              padding: 10,
              height: "91vh",
              overflowY: "scroll",
            }}
          >
            <div>
              <Button variant="outlined" onClick={handleAddNode} disabled={submitting}>
                <AddIcon />
                Add Step
              </Button>
            </div>
            {renderedListItems}
            <div>
              <Button variant="contained" color="primary" onClick={handleOpenWorkflowTitleDialog} disabled={submitting}>
                Submit
              </Button>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "space-between",
              height: "91vh",
              alignItems: "start",
            }}
          >
            <ReactFlowProvider>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={handleNodeClick}
                onEdgeClick={handleEdgeClick}
                onEdgeUpdate={handleEdgeUpdate}
                style={{ backgroundColor: "#f5f5f5" }}
                ref={reactFlowRef}
                layoutAlgorithm="RIGHT"
              >
                <Controls />
                <Background variant="dots" />
              </ReactFlow>
            </ReactFlowProvider>
            <Dialog
              open={openDeleteEdgeDialog?.open} // Check for nullish value before accessing open property
              onClose={() => setOpenDeleteEdgeDialog({ open: false })}
            >
              <DialogTitle>Delete Edge</DialogTitle>
              <DialogContent>
                <p>
                  Are you sure you want to delete the edge from "
                  {openDeleteEdgeDialog?.sourceLabel}" to "
                  {openDeleteEdgeDialog?.targetLabel}"?
                </p>
                <p>Enter "DELETE" to proceed</p>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Confirmation"
                  type="text"
                  fullWidth
                  value={deleteConfirmation}
                  onChange={(event) =>
                    setDeleteConfirmation(event.target.value)
                  }
                />
              </DialogContent>
              <DialogActions>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setOpenDeleteEdgeDialog({ open: false })}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    const edgeId = openDeleteEdgeDialog?.edgeId;
                    if (deleteConfirmation === "DELETE") {
                      setEdges((prevEdges) =>
                        prevEdges.filter((e) => e.id !== edgeId)
                      );
                      setOpenDeleteEdgeDialog({ open: false });
                    } else {
                      setDeleteConfirmationError(true);
                      setSnackbarOpen(true);
                      setSnackbarMessage("Delete unsuccessful");
                      setSeverity("error")
                    }
                  }}
                  color="primary"
                >
                  PROCEED
                </Button>
              </DialogActions>
            </Dialog>

            {/* {clickedNodeId && (
              <ListItemSecondaryAction>
                <span>{clickedNodeId}</span>
                <Button variant="contained" size="small" endIcon={<AddIcon />}>
                  Add Form
                </Button>
              </ListItemSecondaryAction>
            )} */}
          </div>
        </div>
      ) : (
        <div style={{ width: "100%", height: 500 }}>
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              //   onNodesChange={onNodesChange}
              //   onEdgesChange={onEdgesChange}
              //   onConnect={onConnect}
              //   onNodeClick={handleNodeClick}
              style={{ backgroundColor: "#f5f5f5" }}
              ref={reactFlowRef}
              layoutAlgorithm="RIGHT"
            >
              <Controls />
              <Background variant="dots" />
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      )}

      <Dialog
        open={openAddNodeDialog}
        onClose={() => setOpenAddNodeDialog(false)}
      >
        <DialogTitle>Add Node</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Label"
            type="text"
            fullWidth
            value={selectedNodeLabel}
            onChange={(event) => setSelectedNodeLabel(event.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="error" onClick={() => setOpenAddNodeDialog(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSubmitAddNode} disabled={!selectedNodeLabel}>
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openEditNodeDialog}
        onClose={() => setOpenEditNodeDialog(false)}
      >
        <DialogTitle>Edit Node</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Label"
            type="text"
            fullWidth
            value={selectedNodeLabel}
            onChange={(event) => setSelectedNodeLabel(event.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="error" onClick={() => setOpenEditNodeDialog(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSubmitEditNode} disabled={!selectedNodeLabel}>
            Update
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={severity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      {openWorkflowTitleDialog ?
        <DynamicDialog
          title="Enter Workflow Title"
          initialValues={{ workflowTitle: '' }}
          onSubmit={handleWorkflowTitleSubmit}
          onClose={handleCloseWorkflowTitleDialog}
          submitButtonLabel="Submit"
          isOpen={openWorkflowTitleDialog}
        /> : ""
      }
    </div>
  );
}

export default WorkflowBuilder;
