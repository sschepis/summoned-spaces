import { Serializable } from "./core/interfaces";
import { JSONBuilder } from "./core/serialization";
// Entanglement Graph Router (EGR)
// Finds optimal paths based on entanglement strength for quantum state routing

import { NetworkNode, NodeID, EntanglementStrength } from "../../resonnet/assembly/prn-node";
import { PrimeState } from "resolang";

// Route types
export enum RouteType {
  DIRECT = 0,        // Direct entanglement exists
  MULTI_HOP = 1,     // Multiple hops required
  BROADCAST = 2,     // Broadcast to multiple paths
  TELEPORT = 3       // Use quantum teleportation
}

// Route quality metrics
export class RouteMetrics implements Serializable {
  totalStrength: f64;      // Product of entanglement strengths
  hopCount: u32;           // Number of hops
  minStrength: f64;        // Weakest link in the path
  avgCoherence: f64;       // Average coherence along path
  latencyEstimate: f64;    // Estimated latency in ms
  
  constructor() {
    this.totalStrength = 1.0;
    this.hopCount = 0;
    this.minStrength = 1.0;
    this.avgCoherence = 1.0;
    this.latencyEstimate = 0.0;
  }
  
  // Calculate route quality score
  getQualityScore(): f64 {
    // Higher score = better route
    // Prioritize: strength > coherence > low hops > low latency
    const strengthWeight = 0.4;
    const coherenceWeight = 0.3;
    const hopWeight = 0.2;
    const latencyWeight = 0.1;
    
    const hopScore = 1.0 / (1.0 + f64(this.hopCount));
    const latencyScore = 1.0 / (1.0 + this.latencyEstimate / 100.0);
    
    return strengthWeight * this.minStrength +
           coherenceWeight * this.avgCoherence +
           hopWeight * hopScore +
           latencyWeight * latencyScore;
  }
  
  toJSON(): string {
    const builder = new JSONBuilder();
    return builder
      .startObject()
      .addNumberField("totalStrength", this.totalStrength)
      .addNumberField("hopCount", this.hopCount)
      .addNumberField("minStrength", this.minStrength)
      .addNumberField("avgCoherence", this.avgCoherence)
      .addNumberField("latencyEstimate", this.latencyEstimate)
      .addNumberField("qualityScore", this.getQualityScore())
      .endObject()
      .build();
  }
  
  toString(): string {
    return this.toJSON();
  }
}

// Route path representation
export class RoutePath implements Serializable {
  source: NodeID;
  destination: NodeID;
  path: Array<NodeID>;
  type: RouteType;
  metrics: RouteMetrics;
  
  constructor(source: NodeID, destination: NodeID, type: RouteType) {
    this.source = source;
    this.destination = destination;
    this.path = new Array<NodeID>();
    this.type = type;
    this.metrics = new RouteMetrics();
  }
  
  addHop(nodeId: NodeID, strength: f64, coherence: f64): void {
    this.path.push(nodeId);
    this.metrics.hopCount++;
    this.metrics.totalStrength *= strength;
    this.metrics.minStrength = Math.min(this.metrics.minStrength, strength);
    
    // Update average coherence
    const prevTotal = this.metrics.avgCoherence * f64(this.metrics.hopCount - 1);
    this.metrics.avgCoherence = (prevTotal + coherence) / f64(this.metrics.hopCount);
    
    // Estimate latency based on link strength
    if (strength >= 0.85) {
      this.metrics.latencyEstimate += 10.0;  // Strong link: 10ms
    } else if (strength >= 0.5) {
      this.metrics.latencyEstimate += 30.0;  // Medium link: 30ms
    } else {
      this.metrics.latencyEstimate += 50.0;  // Weak link: 50ms
    }
  }
  
  toJSON(): string {
    const builder = new JSONBuilder();
    
    // Build path array JSON
    let pathJson = "[";
    for (let i = 0; i < this.path.length; i++) {
      if (i > 0) pathJson += ",";
      pathJson += `"${this.path[i]}"`;
    }
    pathJson += "]";
    
    builder.startObject()
      .addStringField("source", this.source)
      .addStringField("destination", this.destination)
      .addRawField("path", pathJson)
      .addNumberField("type", this.type)
      .addRawField("metrics", this.metrics.toJSON())
      .endObject();
    
    return builder.build();
  }
  
  toString(): string {
    return this.toJSON();
  }
}

// Entanglement graph representation
export class EntanglementGraph {
  nodes: Map<NodeID, NetworkNode>;
  adjacencyList: Map<NodeID, Map<NodeID, EntanglementStrength>>;
  
  constructor() {
    this.nodes = new Map<NodeID, NetworkNode>();
    this.adjacencyList = new Map<NodeID, Map<NodeID, EntanglementStrength>>();
  }
  
  addNode(node: NetworkNode): void {
    this.nodes.set(node.id, node);
    
    if (!this.adjacencyList.has(node.id)) {
      this.adjacencyList.set(node.id, new Map<NodeID, EntanglementStrength>());
    }
    
    // Add edges from node's entanglement map
    const entangled = node.entanglementMap.keys();
    for (let i = 0; i < entangled.length; i++) {
      const targetId = entangled[i];
      const strength = node.entanglementMap.get(targetId);
      this.addEdge(node.id, targetId, strength);
    }
  }
  
  addEdge(source: NodeID, target: NodeID, strength: EntanglementStrength): void {
    // Add bidirectional edge
    if (!this.adjacencyList.has(source)) {
      this.adjacencyList.set(source, new Map<NodeID, EntanglementStrength>());
    }
    this.adjacencyList.get(source).set(target, strength);
    
    if (!this.adjacencyList.has(target)) {
      this.adjacencyList.set(target, new Map<NodeID, EntanglementStrength>());
    }
    this.adjacencyList.get(target).set(source, strength);
  }
  
  getNeighbors(nodeId: NodeID): Map<NodeID, EntanglementStrength> {
    return this.adjacencyList.get(nodeId) || new Map<NodeID, EntanglementStrength>();
  }
  
  getNodeCount(): u32 {
    return u32(this.nodes.size);
  }
  
  getEdgeCount(): u32 {
    let count: u32 = 0;
    const nodeIds = this.adjacencyList.keys();
    for (let i = 0; i < nodeIds.length; i++) {
      const neighbors = this.adjacencyList.get(nodeIds[i]);
      if (neighbors) {
        count += u32(neighbors.size);
      }
    }
    return count / 2;  // Divide by 2 for bidirectional edges
  }
}

// Entanglement Graph Router
export class EntanglementGraphRouter {
  graph: EntanglementGraph;
  minStrengthThreshold: f64;
  maxHops: u32;
  teleportThreshold: f64;
  
  constructor(
    minStrength: f64 = 0.3,
    maxHops: u32 = 5,
    teleportThreshold: f64 = 0.85
  ) {
    this.graph = new EntanglementGraph();
    this.minStrengthThreshold = minStrength;
    this.maxHops = maxHops;
    this.teleportThreshold = teleportThreshold;
  }
  
  // Update graph with node information
  updateGraph(node: NetworkNode): void {
    this.graph.addNode(node);
  }
  
  // Find best route between two nodes
  findRoute(source: NodeID, destination: NodeID): RoutePath | null {
    // Check if nodes exist
    if (!this.graph.nodes.has(source) || !this.graph.nodes.has(destination)) {
      return null;
    }
    
    // Check for direct connection
    const directStrength = this.getDirectStrength(source, destination);
    if (directStrength > 0) {
      const route = new RoutePath(source, destination, RouteType.DIRECT);
      const sourceNode = this.graph.nodes.get(source)!;
      const destNode = this.graph.nodes.get(destination)!;
      route.addHop(destination, directStrength, destNode.entangledNode.coherence);
      
      // Use teleportation for strong direct links
      if (directStrength >= this.teleportThreshold) {
        route.type = RouteType.TELEPORT;
      }
      
      return route;
    }
    
    // Find multi-hop path using modified Dijkstra's algorithm
    return this.findMultiHopRoute(source, destination);
  }
  
  // Find all routes to destination (for redundancy)
  findAllRoutes(
    source: NodeID,
    destination: NodeID,
    maxRoutes: u32 = 3
  ): Array<RoutePath> {
    const routes = new Array<RoutePath>();
    
    // First, find the best route
    const bestRoute = this.findRoute(source, destination);
    if (bestRoute) {
      routes.push(bestRoute);
    }
    
    // Find alternative routes by temporarily removing edges
    const removedEdges = new Array<string>();
    
    while (routes.length < maxRoutes) {
      // Remove edges from the best route found so far
      if (routes.length > 0) {
        const lastRoute = routes[routes.length - 1];
        for (let i = 0; i < lastRoute.path.length - 1; i++) {
          const from = i == 0 ? source : lastRoute.path[i - 1];
          const to = lastRoute.path[i];
          removedEdges.push(`${from}-${to}`);
          
          // Temporarily remove edge
          const neighbors = this.graph.getNeighbors(from);
          if (neighbors.has(to)) {
            neighbors.delete(to);
          }
        }
      }
      
      // Find alternative route
      const altRoute = this.findRoute(source, destination);
      if (altRoute && altRoute.metrics.minStrength >= this.minStrengthThreshold) {
        routes.push(altRoute);
      } else {
        break;  // No more viable routes
      }
    }
    
    // Restore removed edges
    for (let i = 0; i < removedEdges.length; i++) {
      const parts = removedEdges[i].split("-");
      if (parts.length == 2) {
        const from = parts[0];
        const to = parts[1];
        const fromNode = this.graph.nodes.get(from);
        const toNode = this.graph.nodes.get(to);
        
        if (fromNode && toNode) {
          const strength = fromNode.entanglementMap.get(to);
          if (strength > 0) {
            this.graph.addEdge(from, to, strength);
          }
        }
      }
    }
    
    return routes;
  }
  
  // Get direct entanglement strength between nodes
  private getDirectStrength(source: NodeID, destination: NodeID): EntanglementStrength {
    const neighbors = this.graph.getNeighbors(source);
    return neighbors.get(destination) || 0.0;
  }
  
  // Find multi-hop route using modified Dijkstra's algorithm
  private findMultiHopRoute(source: NodeID, destination: NodeID): RoutePath | null {
    const distances = new Map<NodeID, f64>();
    const previous = new Map<NodeID, NodeID>();
    const visited = new Set<NodeID>();
    const queue = new Array<NodeID>();
    
    // Initialize distances
    const nodeIds = this.graph.nodes.keys();
    for (let i = 0; i < nodeIds.length; i++) {
      distances.set(nodeIds[i], 0.0);  // 0 = worst (no connection)
    }
    distances.set(source, 1.0);  // 1 = best (perfect connection)
    queue.push(source);
    
    while (queue.length > 0) {
      // Find node with highest "distance" (strength product)
      let maxIdx = 0;
      let maxDist = distances.get(queue[0]) || 0.0;
      
      for (let i = 1; i < queue.length; i++) {
        const dist = distances.get(queue[i]) || 0.0;
        if (dist > maxDist) {
          maxDist = dist;
          maxIdx = i;
        }
      }
      
      const current = queue[maxIdx];
      queue.splice(maxIdx, 1);
      
      if (visited.has(current)) continue;
      visited.add(current);
      
      if (current == destination) break;
      
      // Check hop count limit
      let hopCount = 0;
      let node = current;
      while (previous.has(node) && hopCount < this.maxHops) {
        node = previous.get(node);
        hopCount++;
      }
      
      if (hopCount >= this.maxHops) continue;
      
      // Update distances to neighbors
      const neighbors = this.graph.getNeighbors(current);
      const neighborIds = neighbors.keys();
      
      for (let i = 0; i < neighborIds.length; i++) {
        const neighbor = neighborIds[i];
        if (visited.has(neighbor)) continue;
        
        const edgeStrength = neighbors.get(neighbor);
        const currentDist = distances.get(current) || 0.0;
        const newDist = currentDist * edgeStrength;
        
        if (newDist > (distances.get(neighbor) || 0.0) && 
            edgeStrength >= this.minStrengthThreshold) {
          distances.set(neighbor, newDist);
          previous.set(neighbor, current);
          
          // Add to queue if not already there
          let inQueue = false;
          for (let j = 0; j < queue.length; j++) {
            if (queue[j] == neighbor) {
              inQueue = true;
              break;
            }
          }
          if (!inQueue) {
            queue.push(neighbor);
          }
        }
      }
    }
    
    // Reconstruct path if found
    if (!previous.has(destination)) {
      return null;
    }
    
    const route = new RoutePath(source, destination, RouteType.MULTI_HOP);
    const path = new Array<NodeID>();
    let current = destination;
    
    while (current != source) {
      path.push(current);
      current = previous.get(current);
    }
    
    // Reverse path and calculate metrics
    for (let i = path.length - 1; i >= 0; i--) {
      const nodeId = path[i];
      const node = this.graph.nodes.get(nodeId);
      
      if (node) {
        const prevNodeId = i < path.length - 1 ? path[i + 1] : source;
        const strength = this.getDirectStrength(prevNodeId, nodeId);
        route.addHop(nodeId, strength, node.entangledNode.coherence);
      }
    }
    
    return route;
  }
  
  // Find broadcast tree for efficient multi-destination routing
  findBroadcastTree(
    source: NodeID,
    destinations: Array<NodeID>
  ): Map<NodeID, RoutePath> {
    const routes = new Map<NodeID, RoutePath>();
    
    // Build minimum spanning tree including all destinations
    // Using a simplified approach: find best route to each destination
    for (let i = 0; i < destinations.length; i++) {
      const route = this.findRoute(source, destinations[i]);
      if (route) {
        route.type = RouteType.BROADCAST;
        routes.set(destinations[i], route);
      }
    }
    
    return routes;
  }
  
  // Get router statistics
  getStats(): string {
    return `{"nodes":${this.graph.getNodeCount()},"edges":${this.graph.getEdgeCount()},"minStrength":${this.minStrengthThreshold},"maxHops":${this.maxHops}}`;
  }
}

// Route optimizer for dynamic path selection
export class RouteOptimizer {
  router: EntanglementGraphRouter;
  routeCache: Map<string, RoutePath>;
  cacheTimeout: f64;
  
  constructor(router: EntanglementGraphRouter, cacheTimeout: f64 = 60000) {
    this.router = router;
    this.routeCache = new Map<string, RoutePath>();
    this.cacheTimeout = cacheTimeout;
  }
  
  // Get optimized route with caching
  getOptimizedRoute(source: NodeID, destination: NodeID): RoutePath | null {
    const cacheKey = `${source}-${destination}`;
    
    // Check cache
    if (this.routeCache.has(cacheKey)) {
      const cachedRoute = this.routeCache.get(cacheKey);
      // Simple cache validation - in real implementation, check timestamp
      if (cachedRoute.metrics.minStrength > 0.5) {
        return cachedRoute;
      }
    }
    
    // Find new route
    const route = this.router.findRoute(source, destination);
    if (route) {
      this.routeCache.set(cacheKey, route);
    }
    
    return route;
  }
  
  // Select best route from alternatives based on current conditions
  selectBestRoute(routes: Array<RoutePath>): RoutePath | null {
    if (routes.length == 0) return null;
    
    let bestRoute = routes[0];
    let bestScore = bestRoute.metrics.getQualityScore();
    
    for (let i = 1; i < routes.length; i++) {
      const score = routes[i].metrics.getQualityScore();
      if (score > bestScore) {
        bestScore = score;
        bestRoute = routes[i];
      }
    }
    
    return bestRoute;
  }
  
  // Clear route cache
  clearCache(): void {
    this.routeCache.clear();
  }
}

// Export convenience functions
export function createRouter(): EntanglementGraphRouter {
  return new EntanglementGraphRouter();
}

export function createRouteOptimizer(
  router: EntanglementGraphRouter
): RouteOptimizer {
  return new RouteOptimizer(router);
}