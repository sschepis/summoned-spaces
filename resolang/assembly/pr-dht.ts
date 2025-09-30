import { Serializable } from "./core/interfaces";
import { JSONBuilder } from "./core/serialization";
// Prime Resonance Distributed Hash Table (PR-DHT)
// Dynamic node discovery and self-organizing topology using prime-based addressing

import { NetworkNode, NodeID, Prime } from "../../resonnet/assembly/prn-node";
import { PrimeResonanceIdentity } from "../../resonnet/assembly/prn-node";
import { calculateStateHash } from "./hsp-protocol";

// DHT entry types
export enum DHTEntryType {
  NODE_INFO = 0,
  STATE_LOCATION = 1,
  FRAGMENT_MAP = 2,
  ROUTING_HINT = 3
}

// DHT entry
export class DHTEntry implements Serializable {
  key: string;
  type: DHTEntryType;
  value: string;
  timestamp: f64;
  ttl: f64;  // Time to live in ms
  nodeId: NodeID;
  
  constructor(
    key: string,
    type: DHTEntryType,
    value: string,
    nodeId: NodeID,
    ttl: f64 = 3600000  // 1 hour default
  ) {
    this.key = key;
    this.type = type;
    this.value = value;
    this.nodeId = nodeId;
    this.timestamp = Date.now() as f64;
    this.ttl = ttl;
  }
  
  isExpired(): boolean {
    return (Date.now() as f64) - this.timestamp > this.ttl;
  }
  
  toJSON(): string {
    const builder = new JSONBuilder();
    return builder
      .startObject()
      .addStringField("key", this.key)
      .addNumberField("type", this.type)
      .addStringField("value", this.value)
      .addStringField("nodeId", this.nodeId)
      .addNumberField("timestamp", this.timestamp)
      .addNumberField("ttl", this.ttl)
      .endObject()
      .build();
  }
  
  toString(): string {
    return this.toJSON();
  }
}

// Prime-based key space
export class PrimeKeySpace {
  // Map prime to key range
  static primeToKeyRange(prime: Prime): u64 {
    // Use prime properties to determine position in key space
    const phi = 1.618033988749895;
    const position = (f64(prime) * phi) % 1.0;
    return u64(position * 0xFFFFFFFFFFFFFFFF);
  }
  
  // Calculate distance between two keys in prime space
  static keyDistance(key1: u64, key2: u64): u64 {
    // Circular distance in key space
    const diff = key1 > key2 ? key1 - key2 : key2 - key1;
    const halfSpace = u64(0x8000000000000000);
    return diff > halfSpace ? u64(0xFFFFFFFFFFFFFFFF) - diff + 1 : diff;
  }
  
  // Hash string key to prime key space
  static hashToKeySpace(key: string): u64 {
    let hash: u64 = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = ((hash << 5) - hash + u64(char)) & 0xFFFFFFFFFFFFFFFF;
    }
    return hash;
  }
  
  // Find closest prime to a key
  static findClosestPrime(key: u64, primes: Array<Prime>): Prime {
    let closestPrime = primes[0];
    let minDistance = this.keyDistance(key, this.primeToKeyRange(closestPrime));
    
    for (let i = 1; i < primes.length; i++) {
      const prime = primes[i];
      const distance = this.keyDistance(key, this.primeToKeyRange(prime));
      if (distance < minDistance) {
        minDistance = distance;
        closestPrime = prime;
      }
    }
    
    return closestPrime;
  }
}

// DHT routing table
export class DHTRoutingTable {
  nodeId: NodeID;
  nodePrimes: Array<Prime>;
  buckets: Map<u32, Array<NodeID>>;  // k-buckets for Kademlia-like routing
  maxBucketSize: u32;
  
  constructor(nodeId: NodeID, primes: Array<Prime>, maxBucketSize: u32 = 20) {
    this.nodeId = nodeId;
    this.nodePrimes = primes;
    this.buckets = new Map<u32, Array<NodeID>>();
    this.maxBucketSize = maxBucketSize;
    
    // Initialize buckets (64 buckets for 64-bit key space)
    for (let i: u32 = 0; i < 64; i++) {
      this.buckets.set(i, new Array<NodeID>());
    }
  }
  
  // Add node to routing table
  addNode(nodeId: NodeID, nodePrimes: Array<Prime>): void {
    if (nodeId == this.nodeId) return;
    
    // Calculate which bucket based on XOR distance
    const ourKey = PrimeKeySpace.primeToKeyRange(this.nodePrimes[0]);
    const theirKey = PrimeKeySpace.primeToKeyRange(nodePrimes[0]);
    const xorDistance = ourKey ^ theirKey;
    
    // Find highest bit position (bucket index)
    let bucketIndex: u32 = 0;
    let temp = xorDistance;
    while (temp > 0) {
      bucketIndex++;
      temp >>= 1;
    }
    
    if (bucketIndex > 0) bucketIndex--;
    
    // Add to bucket if not full
    const bucket = this.buckets.get(bucketIndex);
    if (bucket && bucket.length < this.maxBucketSize) {
      // Check if already exists
      let exists = false;
      for (let i = 0; i < bucket.length; i++) {
        if (bucket[i] == nodeId) {
          exists = true;
          break;
        }
      }
      
      if (!exists) {
        bucket.push(nodeId);
      }
    }
  }
  
  // Find k closest nodes to a key
  findClosestNodes(targetKey: u64, k: u32 = 3): Array<NodeID> {
    const candidates = new Array<NodeID>();
    const distances = new Map<NodeID, u64>();
    
    // Collect all nodes from buckets
    const bucketIds = this.buckets.keys();
    for (let i = 0; i < bucketIds.length; i++) {
      const bucket = this.buckets.get(bucketIds[i]);
      if (bucket) {
        for (let j = 0; j < bucket.length; j++) {
          candidates.push(bucket[j]);
        }
      }
    }
    
    // Sort by distance to target
    // Simple bubble sort for now
    for (let i = 0; i < candidates.length - 1; i++) {
      for (let j = 0; j < candidates.length - i - 1; j++) {
        // Note: In real implementation, we'd need node prime info
        // For now, use node ID hash as approximation
        const key1 = PrimeKeySpace.hashToKeySpace(candidates[j]);
        const key2 = PrimeKeySpace.hashToKeySpace(candidates[j + 1]);
        const dist1 = PrimeKeySpace.keyDistance(key1, targetKey);
        const dist2 = PrimeKeySpace.keyDistance(key2, targetKey);
        
        if (dist1 > dist2) {
          const temp = candidates[j];
          candidates[j] = candidates[j + 1];
          candidates[j + 1] = temp;
        }
      }
    }
    
    // Return top k
    const result = new Array<NodeID>();
    for (let i = 0; i < k && i < candidates.length; i++) {
      result.push(candidates[i]);
    }
    
    return result;
  }
}

// Prime Resonance DHT
export class PrimeResonanceDHT {
  nodeId: NodeID;
  nodePrimes: Array<Prime>;
  routingTable: DHTRoutingTable;
  localStorage: Map<string, DHTEntry>;
  replicationFactor: u32;
  
  constructor(
    nodeId: NodeID,
    primes: Array<Prime>,
    replicationFactor: u32 = 3
  ) {
    this.nodeId = nodeId;
    this.nodePrimes = primes;
    this.routingTable = new DHTRoutingTable(nodeId, primes);
    this.localStorage = new Map<string, DHTEntry>();
    this.replicationFactor = replicationFactor;
  }
  
  // Store entry in DHT
  store(key: string, type: DHTEntryType, value: string): boolean {
    const entry = new DHTEntry(key, type, value, this.nodeId);
    
    // Check if we should store locally
    const keyHash = PrimeKeySpace.hashToKeySpace(key);
    const ourKey = PrimeKeySpace.primeToKeyRange(this.nodePrimes[0]);
    
    // Store locally
    this.localStorage.set(key, entry);
    
    // Find nodes for replication
    const replicaNodes = this.routingTable.findClosestNodes(
      keyHash,
      this.replicationFactor
    );
    
    // In real implementation, send to replica nodes
    // For now, just return success
    return true;
  }
  
  // Lookup entry in DHT
  lookup(key: string): DHTEntry | null {
    // Check local storage first
    if (this.localStorage.has(key)) {
      const entry = this.localStorage.get(key);
      if (!entry.isExpired()) {
        return entry;
      } else {
        // Remove expired entry
        this.localStorage.delete(key);
      }
    }
    
    // Find nodes that might have the key
    const keyHash = PrimeKeySpace.hashToKeySpace(key);
    const candidates = this.routingTable.findClosestNodes(keyHash, 3);
    
    // In real implementation, query candidate nodes
    // For now, return null
    return null;
  }
  
  // Join DHT network
  join(bootstrapNodes: Array<NodeID>): void {
    // In real implementation:
    // 1. Contact bootstrap nodes
    // 2. Find our position in key space
    // 3. Get initial routing table entries
    // 4. Announce our presence
    
    console.log(`Node ${this.nodeId} joining DHT with bootstrap nodes: ${bootstrapNodes.length}`);
  }
  
  // Leave DHT network
  leave(): void {
    // In real implementation:
    // 1. Transfer stored entries to neighbors
    // 2. Notify routing table contacts
    // 3. Clean up resources
    
    console.log(`Node ${this.nodeId} leaving DHT`);
  }
  
  // Periodic maintenance
  maintenance(): void {
    // Remove expired entries
    const keys = this.localStorage.keys();
    for (let i = 0; i < keys.length; i++) {
      const entry = this.localStorage.get(keys[i]);
      if (entry && entry.isExpired()) {
        this.localStorage.delete(keys[i]);
      }
    }
    
    // Refresh routing table
    // In real implementation, ping nodes and remove unresponsive ones
  }
  
  // Get DHT statistics
  getStats(): string {
    let totalBucketSize = 0;
    const bucketIds = this.routingTable.buckets.keys();
    for (let i = 0; i < bucketIds.length; i++) {
      const bucket = this.routingTable.buckets.get(bucketIds[i]);
      if (bucket) {
        totalBucketSize += bucket.length;
      }
    }
    
    return `{"nodeId":"${this.nodeId}","entries":${this.localStorage.size},"routingTableSize":${totalBucketSize}}`;
  }
}

// DHT-based discovery service
export class DHTDiscoveryService {
  dht: PrimeResonanceDHT;
  
  constructor(dht: PrimeResonanceDHT) {
    this.dht = dht;
  }
  
  // Register node in DHT
  registerNode(node: NetworkNode): boolean {
    const nodeInfo = node.exportState();
    return this.dht.store(
      `node:${node.id}`,
      DHTEntryType.NODE_INFO,
      nodeInfo
    );
  }
  
  // Find node by ID
  findNode(nodeId: NodeID): string | null {
    const entry = this.dht.lookup(`node:${nodeId}`);
    return entry ? entry.value : null;
  }
  
  // Register state location
  registerStateLocation(stateHash: string, nodeIds: Array<NodeID>): boolean {
    const locations = nodeIds.join(",");
    return this.dht.store(
      `state:${stateHash}`,
      DHTEntryType.STATE_LOCATION,
      locations
    );
  }
  
  // Find nodes storing a state
  findStateLocations(stateHash: string): Array<NodeID> {
    const entry = this.dht.lookup(`state:${stateHash}`);
    if (!entry) return new Array<NodeID>();
    
    const locations = entry.value.split(",");
    return locations;
  }
  
  // Register fragment mapping
  registerFragmentMap(
    stateHash: string,
    fragmentMap: Map<NodeID, Array<u32>>
  ): boolean {
    let mapStr = "{";
    const nodeIds = fragmentMap.keys();
    for (let i = 0; i < nodeIds.length; i++) {
      if (i > 0) mapStr += ",";
      const nodeId = nodeIds[i];
      const fragments = fragmentMap.get(nodeId);
      mapStr += `"${nodeId}":[${fragments.join(",")}]`;
    }
    mapStr += "}";
    
    return this.dht.store(
      `fragments:${stateHash}`,
      DHTEntryType.FRAGMENT_MAP,
      mapStr
    );
  }
}

// Export convenience functions
export function createDHT(
  nodeId: NodeID,
  primes: Array<Prime>
): PrimeResonanceDHT {
  return new PrimeResonanceDHT(nodeId, primes);
}

export function createDiscoveryService(
  dht: PrimeResonanceDHT
): DHTDiscoveryService {
  return new DHTDiscoveryService(dht);
}