'use client';
import { create } from 'zustand';
import { Node, Edge, addEdge, applyNodeChanges, applyEdgeChanges, Connection, NodeChange, EdgeChange } from '@xyflow/react';

interface CanvasStore {
  nodes: Node[];
  edges: Edge[];
  selectedNode: Node | null;
  isDirty: boolean;

  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (node: Node) => void;
  updateNodeData: (nodeId: string, data: object) => void;
  setSelectedNode: (node: Node | null) => void;
  loadGraph: (nodes: Node[], edges: Edge[]) => void;
  markClean: () => void;
}

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  isDirty: false,

  setNodes: (nodes) => set({ nodes, isDirty: true }),
  setEdges: (edges) => set({ edges, isDirty: true }),

  onNodesChange: (changes) =>
    set({ nodes: applyNodeChanges(changes, get().nodes), isDirty: true }),

  onEdgesChange: (changes) =>
    set({ edges: applyEdgeChanges(changes, get().edges), isDirty: true }),

  onConnect: (connection) =>
    set({ edges: addEdge({ ...connection, animated: true }, get().edges), isDirty: true }),

  addNode: (node) =>
    set({ nodes: [...get().nodes, node], isDirty: true }),

  updateNodeData: (nodeId, data) =>
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
      ),
      isDirty: true,
    }),

  setSelectedNode: (node) => set({ selectedNode: node }),

  loadGraph: (nodes, edges) => set({ nodes, edges, isDirty: false }),

  markClean: () => set({ isDirty: false }),
}));
