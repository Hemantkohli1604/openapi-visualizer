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

    // Create operation nodes
    const operationNodes = Object.entries(parsedSpec.paths).map(
      ([path, operations], index) => {
        const operationKey = Object.keys(operations)[0]; // e.g., 'get', 'post'
        const operation = operations[operationKey];
        return {
          id: `operation-${index}`,
          type: 'default',
          data: { label: `${operationKey.toUpperCase()} - ${path} : ${operation.summary || ''}` },
          position: { x: 0, y: 0 }, // Position will be set by dagre
          draggable: true,
        //   sourcePosition: 'bottom',
        //   targetPosition: 'top',
          style: {
            color: 'darkgrey',
          },
        };
      }
    );

    // Create edges
    const edges = operationNodes.map((operationNode) => ({
      id: `edge-api-${operationNode.id}`,
      source: 'api',
      target: operationNode.id,
      type: 'default',
      markerEnd: {
        type: MarkerType.Arrow,
      },
      animate: true,
    }));

    // Apply dagre layout
    const laidOutNodes = applyDagreLayout([apiNode, ...operationNodes], edges);

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
