// Network Topology Configuration for ResonNet
// This file defines the dynamic network topology and discovery mechanisms.

export class NetworkNode {
  id: string;
  name: string;
  type: string; // "primary", "secondary", "observer"
  address: string;
  port: number;
  publicKey: string;

  constructor(
    id: string,
    name: string,
    type: string,
    address: string,
    port: number,
    publicKey: string
  ) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.address = address;
    this.port = port;
    this.publicKey = publicKey;
  }
}

export class NetworkConnection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  latency: number; // milliseconds
  bandwidth: number; // Mbps
  reliability: number; // 0.0 to 1.0

  constructor(
    id: string,
    fromNodeId: string,
    toNodeId: string,
    latency: number,
    bandwidth: number,
    reliability: number
  ) {
    this.id = id;
    this.fromNodeId = fromNodeId;
    this.toNodeId = toNodeId;
    this.latency = latency;
    this.bandwidth = bandwidth;
    this.reliability = reliability;
  }
}

export class SyncGroup {
  id: string;
  name: string;
  type: string; // "consensus", "replication", "shard"
  nodeIds: string[];
  priority: number;

  constructor(
    id: string,
    name: string,
    type: string,
    nodeIds: string[],
    priority: number
  ) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.nodeIds = nodeIds;
    this.priority = priority;
  }
}

export class RoutingPath {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  path: string[]; // Array of node IDs
  totalLatency: number;
  minBandwidth: number;
  reliability: number;

  constructor(
    id: string,
    sourceNodeId: string,
    targetNodeId: string,
    path: string[],
    totalLatency: number,
    minBandwidth: number,
    reliability: number
  ) {
    this.id = id;
    this.sourceNodeId = sourceNodeId;
    this.targetNodeId = targetNodeId;
    this.path = path;
    this.totalLatency = totalLatency;
    this.minBandwidth = minBandwidth;
    this.reliability = reliability;
  }
}

export class NetworkTopology {
  nodes: Map<string, NetworkNode>;
  connections: Map<string, NetworkConnection>;
  syncGroups: Map<string, SyncGroup>;
  routingTable: Map<string, RoutingPath>;

  constructor() {
    this.nodes = new Map<string, NetworkNode>();
    this.connections = new Map<string, NetworkConnection>();
    this.syncGroups = new Map<string, SyncGroup>();
    this.routingTable = new Map<string, RoutingPath>();
  }

  addNode(node: NetworkNode): void {
    this.nodes.set(node.id, node);
  }

  addConnection(connection: NetworkConnection): void {
    this.connections.set(connection.id, connection);
  }

  addSyncGroup(group: SyncGroup): void {
    this.syncGroups.set(group.id, group);
  }

  addRoutingPath(path: RoutingPath): void {
    const key = path.sourceNodeId + "->" + path.targetNodeId;
    this.routingTable.set(key, path);
  }

  getNode(nodeId: string): NetworkNode | null {
    const node = this.nodes.get(nodeId);
    return node !== undefined ? node : null;
  }

  getConnection(connectionId: string): NetworkConnection | null {
    const connection = this.connections.get(connectionId);
    return connection !== undefined ? connection : null;
  }

  getSyncGroup(groupId: string): SyncGroup | null {
    const group = this.syncGroups.get(groupId);
    return group !== undefined ? group : null;
  }

  getRoutingPath(sourceNodeId: string, targetNodeId: string): RoutingPath | null {
    const key = sourceNodeId + "->" + targetNodeId;
    const path = this.routingTable.get(key);
    return path !== undefined ? path : null;
  }

  getNodeConnections(nodeId: string): NetworkConnection[] {
    const nodeConnections: NetworkConnection[] = [];
    const connectionValues = this.connections.values();
    for (const conn of connectionValues) {
      if (conn.fromNodeId == nodeId || conn.toNodeId == nodeId) {
        nodeConnections.push(conn);
      }
    }
    
    return nodeConnections;
  }

  getSyncGroupNodes(groupId: string): NetworkNode[] {
    const group = this.getSyncGroup(groupId);
    if (!group) return [];
    
    const groupNodes: NetworkNode[] = [];
    for (let i = 0; i < group.nodeIds.length; i++) {
      const node = this.getNode(group.nodeIds[i]);
      if (node) {
        groupNodes.push(node);
      }
    }
    
    return groupNodes;
  }

  calculateNetworkMetrics(): string {
    const nodeCount = this.nodes.size;
    const connectionCount = this.connections.size;
    const syncGroupCount = this.syncGroups.size;
    
    let totalLatency: number = 0;
    let totalBandwidth: number = 0;
    let avgReliability: number = 0.0;
    
    const connectionValues = this.connections.values();
    for (const conn of connectionValues) {
      totalLatency += conn.latency;
      totalBandwidth += conn.bandwidth;
      avgReliability += conn.reliability;
    }
    
    if (connectionCount > 0) {
      avgReliability = avgReliability / connectionCount;
    }
    
    return "Network Metrics:\n" +
           "- Nodes: " + nodeCount.toString() + "\n" +
           "- Connections: " + connectionCount.toString() + "\n" +
           "- Sync Groups: " + syncGroupCount.toString() + "\n" +
           "- Total Latency: " + totalLatency.toString() + " ms\n" +
           "- Total Bandwidth: " + totalBandwidth.toString() + " Mbps\n" +
           "- Avg Reliability: " + avgReliability.toString();
  }
}

// A placeholder for a real network interface
class NetworkInterface {
  static broadcast(message: string): void {
    console.log(`[NETWORK] Broadcasting: ${message}`);
  }

  static onMessage(callback: (message: string) => void): void {
    // In a real implementation, this would register a callback for incoming network messages.
  }
}

export class NetworkDiscovery {
  topology: NetworkTopology;
  localNode: NetworkNode;

  constructor(localNode: NetworkNode) {
    this.topology = new NetworkTopology();
    this.localNode = localNode;
    this.topology.addNode(localNode);

    NetworkInterface.onMessage((message: string) => {
      this.handlePresence(message);
    });
  }

  broadcastPresence(): void {
    // In a real implementation, this would be a proper serialization format
    const presenceMessage = `{"type":"presence","node":{"id":"${this.localNode.id}","name":"${this.localNode.name}","type":"${this.localNode.type}","address":"${this.localNode.address}","port":${this.localNode.port},"publicKey":"${this.localNode.publicKey}"}}`;
    NetworkInterface.broadcast(presenceMessage);
  }

  handlePresence(message: string): void {
    // This is a placeholder for a proper deserialization and validation process
    const idIndex = message.indexOf('"id":"') + 6;
    const id = message.substring(idIndex, message.indexOf('"', idIndex));

    if (!this.topology.getNode(id)) {
      // This is a highly simplified parsing logic. A real implementation
      // would use a robust JSON parser.
      const nameIndex = message.indexOf('"name":"') + 8;
      const name = message.substring(nameIndex, message.indexOf('"', nameIndex));
      const typeIndex = message.indexOf('"type":"') + 8;
      const type = message.substring(typeIndex, message.indexOf('"', typeIndex));
      const addressIndex = message.indexOf('"address":"') + 11;
      const address = message.substring(addressIndex, message.indexOf('"', addressIndex));
      const portIndex = message.indexOf('"port":') + 7;
      const port = parseInt(message.substring(portIndex, message.indexOf(',', portIndex)));
      const publicKeyIndex = message.indexOf('"publicKey":"') + 13;
      const publicKey = message.substring(publicKeyIndex, message.indexOf('"', publicKeyIndex));

      const remoteNode = new NetworkNode(id, name, type, address, port, publicKey);
      this.topology.addNode(remoteNode);
      
      const connection = new NetworkConnection(
        `conn-${this.localNode.id}-${remoteNode.id}`,
        this.localNode.id,
        remoteNode.id,
        10, 500, 0.95 // Placeholder values
      );
      this.topology.addConnection(connection);
      console.log(`[DISCOVERY] Discovered new node: ${remoteNode.id}`);
    }
  }

  discover(): void {
    this.broadcastPresence();
  }
}