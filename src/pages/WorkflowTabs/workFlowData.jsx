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
    CircularProgress,
    ListItemSecondaryAction,
    TextField,
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions,
    Alert,
    Snackbar,
    Tabs,
    Tab,
    RadioGroup,
    Radio,
    Card,
    CardContent,
    FormControlLabel,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
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
import { useLocation, useNavigate } from "react-router-dom";
import { event } from "jquery";

const initialNodes = [
    {
        id: "1",
        position: { x: 250, y: 100 },
        data: { label: "Start" },
        isDeletable: false,
        style: {
            display: "flex",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            alignItems: "center",
            justifyContent: "center",
        },
    },
    {
        id: "2",
        position: { x: 250, y: 250 },
        data: { label: "End" },
        isDeletable: false,
        style: {
            display: "flex",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            alignItems: "center",
            justifyContent: "center",
        },
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
const initialEdges = [
    {
        id: "edge-1",
        source: "1",
        target: "2",
        ...edgeOptions,
    },
];
let positionY = 100;

const connectionLineStyle = { stroke: "black" };

const Workflow = () => {
    const location = useLocation();
    const workflow = location.state?.workflow;
    const viewData = location.state?.viewData;
    console.log(workflow, "worflow dwtails", viewData)
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [openAddNodeDialog, setOpenAddNodeDialog] = useState(false);
    const [openEditNodeDialog, setOpenEditNodeDialog] = useState(false);
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [selectedNodeLabel, setSelectedNodeLabel] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [isEditable, setIsEditable] = useState(true);
    const [forms, setForms] = useState([]);
    const [actions, setActions] = useState([]);
    const [assignedForm, setAssignedForm] = useState({});
    const [severity, setSeverity] = useState("error");
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [clickedNodeId, setClickedNodeId] = useState(null);
    const [openDeleteEdgeDialog, setOpenDeleteEdgeDialog] = useState(null);
    const [openFormAssignDialog, setOpenFormAssignDialog] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [renderedListItems, setRenderedListItems] = useState(null);
    const [values, setValues] = useState({ formName: "", masterFormBuilder: "", node: "", workflow: workflow?.id });
    const [activeTab, setActiveTab] = useState(0);
    const [deeleteConfirmationError, setDeleteConfirmationError] =
        useState(false);
    const [openWorkflowTitleDialog, setOpenWorkflowTitleDialog] = useState(false);
    const [validationFields, setValidationFields] = useState({});
    const navigate = useNavigate();
    const [connectedNodes, setConnectedNodes] = useState([])

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

    const onConnect = async (params) => {
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
        await listFunction(nodes, edges)
        setRenderedListItems(renderListItems())
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    const handleNodeClick = async (event, node) => {
        console.log(event, node, "oas")
        if (node) {
            setClickedNodeId(node.id);
            setValues({ ...values, node: node.node_id })
            await fetchAvailableForms(node)
            console.log(node, "selected node")
        } else {
            setClickedNodeId(event.id);
            setValues({ ...values, node: event.node_id })
            await fetchAvailableForms(event)
        }
        // if (node.isDeletable) {
        //   handleDeleteNode(node.id);
        // }
    };

    const onSave = async (workflowTitle) => {
        setSubmitting(true);

        // Implement your logic to submit the workflow data (nodes and edges) to your server
        // You can use the fetch API or any other suitable method
        const token = sessionStorage.getItem('authToken');
        const config = {
            headers: { Authorization: `Bearer ${token}` },
        };

        try {
            const response = await axios
                .patch(
                    `http://localhost:6004/workflow-revised/${workflow.id}`,
                    { workflowTitle, body: { nodes, edges } },
                    config,
                )

            if (response.ok) {
                // Handle successful submission (e.g., clear the workflow, show a success message)
                console.log("Workflow submitted successfully!");
                setSnackbarOpen(true);
                setSeverity("success")
                setSnackbarMessage(response?.data?.message.join(", ") || "workflow edited successfully");
                navigate('/')
            } else {
                // Handle submission error (e.g., show an error message)
                // console.error("Error submitting workflow:", await response.text());
                setSnackbarOpen(true);
                setSeverity("success")
                setSnackbarMessage(response?.data?.message.join(", ") || "Failed to edit workflow. Please try again.");
                navigate("/")
            }
        } catch (error) {
            console.error("Error submitting workflow:", error);
            setSnackbarOpen(true);
            setSeverity("error")
            setSnackbarMessage(error?.response?.data?.message.join(", ") || "Failed to edit workflow. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };


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
        setOpenWorkflowTitleDialog(true);
    };

    const handleCloseWorkflowTitleDialog = () => {
        setOpenWorkflowTitleDialog(false);
    };
    const handleWorkflowTitleSubmit = async (values) => {
        const { workflowTitle } = values;
        if (!workflowTitle || workflowTitle?.length <= 0) {
            setSnackbarOpen(true)
            setSeverity("error")
            setSnackbarMessage("Please enter the Workflow Title")
        }
        else {
            await onSave(workflowTitle);
            handleCloseWorkflowTitleDialog();
        }
    };

    const booleanConversion = (conversionData) => {
        return conversionData.map((obj) => {
            return Object.keys(obj).reduce((acc, key) => {
                const value = obj[key];
                if (typeof value === "string" && value.toLowerCase() === "true") {
                    acc[key] = true;
                } else if (
                    typeof value === "string" &&
                    value.toLowerCase() === "false"
                ) {
                    acc[key] = false;
                } else if (
                    typeof value === "string" &&
                    value.toLowerCase() === "null"
                ) {
                    acc[key] = null;
                } else {
                    acc[key] = value;
                }
                return acc;
            }, {});
        });
    };
    const edgeIds = [];

    const isJson = (item) => {
        let value = typeof item !== "string" ? JSON.stringify(item) : item;
        try {
            value = JSON.parse(value);
        } catch (e) {
            return false;
        }

        return typeof value === "object" && value !== null;
    };
    useEffect(() => {
        const fetchData = async () => {
            const token = sessionStorage.getItem("authToken");

            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };
            try {
                const response = await axios.get(`http://localhost:6004/workflow-revised/${workflow.id}`, config);
                console.log(response.data?.edges, "response")
                const workflowData = response.data;
                const parsedNodes = workflowData?.nodes?.map((item) => {
                    // Create a new object to hold parsed values
                    const parsedItem = {};
                    // Iterate over each key-value pair in the item
                    for (const [key, value] of Object.entries(item)) {
                        if (isJson(value)) {
                            try {
                                // Parse JSON if it's a string and valid JSON
                                parsedItem[key] = JSON.parse(value);
                            } catch (error) {
                                // Handle parsing errors or leave as original value
                                parsedItem[key] = value;
                                console.error(
                                    `Error parsing JSON for key ${key}: ${error.message}`
                                );
                            }
                        } else if (value === "true") {
                            parsedItem[key] = true;
                        } else if (value === "false") {
                            parsedItem[key] = false;
                        } else if (value === "null") {
                            parsedItem[key] = null;
                        } else {
                            parsedItem[key] = value;
                        }
                    }
                    return parsedItem;
                });
                const parsedEdges = workflowData?.edges?.map((item) => {
                    // Create a new object to hold parsed values
                    const parsedItem = {};

                    // Iterate over each key-value pair in the item
                    for (const [key, value] of Object.entries(item)) {
                        if (isJson(value)) {
                            try {
                                // Parse JSON if it's a string and valid JSON
                                parsedItem[key] = JSON.parse(value);
                            } catch (error) {
                                // Handle parsing errors or leave as original value
                                parsedItem[key] = value;
                                console.error(
                                    `Error parsing JSON for key ${key}: ${error.message}`
                                );
                            }
                        } else if (value === "true") {
                            parsedItem[key] = true;
                        } else if (value === "false") {
                            parsedItem[key] = false;
                        } else if (value === "null") {
                            parsedItem[key] = null;
                        } else {
                            parsedItem[key] = value;
                        }
                    }
                    return parsedItem;
                });
                listFunction(parsedNodes, parsedEdges);
                setNodes(parsedNodes);
                setEdges(parsedEdges);
                setIsLoading(false);
            } catch (error) {
                console.error("Error fetching workflow data:", error);
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const listFunction = (nodes, edges) => {
        const visitedNodes = new Set();

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
        console.log(nodes, "node inside the render")
        return (
            <List>
                {nodes.map((node, index) => (
                    <ListItem
                        sx={{ textAlign: `${viewData === true ? "center !important" : ""}` }}
                        key={node.id}
                        draggable={!viewData}
                        {...!viewData && {
                            onDragStart: (event) => handleListItemDragStart(event, node),
                            onDrop: handleListItemDrop,
                            onDragOver: (event) => event.preventDefault()
                        }}
                        data-index={index}
                        selected={clickedNodeId === node.id}
                    >
                        {!viewData ? <div><IconButton edge="start" style={{ color: "black" }}>
                            <DragIndicatorIcon />
                        </IconButton></div> : ""}
                        <ListItemText onClick={() => { !viewData && handleNodeClick(node) }}
                            primary={node.data.label} />
                        {!viewData ? <div>
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
                        </div> : ""}
                    </ListItem>
                ))}
            </List>
        );
    };
    useEffect(() => {
        listFunction(nodes, edges)
        setRenderedListItems(renderListItems());
    }, [nodes, edges]);

    const getDefaultValidationFields = (action) => {
        switch (action.type) {
            case "array":
                return [{}]; // Initial default validation field for array type
            case "string":
                return [{ operator: "", value: "", node_id: "" }]; // Initial default validation field for string type
            case "number":
                return [{ operator: "", value: "", node_id: "" }]; // Initial default validation field for number type
            default:
                return [];
        }
    };

    const fetchAvailableForms = async (node) => {
        setIsLoading(true)
        try {
            const token = sessionStorage.getItem("authToken");

            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };
            const response = await axios.get(`http://localhost:6004/workflow-revised/mapping/?node_id=${node.node_id}&workflow_id=${workflow?.id}`, config);

            const NodeFormResponse = response?.data?.data;
            // setIsLoading(false)
            if (NodeFormResponse) {
                console.log("coming inside this")
                const resactions = [
                    {
                        field_title: "Account Action",
                        field_id: "E1B36839-D6B8-4C36-8ACD-DEDB6326A601",
                        options: [{
                            value: "savings_account",
                        },
                        {
                            value: "current_account",
                        }],
                        type: "array",
                    },
                    {
                        field_title: "Income",
                        field_id: "9DE43710-7248-486A-A0B9-7A6B059B5181",
                        type: "number"
                    },
                    {
                        field_title: "Job Role",
                        field_id: "job_roleid",
                        type: "string",
                    }
                ]
                // Find the edges where the source matches the selected node's id
                const targetEdges = edges.filter(edge => edge.source === node.id);

                // Get the target nodes from the nodes array based on the target edges
                const connectedNodeIds = targetEdges.map(edge => edge.target);
                const connectedNodes = nodes.filter(n => connectedNodeIds.includes(n.id));
                setConnectedNodes(connectedNodes)
                setActions(resactions)
                const initialValidationFields = {};
                resactions.forEach(action => {
                    if (action.options && action.options.length > 0) {
                        // Initialize with as many validation fields as options and set values accordingly
                        initialValidationFields[action.field_id] = action.options.map(option => ({
                            operator: "",
                            value: option.value,
                            node_id: ""
                        }));
                    } else {
                        // Initialize with a single default validation field
                        initialValidationFields[action.field_id] = getDefaultValidationFields(action);
                    }
                });
                setValidationFields(initialValidationFields);
            }
            else {
                setActions([])
            }
            console.log(actions, "actions")
            setAssignedForm(NodeFormResponse?.masterFormBuilder)
        } catch (error) {
            // setIsLoading(false)
            console.error('Error fetching forms:', error);
            throw error;
        }
        try {
            const token = sessionStorage.getItem("authToken");

            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };
            const response = await axios.get(`http://localhost:6004/form-builder`, config);

            const data = response?.data?.data;
            setIsLoading(false)
            setForms(data);
            setOpenFormAssignDialog(true)
        } catch (error) {
            setIsLoading(false)
            console.error('Error fetching forms:', error);
            throw error; // Re-throw the error for handling in the AssignFormTab component
        }
    };

    const handleTabChange = (event, newActiveTab) => {
        console.log(activeTab, "activeTab", newActiveTab);
        setActiveTab(newActiveTab);
    };

    if (isLoading) {
        return <div><CircularProgress /></div>;
    }
    const handleFormSubmitAssign = async (valueData) => {
        if (valueData.masterFormBuilder) {
            setIsLoading(true)
            try {
                const token = sessionStorage.getItem("authToken");

                const config = {
                    headers: { Authorization: `Bearer ${token}` },
                };
                const response = await axios.post(`http://localhost:6004/workflow-revised/mapping`, { workflow_id: valueData.workflow, node_id: valueData.node, form_builder_id: valueData.masterFormBuilder }, config);
                const data = response?.data?.data;
                console.log(data, "data")
                setOpenFormAssignDialog(false)
                setSnackbarOpen(true)
                setSnackbarMessage(response?.data?.message || "form assigned to workflow")
                setSeverity("success")
                setIsLoading(false)
            } catch (error) {
                setIsLoading(false)
                setSnackbarOpen(true)
                setSnackbarMessage(error?.response?.data?.message || "failed to assign form")
                setSeverity("error")
                console.error('Error fetching forms:', error);
            }
        } else {
            setSnackbarOpen(true)
            setSeverity("error")
            setSnackbarMessage("Please select a form to assign")
        }
        console.log('Submitted data (Assign):', valueData);
    };

    const handleFormSubmitCreate = async (data) => {
        console.log(data, "create submit")
        navigate(`/form`, {
            state: {
                workflow: data.workflow,
                node: data.node,
            },
        });
        console.log('Submitted data (Create):', data);
    };

    const handleActionSubmit = async (values) => {
        console.log(values, "values")
        const sanitizedValues = { ...values };
        Object.keys(sanitizedValues).forEach((key) => {
            sanitizedValues[key] = sanitizedValues[key].map((field) => {
                const { isNew, ...rest } = field;
                return rest;
            });
        });
        if (Object.keys(sanitizedValues).length <= 0 || Object.values(sanitizedValues).some(value => value?.length <= 0)) {
            setSnackbarOpen(true)
            setSnackbarMessage("Please add validations to submit")
            setSeverity("error");
        } else {
            const hasInvalidArray = Object.values(sanitizedValues).some(value => {
                if (Array.isArray(value) && value.length > 0) {
                    // Check if any object in the array has less than 3 keys
                    return value.some(obj => Object.keys(obj).length < 3);
                }
                return false;
            });
            if (hasInvalidArray) {
                setSnackbarOpen(true)
                setSnackbarMessage("Enter all fields in validation to submit")
                setSeverity("error");
            } else {
                if (Object.values(sanitizedValues).some((fields) => fields.some((field) => Object.values(field).some((value) => !value)))) {
                    setSnackbarOpen(true);
                    setSnackbarMessage("Please fill in all field values to submit");
                    setSeverity("error");
                    return;
                } else {
                    console.log(sanitizedValues, "sanitized values")
                }
            }
        }
    }

    const handleFormSubmit = async () => {
        if (activeTab === 0) {
            await handleFormSubmitAssign(values); // Call submit function with selectedForm
        } else if (activeTab === 1) {
            await handleFormSubmitCreate(values); // Call submit function with formName
        } else {
            await handleActionSubmit(validationFields);
        }
        setValues({ ...values, formName: "", masterFormBuilder: "" })
    };

    const handleCloseFormDialog = () => {
        setActiveTab(0)
        setOpenFormAssignDialog(false)
        setValidationFields({})
        setValues({ ...values, formName: "", masterFormBuilder: "" })
    }

    const renderValidationFields = (actionId) => {
        if (!validationFields[actionId]) return null;

        return validationFields[actionId].map((validation, index) => (
            <Grid key={index} container py={1} px={0}>
                <Grid direction="row" item>
                    {renderValidationFieldsForType(actionId, validation, index)}
                </Grid>
                {validation.isNew && (
                    <Button onClick={() => handleRemoveValidation(actionId, index)}>X</Button>
                )}
            </Grid>
        ));
    };

    const handleValidationFieldChange = (actionId, index, fieldName, value) => {
        const updatedValidationFields = { ...validationFields };
        updatedValidationFields[actionId][index][fieldName] = value;
        setValidationFields(updatedValidationFields);
    };

    const renderValidationFieldsForType = (actionId, validation, index) => {

        switch (actions.find(action => action.field_id === actionId).type) {
            case 'array':
                return (
                    <Grid container spacing={2} alignItems="center">
                        <Grid item>
                            <Select sx={{ width: "150px" }} value={validation.operator || ''} defaultValue="equal"
                                onChange={(e) => handleValidationFieldChange(actionId, index, 'operator', e.target.value)}
                            >
                                <MenuItem value="equal">Equal</MenuItem>
                                <MenuItem value="not_equal">Not Equal</MenuItem>
                            </Select>
                        </Grid>
                        <Grid item>
                            <Select sx={{ width: "150px" }}
                                value={validation.value || ''}
                                onChange={(e) => handleValidationFieldChange(actionId, index, 'value', e.target.value)}
                                disabled={!validation?.isNew}
                            >
                                {actions.find(action => action.field_id === actionId).options.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.value.replace(/_/g, ' ').split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Grid>
                        <Grid item>
                            <Select sx={{ width: "150px" }}
                                value={validation.node_id || ''}
                                onChange={(e) => handleValidationFieldChange(actionId, index, 'node_id', e.target.value)}>
                                {connectedNodes.map((node) => (
                                    <MenuItem key={node.node_id} value={node.node_id}>
                                        {node?.data?.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Grid>
                        {/* <Button onClick={() => handleRemoveValidation(actionId, index)}>X</Button> */}
                    </Grid>
                );
            case 'string':
                return (
                    <Grid container spacing={2} alignItems="center">
                        <Grid item>
                            <Select sx={{ width: "150px" }}
                                value={validation.operator || ''}
                                onChange={(e) => handleValidationFieldChange(actionId, index, 'operator', e.target.value)}
                                defaultValue="equal">
                                <MenuItem value="equal">Equal</MenuItem>
                                <MenuItem value="not_equal">Not Equal</MenuItem>
                            </Select>
                        </Grid>
                        <Grid item>
                            <TextField
                                value={validation.value || ''}
                                onChange={(e) => handleValidationFieldChange(actionId, index, 'value', e.target.value)}
                                sx={{ width: "150px" }} label="Value" />
                        </Grid>
                        <Grid item>
                            <Select sx={{ width: "150px" }}
                                value={validation.node_id || ''}
                                onChange={(e) => handleValidationFieldChange(actionId, index, 'node_id', e.target.value)}>
                                {connectedNodes.map((node) => (
                                    <MenuItem key={node.node_id} value={node.node_id}>
                                        {node?.data?.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Grid>
                        {/* <Button onClick={() => handleRemoveValidation(actionId, index)}>X</Button> */}
                    </Grid>
                );
            case 'number':
                return (
                    <Grid container spacing={2} alignItems="center">
                        <Grid item>
                            <Select sx={{ width: "150px" }} value={validation.operator || ''}
                                onChange={(e) => handleValidationFieldChange(actionId, index, 'operator', e.target.value)}
                                defaultValue="equal">
                                <MenuItem value="equal">Equal</MenuItem>
                                <MenuItem value="not_equal">Not Equal</MenuItem>
                                <MenuItem value="gt">Greater Than</MenuItem>
                                <MenuItem value="gte">Greater Than or Equal</MenuItem>
                                <MenuItem value="lt">Less Than</MenuItem>
                                <MenuItem value="lte">Less Than or Equal</MenuItem>
                            </Select>
                        </Grid>
                        <Grid item>
                            <TextField label="Value" type="number"
                                sx={{
                                    width: "150px",
                                    "input::-webkit-outer-spin-button, input::-webkit-inner-spin-button": {
                                        WebkitAppearance: "none",
                                        margin: 0,
                                    },
                                    "input[type=number]": {
                                        MozAppearance: "textfield",
                                    },
                                }}
                                value={validation.value || ''}
                                onChange={(e) => handleValidationFieldChange(actionId, index, 'value', e.target.value)} />
                        </Grid>
                        <Grid item>
                            <Select sx={{ width: "150px" }}
                                value={validation.node_id || ''}
                                onChange={(e) => handleValidationFieldChange(actionId, index, 'node_id', e.target.value)}>
                                {connectedNodes.map((node) => (
                                    <MenuItem key={node.node_id} value={node.node_id}>
                                        {node?.data?.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Grid>
                        {/* <Button onClick={() => handleRemoveValidation(actionId, index)}>X</Button> */}
                    </Grid>
                );
            default:
                return null;
        }
    };

    const handleAddValidation = (actionId) => {
        const updatedValidationFields = { ...validationFields };
        updatedValidationFields[actionId] = [...(validationFields[actionId] || []), { isNew: true }];
        setValidationFields(updatedValidationFields);
    };

    const handleRemoveValidation = (actionId, index) => {
        const updatedValidationFields = { ...validationFields };
        updatedValidationFields[actionId] = validationFields[actionId].filter((_, i) => i !== index);
        setValidationFields(updatedValidationFields);
    };

    return (
        <div>
            <AppBar position="static">
                <Toolbar>
                    <IconButton color="inherit" onClick={() => navigate("/")}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        {workflow.workflow_title}
                    </Typography>
                    {!viewData ? (<div><Button
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
                        </Button></div>) : ""}
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
                        {!viewData ? <div>
                            <Button variant="outlined" onClick={handleAddNode} disabled={submitting}>
                                <AddIcon />
                                Add Step
                            </Button>
                        </div> : ""}
                        {renderedListItems}
                        {!viewData ? <div>
                            <Button variant="contained" color="primary" onClick={handleOpenWorkflowTitleDialog} disabled={submitting}>
                                Save
                            </Button>
                        </div> : ""}
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
                                {...(!viewData && {
                                    onNodesChange: onNodesChange,
                                    onEdgesChange: onEdgesChange,
                                    onConnect: onConnect,
                                    onNodeClick: handleNodeClick,
                                    onEdgeClick: handleEdgeClick,
                                    onEdgeUpdate: handleEdgeUpdate,
                                })}
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
                                            setSeverity("error")
                                            setSnackbarMessage("Delete unsuccessful");
                                        }
                                    }}
                                    color="primary"
                                >
                                    PROCEED
                                </Button>
                            </DialogActions>
                        </Dialog>
                        {openFormAssignDialog && <DynamicDialog
                            title="Assign or Create Form"
                            initialValues={{}}
                            onSubmit={handleFormSubmit}
                            onClose={handleCloseFormDialog}
                            submitButtonLabel={activeTab === 0 ? "Assign" : activeTab === 1 ? "Create" : "Submit"}
                            isOpen={openFormAssignDialog}
                            noSubmit={activeTab === 2}
                            sx={{ minHeight: "69vh", minWidth: "50vw" }}
                            children={
                                <>

                                    <Tabs value={activeTab} onChange={handleTabChange}>
                                        <Tab key={0} label="Assign Form" />
                                        <Tab key={1} label="Create Form" />
                                        {assignedForm && <Tab key={2} label="Assigned Form" />}
                                        {actions && actions?.length > 0 && <Tab key={3} label="Actions" />}
                                    </Tabs>
                                    {activeTab === 0 && (
                                        <Grid container spacing={2} p={1}>
                                            {forms.map((form) => (
                                                <RadioGroup
                                                    value={values.masterFormBuilder}
                                                    onChange={(event) => {
                                                        setValues({ ...values, masterFormBuilder: event.target.value, formName: "" })
                                                    }}
                                                >
                                                    <FormControlLabel
                                                        key={form.id}
                                                        value={form.id}
                                                        sx={{ marginY: '20px' }}
                                                        control={<Radio />}
                                                        label={
                                                            <Card sx={{ minWidth: 275 }}>
                                                                <CardContent>
                                                                    <Typography variant="h5" component="div">
                                                                        {form.form_title}
                                                                    </Typography>
                                                                    <Typography sx={{ mb: 1.2 }} color="text.secondary">
                                                                        Created by: {form.createdBy}
                                                                    </Typography>
                                                                    <Typography variant="body2">
                                                                        Created at: {form.createdAt}
                                                                    </Typography>
                                                                </CardContent>
                                                            </Card>
                                                        }
                                                    />
                                                </RadioGroup>
                                            ))}
                                        </Grid>
                                    )}
                                    {activeTab === 1 && (
                                        <Grid container spacing={2} p={2}>
                                        </Grid>
                                    )}
                                    {
                                        activeTab === 2 && assignedForm && (
                                            <Grid container p={2}>
                                                <Card sx={{ maxWidth: 275 }}>
                                                    <CardContent>
                                                        <Typography variant="h5" component="div">
                                                            {assignedForm.form_title}
                                                        </Typography>
                                                        <Typography sx={{ mb: 1.2 }} color="text.secondary">
                                                            Created by: {assignedForm.createdBy}
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            Created at: {assignedForm.createdAt}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        )
                                    }
                                    {activeTab === 3 && actions && (
                                        <Grid container p={2}>
                                            {actions?.map((action) => (
                                                <Grid key={action.field_id} container py={1} direction="column" alignItems="start">
                                                    <Typography variant="h6">{action.field_title}</Typography>
                                                    {renderValidationFields(action.field_id)}
                                                    <Button sx={{ padding: '6px' }} variant="contained" onClick={() => handleAddValidation(action.field_id)}><AddIcon />Add Validation</Button>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    )}
                                </>
                            }
                        />}

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
                <div style={{ width: "100%", height: '93vh' }}>
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
                    initialValues={{ workflowTitle: workflow?.workflow_title || '' }}
                    onSubmit={handleWorkflowTitleSubmit}
                    onClose={handleCloseWorkflowTitleDialog}
                    submitButtonLabel="Submit"
                    isOpen={openWorkflowTitleDialog}
                    disabled={workflow?.workflow_title}
                /> : ""
            }
        </div>
    );
}

export default Workflow;
