import React, { useEffect } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  MarkerType,
  Controls,
} from '@xyflow/react';
import yaml from 'yaml';
import dagre from 'dagre';
import '@xyflow/react/dist/style.css';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 200;
const nodeHeight = 50;

const applyDagreLayout = (nodes, edges) => {
  dagreGraph.setGraph({ rankdir: 'TB' }); // Top-to-Bottom layout

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
    return node;
  });
};

const FlowView = ({ spec }) => {
  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);

  useEffect(() => {
    let parsedSpec = {};
    try {
      parsedSpec = yaml.parse(spec);
    } catch (e) {
      console.error('Failed to parse spec:', e);
      return;
    }

    if (!parsedSpec.info || !parsedSpec.paths) {
      console.error('Invalid OpenAPI spec');
      return;
    }

    // Create API node
    const apiNode = {
      id: 'api',
      type: 'default',
      data: { label: parsedSpec.info.title || 'API' },
      position: { x: 0, y: 0 }, // Position will be set by dagre
      draggable: true,
      sourcePosition: 'bottom',
      targetPosition: 'top',
      style: {
        color: 'darkgrey',
      },
    };

    // Group operations by the first part of the URL
    const groupedPaths = {};
    Object.entries(parsedSpec.paths).forEach(([path, operations]) => {
      const basePath = path.split('/')[1] || '/'; // Get the first part of the path
      if (!groupedPaths[basePath]) {
        groupedPaths[basePath] = [];
      }
      groupedPaths[basePath].push({ path, operations });
    });

    // Create parent nodes for each base path
    const parentNodes = Object.keys(groupedPaths).map((basePath, index) => ({
      id: `parent-${basePath}`,
      type: 'default',
      data: { label: `/${basePath}` },
      position: { x: 0, y: 0 }, // Position will be set by dagre
      draggable: true,
      sourcePosition: 'bottom',
      targetPosition: 'top',
      style: {
        color: 'darkblue',
      },
    }));

    // Create operation nodes
    const operationNodes = [];
    const edges = [];

    parentNodes.forEach((parentNode) => {
      const basePath = parentNode.id.replace('parent-', '');
      groupedPaths[basePath].forEach(({ path, operations }, index) => {
        Object.entries(operations).forEach(([method, operation], opIndex) => {
          const operationNode = {
            id: `operation-${basePath}-${index}-${opIndex}`,
            type: 'default',
            data: {
              label: `${method.toUpperCase()} - ${path} : ${operation.summary || ''}`,
            },
            position: { x: 0, y: 0 }, // Position will be set by dagre
            draggable: true,
            style: {
              color: 'darkgrey',
            },
          };
          operationNodes.push(operationNode);

          // Create edge from parent node to operation node
          edges.push({
            id: `edge-${parentNode.id}-${operationNode.id}`,
            source: parentNode.id,
            target: operationNode.id,
            type: 'default',
            markerEnd: {
              type: MarkerType.Arrow,
            },
            animate: true,
          });
        });
      });

      // Create edge from API node to parent node
      edges.push({
        id: `edge-api-${parentNode.id}`,
        source: 'api',
        target: parentNode.id,
        type: 'default',
        markerEnd: {
          type: MarkerType.Arrow,
        },
        animate: true,
      });
    });

    // Apply dagre layout
    const laidOutNodes = applyDagreLayout(
      [apiNode, ...parentNodes, ...operationNodes],
      edges
    );

    // Set nodes and edges
    setNodes(laidOutNodes);
    setEdges(edges);
  }, [spec, setNodes, setEdges]);

  return (
    <div className="h-full w-full">
      <ReactFlow 
        nodes={nodes} 
        edges={edges} 
        fitView 
        className="react-flow" 
      >
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default FlowView;
