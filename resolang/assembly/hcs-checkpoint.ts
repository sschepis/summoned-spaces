import { Serializable } from "./core/interfaces";
import { JSONBuilder } from "./core/serialization";
// Holographic Checkpoint System (HCS)
// Merkle tree-based checkpointing with prime-based hashing

import { NetworkNode, NodeID, Prime } from "../../resonnet/assembly/prn-node";
import { PrimeState } from "resolang";
import { StateFragment, calculateStateHash } from "./hsp-protocol";

// Merkle tree node
export class MerkleNode implements Serializable {
  hash: string;
  left: MerkleNode | null;
  right: MerkleNode | null;
  data: string | null;  // Leaf nodes contain data
  level: u32;
  
  constructor(hash: string, level: u32 = 0) {
    this.hash = hash;
    this.left = null;
    this.right = null;
    this.data = null;
    this.level = level;
  }
  
  isLeaf(): boolean {
    return this.left == null && this.right == null;
  }
  
  toString(): string {
    const builder = new JSONBuilder();
    return builder
      .startObject()
      .addStringField("hash", this.hash)
      .addIntegerField("level", this.level)
      .addBooleanField("isLeaf", this.isLeaf())
      .endObject()
      .build();
  }
}

// Prime-based hash function
export class PrimeHasher {
  primes: Array<Prime>;
  
  constructor(primes: Array<Prime> = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]) {
    this.primes = primes;
  }
  
  // Hash string using prime multiplication
  hashString(input: string): string {
    let hash: u64 = 1;
    
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      const primeIndex = i % this.primes.length;
      const prime = u64(this.primes[primeIndex]);
      
      hash = (hash * prime + u64(char)) % 0xFFFFFFFFFFFFFFFF;
    }
    
    return hash.toString();
  }
  
  // Hash two hashes together (for Merkle tree)
  hashPair(left: string, right: string): string {
    const combined = left + right;
    return this.hashString(combined);
  }
  
  // Hash state fragment
  hashFragment(fragment: StateFragment): string {
    const data = `${fragment.prime}-${fragment.amplitude}-${fragment.phase}-${fragment.coherence}`;
    return this.hashString(data);
  }
}

// Holographic Merkle Tree
export class HolographicMerkleTree {
  root: MerkleNode | null;
  hasher: PrimeHasher;
  leaves: Array<MerkleNode>;
  proofCache: Map<string, Array<string>>;
  
  constructor(hasher: PrimeHasher = new PrimeHasher()) {
    this.root = null;
    this.hasher = hasher;
    this.leaves = new Array<MerkleNode>();
    this.proofCache = new Map<string, Array<string>>();
  }
  
  // Build tree from state fragments
  buildFromFragments(fragments: Array<StateFragment>): void {
    this.leaves = new Array<MerkleNode>();
    this.proofCache.clear();
    
    // Create leaf nodes
    for (let i = 0; i < fragments.length; i++) {
      const fragment = fragments[i];
      const hash = this.hasher.hashFragment(fragment);
      const leaf = new MerkleNode(hash, 0);
      leaf.data = fragment.toString();
      this.leaves.push(leaf);
    }
    
    // Build tree bottom-up
    this.root = this.buildTreeRecursive(this.leaves);
  }
  
  // Recursive tree building
  private buildTreeRecursive(nodes: Array<MerkleNode>): MerkleNode | null {
    if (nodes.length == 0) return null;
    if (nodes.length == 1) return nodes[0];
    
    const nextLevel = new Array<MerkleNode>();
    const currentLevel = nodes[0].level;
    
    // Pair up nodes
    for (let i = 0; i < nodes.length; i += 2) {
      const left = nodes[i];
      let right: MerkleNode;
      
      if (i + 1 < nodes.length) {
        right = nodes[i + 1];
      } else {
        // Odd number of nodes - duplicate the last one
        right = left;
      }
      
      // Create parent node
      const parentHash = this.hasher.hashPair(left.hash, right.hash);
      const parent = new MerkleNode(parentHash, currentLevel + 1);
      parent.left = left;
      parent.right = right;
      
      nextLevel.push(parent);
    }
    
    return this.buildTreeRecursive(nextLevel);
  }
  
  // Get Merkle proof for a fragment
  getMerkleProof(fragmentIndex: u32): Array<string> | null {
    if (fragmentIndex >= this.leaves.length || !this.root) {
      return null;
    }
    
    // Check cache
    const cacheKey = fragmentIndex.toString();
    if (this.proofCache.has(cacheKey)) {
      return this.proofCache.get(cacheKey);
    }
    
    const proof = new Array<string>();
    let currentNode = this.leaves[fragmentIndex];
    let index = fragmentIndex;
    
    // Traverse up the tree
    let level = 0;
    let levelSize = this.leaves.length;
    
    while (levelSize > 1) {
      const isRightNode = index % 2 == 1;
      const siblingIndex = isRightNode ? index - 1 : index + 1;
      
      // Add sibling hash to proof
      if (siblingIndex < levelSize) {
        const siblingHash = this.getNodeAtLevel(level, siblingIndex);
        if (siblingHash) {
          proof.push(siblingHash);
        }
      }
      
      // Move up one level
      index = index / 2;
      levelSize = (levelSize + 1) / 2;
      level++;
    }
    
    // Cache the proof
    this.proofCache.set(cacheKey, proof);
    
    return proof;
  }
  
  // Get node hash at specific level and index
  private getNodeAtLevel(level: u32, index: u32): string | null {
    if (!this.root) return null;
    
    // Start from leaves and work up
    let currentNodes = this.leaves;
    let currentLevel = 0;
    
    while (currentLevel < level) {
      const nextNodes = new Array<MerkleNode>();
      
      for (let i = 0; i < currentNodes.length; i += 2) {
        // This is a simplified approach - in real implementation,
        // we'd traverse the actual tree structure
        const left = currentNodes[i];
        const right = i + 1 < currentNodes.length ? currentNodes[i + 1] : left;
        const parentHash = this.hasher.hashPair(left.hash, right.hash);
        const parent = new MerkleNode(parentHash, currentLevel + 1);
        nextNodes.push(parent);
      }
      
      currentNodes = nextNodes;
      currentLevel++;
    }
    
    return index < currentNodes.length ? currentNodes[index].hash : null;
  }
  
  // Verify Merkle proof
  verifyProof(
    leafHash: string,
    leafIndex: u32,
    proof: Array<string>,
    rootHash: string
  ): boolean {
    let currentHash = leafHash;
    let index = leafIndex;
    
    for (let i = 0; i < proof.length; i++) {
      const siblingHash = proof[i];
      const isRightNode = index % 2 == 1;
      
      if (isRightNode) {
        currentHash = this.hasher.hashPair(siblingHash, currentHash);
      } else {
        currentHash = this.hasher.hashPair(currentHash, siblingHash);
      }
      
      index = index / 2;
    }
    
    return currentHash == rootHash;
  }
  
  getRootHash(): string | null {
    return this.root ? this.root.hash : null;
  }
}

// Checkpoint metadata
export class CheckpointMetadata {
  checkpointId: string;
  stateHash: string;
  merkleRoot: string;
  timestamp: f64;
  nodeId: NodeID;
  blockHeight: u64;
  fragmentCount: u32;
  
  constructor(
    stateHash: string,
    merkleRoot: string,
    nodeId: NodeID,
    blockHeight: u64,
    fragmentCount: u32
  ) {
    this.checkpointId = this.generateCheckpointId();
    this.stateHash = stateHash;
    this.merkleRoot = merkleRoot;
    this.nodeId = nodeId;
    this.blockHeight = blockHeight;
    this.fragmentCount = fragmentCount;
    this.timestamp = Date.now() as f64;
  }
  
  private generateCheckpointId(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `checkpoint-${timestamp}-${random}`;
  }
  
  toString(): string {
    const builder = new JSONBuilder();
    return builder
      .startObject()
      .addStringField("checkpointId", this.checkpointId)
      .addStringField("stateHash", this.stateHash)
      .addStringField("merkleRoot", this.merkleRoot)
      .addStringField("nodeId", this.nodeId)
      .addIntegerField("blockHeight", this.blockHeight)
      .addIntegerField("fragmentCount", this.fragmentCount)
      .addNumberField("timestamp", this.timestamp)
      .endObject()
      .build();
  }
}

// Holographic Checkpoint System
export class HolographicCheckpointSystem {
  nodeId: NodeID;
  merkleTree: HolographicMerkleTree;
  checkpoints: Map<string, CheckpointMetadata>;
  fragmentStorage: Map<string, Array<StateFragment>>;
  currentBlockHeight: u64;
  checkpointInterval: u64;
  maxCheckpoints: u32;
  
  constructor(
    nodeId: NodeID,
    checkpointInterval: u64 = 100,
    maxCheckpoints: u32 = 10
  ) {
    this.nodeId = nodeId;
    this.merkleTree = new HolographicMerkleTree();
    this.checkpoints = new Map<string, CheckpointMetadata>();
    this.fragmentStorage = new Map<string, Array<StateFragment>>();
    this.currentBlockHeight = 0;
    this.checkpointInterval = checkpointInterval;
    this.maxCheckpoints = maxCheckpoints;
  }
  
  // Create checkpoint from state
  createCheckpoint(state: PrimeState, fragments: Array<StateFragment>): CheckpointMetadata {
    // Build Merkle tree from fragments
    this.merkleTree.buildFromFragments(fragments);
    
    const stateHash = calculateStateHash(state);
    const merkleRoot = this.merkleTree.getRootHash();
    
    if (!merkleRoot) {
      throw new Error("Failed to build Merkle tree");
    }
    
    // Create checkpoint metadata
    const checkpoint = new CheckpointMetadata(
      stateHash,
      merkleRoot,
      this.nodeId,
      this.currentBlockHeight,
      u32(fragments.length)
    );
    
    // Store checkpoint and fragments
    this.checkpoints.set(checkpoint.checkpointId, checkpoint);
    this.fragmentStorage.set(checkpoint.checkpointId, fragments);
    
    // Clean up old checkpoints
    this.cleanupOldCheckpoints();
    
    return checkpoint;
  }
  
  // Verify checkpoint integrity
  verifyCheckpoint(checkpointId: string): boolean {
    const checkpoint = this.checkpoints.get(checkpointId);
    const fragments = this.fragmentStorage.get(checkpointId);
    
    if (!checkpoint || !fragments) {
      return false;
    }
    
    // Rebuild Merkle tree and verify root
    const tempTree = new HolographicMerkleTree();
    tempTree.buildFromFragments(fragments);
    
    const calculatedRoot = tempTree.getRootHash();
    return calculatedRoot == checkpoint.merkleRoot;
  }
  
  // Get checkpoint proof for verification
  getCheckpointProof(
    checkpointId: string,
    fragmentIndex: u32
  ): CheckpointProof | null {
    const checkpoint = this.checkpoints.get(checkpointId);
    const fragments = this.fragmentStorage.get(checkpointId);
    
    if (!checkpoint || !fragments || fragmentIndex >= fragments.length) {
      return null;
    }
    
    // Rebuild tree to get proof
    this.merkleTree.buildFromFragments(fragments);
    const merkleProof = this.merkleTree.getMerkleProof(fragmentIndex);
    
    if (!merkleProof) {
      return null;
    }
    
    return new CheckpointProof(
      checkpoint,
      fragments[fragmentIndex],
      fragmentIndex,
      merkleProof
    );
  }
  
  // Restore state from checkpoint
  restoreFromCheckpoint(checkpointId: string): Array<StateFragment> | null {
    const fragments = this.fragmentStorage.get(checkpointId);
    
    if (!fragments || !this.verifyCheckpoint(checkpointId)) {
      return null;
    }
    
    return fragments;
  }
  
  // Update block height
  updateBlockHeight(height: u64): void {
    this.currentBlockHeight = height;
    
    // Check if we should create automatic checkpoint
    if (height % this.checkpointInterval == 0) {
      // In real implementation, trigger checkpoint creation
      console.log(`Checkpoint interval reached at height ${height}`);
    }
  }
  
  // Clean up old checkpoints
  private cleanupOldCheckpoints(): void {
    if (this.checkpoints.size <= this.maxCheckpoints) {
      return;
    }
    
    // Sort checkpoints by timestamp
    const checkpointIds = this.checkpoints.keys();
    const sortedIds = new Array<string>();
    const timestamps = new Array<f64>();
    
    for (let i = 0; i < checkpointIds.length; i++) {
      const id = checkpointIds[i];
      const checkpoint = this.checkpoints.get(id);
      if (checkpoint) {
        sortedIds.push(id);
        timestamps.push(checkpoint.timestamp);
      }
    }
    
    // Simple bubble sort by timestamp
    for (let i = 0; i < sortedIds.length - 1; i++) {
      for (let j = 0; j < sortedIds.length - i - 1; j++) {
        if (timestamps[j] > timestamps[j + 1]) {
          // Swap
          const tempId = sortedIds[j];
          sortedIds[j] = sortedIds[j + 1];
          sortedIds[j + 1] = tempId;
          
          const tempTime = timestamps[j];
          timestamps[j] = timestamps[j + 1];
          timestamps[j + 1] = tempTime;
        }
      }
    }
    
    // Remove oldest checkpoints
    const toRemove = sortedIds.length - this.maxCheckpoints;
    for (let i = 0; i < toRemove; i++) {
      const id = sortedIds[i];
      this.checkpoints.delete(id);
      this.fragmentStorage.delete(id);
    }
  }
  
  // Get checkpoint statistics
  getStats(): string {
    let totalFragments: u32 = 0;
    const fragmentCounts = this.fragmentStorage.values();
    
    for (let i = 0; i < fragmentCounts.length; i++) {
      totalFragments += u32(fragmentCounts[i].length);
    }
    
    return `{"checkpoints":${this.checkpoints.size},"totalFragments":${totalFragments},"currentHeight":${this.currentBlockHeight}}`;
  }
}

// Checkpoint proof for verification
export class CheckpointProof implements Serializable {
  metadata: CheckpointMetadata;
  fragment: StateFragment;
  fragmentIndex: u32;
  merkleProof: Array<string>;
  
  constructor(
    metadata: CheckpointMetadata,
    fragment: StateFragment,
    fragmentIndex: u32,
    merkleProof: Array<string>
  ) {
    this.metadata = metadata;
    this.fragment = fragment;
    this.fragmentIndex = fragmentIndex;
    this.merkleProof = merkleProof;
  }
  
  // Verify this proof
  verify(): boolean {
    const hasher = new PrimeHasher();
    const fragmentHash = hasher.hashFragment(this.fragment);
    
    const tree = new HolographicMerkleTree(hasher);
    return tree.verifyProof(
      fragmentHash,
      this.fragmentIndex,
      this.merkleProof,
      this.metadata.merkleRoot
    );
  }
  
  toString(): string {
    const builder = new JSONBuilder();
    
    // Build merkle proof array manually
    let proofArray = "[";
    for (let i = 0; i < this.merkleProof.length; i++) {
      if (i > 0) proofArray += ",";
      proofArray += '"' + this.merkleProof[i] + '"';
    }
    proofArray += "]";
    
    return builder
      .startObject()
      .addRawField("metadata", this.metadata.toString())
      .addIntegerField("fragmentIndex", this.fragmentIndex)
      .addIntegerField("proofLength", this.merkleProof.length)
      .addBooleanField("valid", this.verify())
      .addRawField("merkleProof", proofArray)
      .endObject()
      .build();
  }
}

// Export convenience functions
export function createCheckpointSystem(
  nodeId: NodeID
): HolographicCheckpointSystem {
  return new HolographicCheckpointSystem(nodeId);
}

export function createPrimeHasher(primes: Array<Prime> = []): PrimeHasher {
  return primes.length > 0 ? new PrimeHasher(primes) : new PrimeHasher();
}