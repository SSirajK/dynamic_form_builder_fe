import { AppBar, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, Toolbar, Typography } from '@mui/material'
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ViewForm from '../ViewForm';

const WorkflowForms = () => {
    const location = useLocation();
    const workflow = location.state?.workflow;
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([])
    const navigate = useNavigate();
    const [clickedNodeId, setClickedNodeId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [values, setValues] = useState({ node: "" })
    const [selectedForm, setSelectedForm] = useState(null)
    const [state, setState] = useState(null)
    const [renderedForm, setRenderedForm] = useState(null)
    const [submitted, setSubmitted] = useState(null)

    const fetchAvailableForms = async (node) => {
        setIsLoading(true)
        try {
            const token = sessionStorage.getItem("authToken");

            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };
            const response = await axios.get(`http://localhost:6004/workflow-revised/mapping/?node_id=${node.node_id}&workflow_id=${workflow?.id}`, config);

            const NodeFormResponse = response?.data?.data;
            setSelectedForm(NodeFormResponse?.masterFormBuilder)
            setState({ selectedForm: NodeFormResponse?.masterFormBuilder, viewUserData: false, viewMetadata: false })
            // setIsLoading(false)
        } catch (error) {
            // setIsLoading(false)
            console.error('Error fetching forms:', error);
            throw error;
        }
    };

    const renderForm = () => {
        console.log(state, "inside the render form")
        return <ViewForm
            selectedForm={selectedForm}
            viewMetadata={false}
            viewUserData={false}
        />
    }

    useEffect(() => {
        setRenderedForm(renderForm())
        setIsLoading(false)
        setSubmitted(false)
    }, [state, selectedForm, submitted])

    const handleNodeClick = async (node) => {
        console.log(node, "oas")
        setClickedNodeId(node.id);
        setValues({ node: node.node_id })
        await fetchAvailableForms(node)
        // if (node.isDeletable) {
        //   handleDeleteNode(node.id);
        // }
    };

    const edgeIds = [];

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
                setClickedNodeId(parsedNodes[0]?.id)
                await handleNodeClick(parsedNodes[0])
                setIsLoading(false);
            } catch (error) {
                console.error("Error fetching workflow data:", error);
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSubmitView = () => {
        console.log("this function is called and changed")
        setSubmitted(true)
    }

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
                </Toolbar>
            </AppBar>
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
                        height: "82.5vh",
                        overflowY: "scroll",
                    }}
                >
                    <List>
                        {nodes.map((node, index) => (
                            <ListItem
                                sx={{ textAlign: "center !important" }}
                                key={node.id}
                                draggable={false}
                                data-index={index}
                                selected={clickedNodeId === node.id}
                            >
                                <ListItemText onClick={() => { handleNodeClick(node) }}
                                    primary={node.data.label} />
                                <div>
                                    <ListItemSecondaryAction>
                                    </ListItemSecondaryAction>
                                </div>
                            </ListItem>
                        ))}
                    </List>
                </div>
                {isLoading ? (
                    <Typography>Loading form...</Typography>
                ) : (
                    selectedForm && !submitted && (
                        <ViewForm selectedForm={selectedForm} viewMetadata={false} viewUserData={false} handleSubmitView={handleSubmitView} />
                    )
                )}
            </div>
        </div>
    )
}

export default WorkflowForms