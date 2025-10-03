import React from 'react';
import ReactFlow, { Background, BackgroundVariant, Controls, MiniMap, Node, Edge, OnNodesChange, OnEdgesChange, applyNodeChanges, applyEdgeChanges } from 'reactflow';
import 'reactflow/dist/style.css';
import type { GraphNode as KGNode, GraphEdge as KGEdge } from '../types';
import Loading from '../components/states/Loading';
import ErrorState from '../components/states/ErrorState';
import EmptyState from '../components/states/EmptyState';
import NodeDetailsDrawer from '../components/graph/NodeDetailsDrawer';
import { fetchGraph } from '../lib/mockApi';

type GraphData = {
  nodes: KGNode[];
  edges: KGEdge[];
};

type Filters = {
  document: boolean;
  topic: boolean;
  person: boolean;
  text: string;
};

function layoutNodes(nodes: KGNode[]): Node[] {
  // 3-column layout - topics on left, docs in middle, people on right
  let topicYPos = 60;
  let docYPos = 60;
  let personYPos = 60;
  const verticalSpacing = 80;

  return nodes.map<Node>((node) => {
    let xPos = 100;
    let yPos = 60;
    
    if (node.type === 'topic') {
      xPos = 100;
      yPos = topicYPos;
      topicYPos += verticalSpacing;
    } else if (node.type === 'document') {
      xPos = 450;
      yPos = docYPos;
      docYPos += verticalSpacing;
    } else {
      xPos = 800;
      yPos = personYPos;
      personYPos += verticalSpacing;
    }

    return {
      id: node.id,
      data: { label: node.label, type: node.type },
      position: { x: xPos, y: yPos },
      style: {
        border: '1px solid #e2e8f0',
        borderRadius: 6,
        padding: 8,
        background: '#ffffff',
        fontSize: 12,
      },
    };
  });
}

function toRFEdges(edges: KGEdge[]): Edge[] {
  return edges.map<Edge>((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.relation,
    animated: edge.relation === 'authored',
    style: { stroke: '#94a3b8' },
  }));
}

export default function Graph() {
  const [filters, setFilters] = React.useState<Filters>({ document: true, topic: true, person: true, text: '' });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | undefined>();
  const [graphNodes, setGraphNodes] = React.useState<KGNode[]>([]);
  const [graphEdges, setGraphEdges] = React.useState<KGEdge[]>([]);
  const [selectedNode, setSelectedNode] = React.useState<KGNode | null>(null);

  const [flowNodes, setFlowNodes] = React.useState<Node[]>([]);
  const [flowEdges, setFlowEdges] = React.useState<Edge[]>([]);

  const onNodesChange: OnNodesChange = React.useCallback(
    (changes) => setFlowNodes((nodes) => applyNodeChanges(changes, nodes)),
    []
  );
  const onEdgesChange: OnEdgesChange = React.useCallback(
    (changes) => setFlowEdges((edges) => applyEdgeChanges(changes, edges)),
    []
  );

  React.useEffect(() => {
    let isMounted = true;

    async function loadGraphData() {
      setLoading(true);
      setError(undefined);
      
      try {
        // Fetch graph data from API
        const response = await fetchGraph();
        if (!isMounted) return;
        
        if (response.error) {
          setError(response.error);
        }
        
        setGraphNodes(response.data.nodes);
        setGraphEdges(response.data.edges);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadGraphData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter + layout
  React.useEffect(() => {
    // establush visible elements
    const filteredByType = graphNodes.filter((node) => filters[node.type]);

    // Text filter with neighbor expansion:
    //    When a text query matches node labels show:
    //    - the matched nodeor nodes 
    //    - their immediate neighbors
    //    - edges incident to the matched node or nodes
    const searchText = filters.text.trim().toLowerCase();

    if (searchText) {
      // matched by label
      const matched = filteredByType.filter((node) =>
        node.label.toLowerCase().includes(searchText)
      );
      const matchedIds = new Set(matched.map((n) => n.id));

      // Collect neighbor ids from the full edge list
      const neighborIds = new Set<string>();
      for (const e of graphEdges) {
        if (matchedIds.has(e.source) || matchedIds.has(e.target)) {
          neighborIds.add(e.source);
          neighborIds.add(e.target);
        }
      }

      // final visible ids = matched + neighbors
      const visibleIds = new Set<string>();
      matchedIds.forEach((id) => visibleIds.add(id));
      neighborIds.forEach((id) => visibleIds.add(id));

      // Keep only nodes that pass type filter AND are in visibleIds
      const visibleNodes = filteredByType.filter((n) => visibleIds.has(n.id));

      // Only edges incident to matched nodes, with both endpoints visible
      const filteredEdges = graphEdges.filter(
        (e) =>
          (matchedIds.has(e.source) || matchedIds.has(e.target)) &&
          visibleIds.has(e.source) &&
          visibleIds.has(e.target)
      );

      // Layout
      setFlowNodes(layoutNodes(visibleNodes));
      setFlowEdges(toRFEdges(filteredEdges));
    } else {
      // Baseline behavior when there is no text filter:
      // show all nodes passing type filter and edges whose endpoints are visible.
      const visibleNodeIds = new Set(filteredByType.map((node) => node.id));
      const filteredEdges = graphEdges.filter(
        (edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
      );

      setFlowNodes(layoutNodes(filteredByType));
      setFlowEdges(toRFEdges(filteredEdges));
    }
  }, [graphNodes, graphEdges, filters]);

  const nodeMap = React.useMemo(() =>
    new Map(graphNodes.map((node) => [node.id, node])),
    [graphNodes]
  );

  if (loading) return <Loading count={6} />;
  if (error) return <ErrorState message={error} />;
  if (graphNodes.length === 0) return <EmptyState message="No graph data" />;

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold dark:text-slate-100">Knowledge Graph</h2>
          <p className="mt-1 text-slate-600 dark:text-slate-400">Documents, people, and topics</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={filters.document}
              onChange={(e) => setFilters((f) => ({ ...f, document: e.target.checked }))}
              className="accent-indigo-600"
            />
            Documents
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={filters.person}
              onChange={(e) => setFilters((f) => ({ ...f, person: e.target.checked }))}
              className="accent-indigo-600"
            />
            People
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={filters.topic}
              onChange={(e) => setFilters((f) => ({ ...f, topic: e.target.checked }))}
              className="accent-indigo-600"
            />
            Topics
          </label>
          <input
            value={filters.text}
            onChange={(e) => setFilters((f) => ({ ...f, text: e.target.value }))}
            placeholder="Filter by label…"
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            aria-label="Text filter"
          />
        </div>
      </header>

      <div className="h-[560px] w-full card overflow-hidden">
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          onNodeClick={(_, clickedNode) => {
            const graphNode = nodeMap.get(clickedNode.id) ?? null;
            setSelectedNode(graphNode as KGNode | null);
          }}
        >
          <Background variant={BackgroundVariant.Dots} color="#e2e8f0" gap={20} size={1} />
          <MiniMap
            nodeStrokeColor={(node) => {
              const nodeType = (node.data as any)?.type;
              if (nodeType === 'document') return '#6366f1';
              if (nodeType === 'person') return '#10b981';
              if (nodeType === 'topic') return '#f59e0b';
              return '#64748b';
            }}
            nodeColor="#ffffff"
            maskColor="rgba(241,245,249,0.6)"
          />
          <Controls />
        </ReactFlow>
      </div>

      <NodeDetailsDrawer node={selectedNode} onClose={() => setSelectedNode(null)} />
    </div>
  );
}