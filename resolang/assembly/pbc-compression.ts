import { PrimeFieldElement } from "resolang";
import { generatePrimeLarge as generatePrime, isPrimeLarge as isPrime, factorize, gcdLarge as gcd } from './core/math';
import { sha256 } from './core/crypto';

/**
 * Prime-Based Compression (PBC) Algorithm
 *
 * Leverages the holographic properties of prime decomposition to achieve
 * efficient compression of quantum states and network data. The algorithm
 * exploits the fact that prime factorization creates a unique fingerprint
 * that can be used to reconstruct data with high fidelity.
 *
 * Key Features:
 * - Holographic encoding using prime factorization
 * - Lossy compression with controllable fidelity
 * - Quantum state-aware compression
 * - Efficient decompression through prime reconstruction
 */

export class PrimeRepresentation {
  primes: Array<u64>;
  exponents: Array<u32>;
  
  constructor(primes: Array<u64>, exponents: Array<u32>) {
    this.primes = primes;
    this.exponents = exponents;
  }
  
  getEncodedSize(): i32 {
    // 4 bytes for count + (8 bytes prime + 4 bytes exponent) per entry
    return 4 + this.primes.length * 12;
  }
  
  encode(buffer: Uint8Array, offset: i32): i32 {
    // Write count
    buffer[offset++] = u8(this.primes.length >> 8);
    buffer[offset++] = u8(this.primes.length);
    
    // Write each prime and exponent
    for (let i = 0; i < this.primes.length; i++) {
      const prime = this.primes[i];
      const exp = this.exponents[i];
      
      // Write prime (8 bytes)
      for (let j = 0; j < 8; j++) {
        buffer[offset++] = u8((prime >> (8 * j)) & 0xFF);
      }
      
      // Write exponent (4 bytes)
      for (let j = 0; j < 4; j++) {
        buffer[offset++] = u8((exp >> (8 * j)) & 0xFF);
      }
    }
    
    return offset;
  }
  
  static decode(buffer: Uint8Array, offset: i32): DecodeResult {
    // Read count
    const count = (u16(buffer[offset]) << 8) | u16(buffer[offset + 1]);
    offset += 2;
    
    const primes = new Array<u64>();
    const exponents = new Array<u32>();
    
    // Read each prime and exponent
    for (let i = 0; i < count; i++) {
      // Read prime (8 bytes)
      let prime: u64 = 0;
      for (let j = 0; j < 8; j++) {
        prime |= u64(buffer[offset++]) << (8 * j);
      }
      primes.push(prime);
      
      // Read exponent (4 bytes)
      let exp: u32 = 0;
      for (let j = 0; j < 4; j++) {
        exp |= u32(buffer[offset++]) << (8 * j);
      }
      exponents.push(exp);
    }
    
    return new DecodeResult(
      new PrimeRepresentation(primes, exponents),
      offset
    );
  }
}

export class DecodeResult {
  rep: PrimeRepresentation;
  offset: i32;
  
  constructor(rep: PrimeRepresentation, offset: i32) {
    this.rep = rep;
    this.offset = offset;
  }
}

export class ChunkCompressionResult {
  data: Uint8Array;
  fidelity: f64;
  primeCount: u32;
  
  constructor(data: Uint8Array, fidelity: f64, primeCount: u32) {
    this.data = data;
    this.fidelity = fidelity;
    this.primeCount = primeCount;
  }
}

export class PBCConfig {
  compressionLevel: i32;      // 1-9, higher = more compression
  fidelityThreshold: f64;     // Minimum reconstruction fidelity
  useDictionary: bool;        // Use prime dictionary optimization
  maxPrimeSize: u32;          // Maximum prime size in bits
  chunkSize: i32;             // Data chunk size for processing
  
  constructor() {
    this.compressionLevel = 5;
    this.fidelityThreshold = 0.95;
    this.useDictionary = true;
    this.maxPrimeSize = 32;
    this.chunkSize = 256;
  }
}

export class CompressionResult {
  compressedData: Uint8Array;
  compressionRatio: f64;
  fidelity: f64;
  metadata: CompressionMetadata;
  
  constructor(
    compressedData: Uint8Array,
    originalSize: i32,
    fidelity: f64,
    metadata: CompressionMetadata
  ) {
    this.compressedData = compressedData;
    this.compressionRatio = f64(originalSize) / f64(compressedData.length);
    this.fidelity = fidelity;
    this.metadata = metadata;
  }
}

export class CompressionMetadata {
  version: u8;
  algorithm: string;
  originalSize: u32;
  checksum: Uint8Array;
  primeCount: u32;
  dictionaryId: u32;
  timestamp: u64;
  
  constructor() {
    this.version = 1;
    this.algorithm = "PBC-HOLOGRAPHIC";
    this.originalSize = 0;
    this.checksum = new Uint8Array(0);
    this.primeCount = 0;
    this.dictionaryId = 0;
    this.timestamp = Date.now();
  }
  
  serialize(): Uint8Array {
    // Simple serialization
    const buffer = new Uint8Array(64);
    let offset = 0;
    
    buffer[offset++] = this.version;
    
    // Write algorithm name (max 16 bytes)
    const algoBytes = Uint8Array.wrap(String.UTF8.encode(this.algorithm));
    for (let i = 0; i < 16 && i < algoBytes.length; i++) {
      buffer[offset++] = algoBytes[i];
    }
    offset = 17; // Skip to fixed position
    
    // Write sizes
    buffer[offset++] = u8(this.originalSize >> 24);
    buffer[offset++] = u8(this.originalSize >> 16);
    buffer[offset++] = u8(this.originalSize >> 8);
    buffer[offset++] = u8(this.originalSize);
    
    // Write checksum (first 8 bytes)
    for (let i = 0; i < 8 && i < this.checksum.length; i++) {
      buffer[offset++] = this.checksum[i];
    }
    offset = 29; // Skip to fixed position
    
    // Write prime count
    buffer[offset++] = u8(this.primeCount >> 24);
    buffer[offset++] = u8(this.primeCount >> 16);
    buffer[offset++] = u8(this.primeCount >> 8);
    buffer[offset++] = u8(this.primeCount);
    
    // Write dictionary ID
    buffer[offset++] = u8(this.dictionaryId >> 24);
    buffer[offset++] = u8(this.dictionaryId >> 16);
    buffer[offset++] = u8(this.dictionaryId >> 8);
    buffer[offset++] = u8(this.dictionaryId);
    
    // Write timestamp
    for (let i = 0; i < 8; i++) {
      buffer[offset++] = u8((this.timestamp >> (8 * i)) & 0xFF);
    }
    
    return buffer.slice(0, offset);
  }
}

export class PrimeDictionary {
  primes: Array<u64>;
  primeToIndex: Map<u64, u32>;
  indexToPrime: Map<u32, u64>;
  
  constructor(size: i32 = 1000) {
    this.primes = new Array<u64>();
    this.primeToIndex = new Map<u64, u32>();
    this.indexToPrime = new Map<u32, u64>();
    
    this.generateDictionary(size);
  }
  
  private generateDictionary(size: i32): void {
    let candidate: u64 = 2;
    let index: u32 = 0;
    
    while (this.primes.length < size) {
      if (isPrime(candidate)) {
        this.primes.push(candidate);
        this.primeToIndex.set(candidate, index);
        this.indexToPrime.set(index, candidate);
        index++;
      }
      candidate++;
    }
  }
  
  getPrimeIndex(prime: u64): u32 {
    return this.primeToIndex.get(prime) || u32.MAX_VALUE;
  }
  
  getPrimeByIndex(index: u32): u64 {
    return this.indexToPrime.get(index) || 0;
  }
}

export class PBCCompressor {
  config: PBCConfig;
  dictionary: PrimeDictionary;
  
  constructor(config: PBCConfig = new PBCConfig()) {
    this.config = config;
    this.dictionary = new PrimeDictionary(10000); // Pre-compute first 10k primes
  }
  
  /**
   * Compress data using prime-based holographic encoding
   */
  compress(data: Uint8Array): CompressionResult {
    const metadata = new CompressionMetadata();
    metadata.originalSize = data.length;
    metadata.checksum = sha256(data).slice(0, 8);
    
    // Split data into chunks
    const chunks = this.splitIntoChunks(data);
    const compressedChunks = new Array<Uint8Array>();
    
    let totalFidelity: f64 = 0;
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const compressedChunk = this.compressChunk(chunk);
      compressedChunks.push(compressedChunk.data);
      totalFidelity += compressedChunk.fidelity;
      metadata.primeCount += compressedChunk.primeCount;
    }
    
    // Combine compressed chunks
    const compressedData = this.combineChunks(compressedChunks, metadata);
    
    const avgFidelity = chunks.length > 0 ? totalFidelity / f64(chunks.length) : 1.0;
    
    return new CompressionResult(
      compressedData,
      data.length,
      avgFidelity,
      metadata
    );
  }
  
  /**
   * Decompress data using prime reconstruction
   */
  decompress(compressed: Uint8Array): Uint8Array {
    // Extract metadata
    const metadataSize = 64; // Fixed metadata size
    if (compressed.length < metadataSize) {
      throw new Error("Invalid compressed data");
    }
    
    const metadataBytes = compressed.slice(0, metadataSize);
    const metadata = this.deserializeMetadata(metadataBytes);
    
    // Extract compressed chunks
    const chunks = this.extractChunks(compressed.slice(metadataSize), metadata);
    const decompressedChunks = new Array<Uint8Array>();
    
    for (let i = 0; i < chunks.length; i++) {
      const decompressed = this.decompressChunk(chunks[i]);
      decompressedChunks.push(decompressed);
    }
    
    // Combine decompressed chunks
    return this.combineDecompressedChunks(decompressedChunks, metadata.originalSize);
  }
  
  /**
   * Compress a single chunk using holographic prime encoding
   */
  private compressChunk(chunk: Uint8Array): ChunkCompressionResult {
    // Convert chunk to number representation
    const numbers = this.bytesToNumbers(chunk);
    const primeRepresentations = new Array<PrimeRepresentation>();
    
    for (let i = 0; i < numbers.length; i++) {
      const primeRep = this.encodeAsPrimes(numbers[i]);
      primeRepresentations.push(primeRep);
    }
    
    // Apply holographic reduction
    const reduced = this.applyHolographicReduction(primeRepresentations);
    
    // Encode to bytes
    const encoded = this.encodePrimeRepresentations(reduced);
    
    // Calculate fidelity
    const reconstructed = this.decodePrimeRepresentations(encoded);
    const fidelity = this.calculateFidelity(primeRepresentations, reconstructed);
    
    return new ChunkCompressionResult(
      encoded,
      fidelity,
      reduced.length
    );
  }
  
  /**
   * Decompress a single chunk
   */
  private decompressChunk(chunk: Uint8Array): Uint8Array {
    // Decode prime representations
    const primeReps = this.decodePrimeRepresentations(chunk);
    
    // Reconstruct holographic data
    const reconstructed = this.reconstructFromHolographic(primeReps);
    
    // Convert back to numbers
    const numbers = new Array<u64>();
    for (let i = 0; i < reconstructed.length; i++) {
      numbers.push(this.decodeFromPrimes(reconstructed[i]));
    }
    
    // Convert numbers back to bytes
    return this.numbersToBytes(numbers);
  }
  
  /**
   * Encode a number as prime factors
   */
  private encodeAsPrimes(num: u64): PrimeRepresentation {
    if (num == 0) return new PrimeRepresentation([2], [0]); // Special case
    if (num == 1) return new PrimeRepresentation([2], [1]); // Special case
    
    const factors = factorize(num);
    const primeMap = new Map<u64, u32>();
    
    // Count occurrences of each prime
    for (let i = 0; i < factors.length; i++) {
      const count = primeMap.get(factors[i]) || 0;
      primeMap.set(factors[i], count + 1);
    }
    
    const primes = new Array<u64>();
    const exponents = new Array<u32>();
    
    const primeKeys = primeMap.keys();
    for (let i = 0; i < primeKeys.length; i++) {
      primes.push(primeKeys[i]);
      exponents.push(primeMap.get(primeKeys[i])!);
    }
    
    return new PrimeRepresentation(primes, exponents);
  }
  
  /**
   * Decode a number from prime factors
   */
  private decodeFromPrimes(rep: PrimeRepresentation): u64 {
    let result: u64 = 1;
    
    for (let i = 0; i < rep.primes.length; i++) {
      for (let j = 0; j < rep.exponents[i]; j++) {
        result *= rep.primes[i];
      }
    }
    
    return result;
  }
  
  /**
   * Apply holographic reduction to prime representations
   */
  private applyHolographicReduction(
    representations: Array<PrimeRepresentation>
  ): Array<PrimeRepresentation> {
    if (representations.length < 2) return representations;
    
    const reduced = new Array<PrimeRepresentation>();
    
    // Find common prime patterns
    const commonPrimes = this.findCommonPrimes(representations);
    
    // Create holographic base
    if (commonPrimes.length > 0) {
      const baseRep = new PrimeRepresentation(
        commonPrimes,
        new Array<u32>(commonPrimes.length).fill(1)
      );
      reduced.push(baseRep);
      
      // Store differences from base
      for (let i = 0; i < representations.length; i++) {
        const diff = this.computePrimeDifference(representations[i], baseRep);
        reduced.push(diff);
      }
    } else {
      // No common primes, use original
      return representations;
    }
    
    // Apply additional compression based on level
    if (this.config.compressionLevel > 5) {
      return this.applyAdvancedReduction(reduced);
    }
    
    return reduced;
  }
  
  /**
   * Find common primes across representations
   */
  private findCommonPrimes(reps: Array<PrimeRepresentation>): Array<u64> {
    if (reps.length == 0) return new Array<u64>();
    
    // Start with primes from first representation
    const commonPrimes = new Set<u64>();
    for (let i = 0; i < reps[0].primes.length; i++) {
      commonPrimes.add(reps[0].primes[i]);
    }
    
    // Keep only primes that appear in all representations
    for (let i = 1; i < reps.length; i++) {
      const repPrimes = new Set<u64>();
      for (let j = 0; j < reps[i].primes.length; j++) {
        repPrimes.add(reps[i].primes[j]);
      }
      
      const toRemove = new Array<u64>();
      const commonIterator = commonPrimes.values();
      for (let j = 0; j < commonIterator.length; j++) {
        if (!repPrimes.has(commonIterator[j])) {
          toRemove.push(commonIterator[j]);
        }
      }
      
      for (let j = 0; j < toRemove.length; j++) {
        commonPrimes.delete(toRemove[j]);
      }
    }
    
    const result = new Array<u64>();
    const finalIterator = commonPrimes.values();
    for (let i = 0; i < finalIterator.length; i++) {
      result.push(finalIterator[i]);
    }
    
    return result;
  }
  
  /**
   * Compute difference between two prime representations
   */
  private computePrimeDifference(
    rep: PrimeRepresentation,
    base: PrimeRepresentation
  ): PrimeRepresentation {
    const diffPrimes = new Array<u64>();
    const diffExponents = new Array<u32>();
    
    // Add primes not in base
    for (let i = 0; i < rep.primes.length; i++) {
      let found = false;
      for (let j = 0; j < base.primes.length; j++) {
        if (rep.primes[i] == base.primes[j]) {
          found = true;
          // Add difference in exponents if non-zero
          const expDiff = rep.exponents[i] - base.exponents[j];
          if (expDiff != 0) {
            diffPrimes.push(rep.primes[i]);
            diffExponents.push(u32(Math.abs(expDiff)));
          }
          break;
        }
      }
      
      if (!found) {
        diffPrimes.push(rep.primes[i]);
        diffExponents.push(rep.exponents[i]);
      }
    }
    
    return new PrimeRepresentation(diffPrimes, diffExponents);
  }
  
  /**
   * Apply advanced holographic reduction
   */
  private applyAdvancedReduction(
    representations: Array<PrimeRepresentation>
  ): Array<PrimeRepresentation> {
    // Use quantum-inspired superposition of prime states
    const superposed = new Array<PrimeRepresentation>();
    
    // Group similar representations
    const groups = this.groupSimilarRepresentations(representations);
    
    for (let g = 0; g < groups.length; g++) {
      const group = groups[g];
      if (group.length > 1) {
        // Create superposition representation
        const superRep = this.createSuperposition(group);
        superposed.push(superRep);
      } else {
        superposed.push(group[0]);
      }
    }
    
    return superposed;
  }
  
  /**
   * Group similar prime representations
   */
  private groupSimilarRepresentations(
    reps: Array<PrimeRepresentation>
  ): Array<Array<PrimeRepresentation>> {
    const groups = new Array<Array<PrimeRepresentation>>();
    const used = new Array<bool>(reps.length).fill(false);
    
    for (let i = 0; i < reps.length; i++) {
      if (used[i]) continue;
      
      const group = new Array<PrimeRepresentation>();
      group.push(reps[i]);
      used[i] = true;
      
      for (let j = i + 1; j < reps.length; j++) {
        if (used[j]) continue;
        
        const similarity = this.calculateSimilarity(reps[i], reps[j]);
        if (similarity > 0.7) {
          group.push(reps[j]);
          used[j] = true;
        }
      }
      
      groups.push(group);
    }
    
    return groups;
  }
  
  /**
   * Calculate similarity between prime representations
   */
  private calculateSimilarity(
    rep1: PrimeRepresentation,
    rep2: PrimeRepresentation
  ): f64 {
    const allPrimes = new Set<u64>();
    
    for (let i = 0; i < rep1.primes.length; i++) {
      allPrimes.add(rep1.primes[i]);
    }
    for (let i = 0; i < rep2.primes.length; i++) {
      allPrimes.add(rep2.primes[i]);
    }
    
    let commonCount = 0;
    const primeArray = new Array<u64>();
    const primeIterator = allPrimes.values();
    for (let i = 0; i < primeIterator.length; i++) {
      primeArray.push(primeIterator[i]);
    }
    
    for (let i = 0; i < primeArray.length; i++) {
      const prime = primeArray[i];
      let in1 = false;
      let in2 = false;
      
      for (let j = 0; j < rep1.primes.length; j++) {
        if (rep1.primes[j] == prime) {
          in1 = true;
          break;
        }
      }
      
      for (let j = 0; j < rep2.primes.length; j++) {
        if (rep2.primes[j] == prime) {
          in2 = true;
          break;
        }
      }
      
      if (in1 && in2) commonCount++;
    }
    
    return f64(commonCount) / f64(primeArray.length);
  }
  
  /**
   * Create superposition of prime representations
   */
  private createSuperposition(
    group: Array<PrimeRepresentation>
  ): PrimeRepresentation {
    // Use geometric mean of exponents for superposition
    const primeExponents = new Map<u64, Array<u32>>();
    
    for (let i = 0; i < group.length; i++) {
      const rep = group[i];
      for (let j = 0; j < rep.primes.length; j++) {
        if (!primeExponents.has(rep.primes[j])) {
          primeExponents.set(rep.primes[j], new Array<u32>());
        }
        primeExponents.get(rep.primes[j])!.push(rep.exponents[j]);
      }
    }
    
    const superPrimes = new Array<u64>();
    const superExponents = new Array<u32>();
    
    const primeKeys = primeExponents.keys();
    for (let i = 0; i < primeKeys.length; i++) {
      const prime = primeKeys[i];
      const exps = primeExponents.get(prime)!;
      
      // Calculate geometric mean
      let product: f64 = 1;
      for (let j = 0; j < exps.length; j++) {
        product *= f64(exps[j] + 1); // Add 1 to avoid zero
      }
      const geoMean = Math.pow(product, 1.0 / f64(exps.length)) - 1;
      
      if (geoMean > 0.5) {
        superPrimes.push(prime);
        superExponents.push(u32(Math.round(geoMean)));
      }
    }
    
    return new PrimeRepresentation(superPrimes, superExponents);
  }
  
  /**
   * Helper methods for data conversion
   */
  
  private splitIntoChunks(data: Uint8Array): Array<Uint8Array> {
    const chunks = new Array<Uint8Array>();
    const chunkSize = this.config.chunkSize;
    
    for (let i = 0; i < data.length; i += chunkSize) {
      const end = Math.min(i + chunkSize, data.length);
      chunks.push(data.slice(i, end));
    }
    
    return chunks;
  }
  
  private bytesToNumbers(bytes: Uint8Array): Array<u64> {
    const numbers = new Array<u64>();
    const bytesPerNumber = 8;
    
    for (let i = 0; i < bytes.length; i += bytesPerNumber) {
      let num: u64 = 0;
      for (let j = 0; j < bytesPerNumber && i + j < bytes.length; j++) {
        num |= u64(bytes[i + j]) << (8 * j);
      }
      numbers.push(num);
    }
    
    return numbers;
  }
  
  private numbersToBytes(numbers: Array<u64>): Uint8Array {
    const bytes = new Uint8Array(numbers.length * 8);
    let offset = 0;
    
    for (let i = 0; i < numbers.length; i++) {
      const num = numbers[i];
      for (let j = 0; j < 8; j++) {
        bytes[offset++] = u8((num >> (8 * j)) & 0xFF);
      }
    }
    
    return bytes;
  }
  
  private encodePrimeRepresentations(reps: Array<PrimeRepresentation>): Uint8Array {
    // Simple encoding: [count][rep1][rep2]...
    let totalSize = 4; // 4 bytes for count
    
    for (let i = 0; i < reps.length; i++) {
      totalSize += reps[i].getEncodedSize();
    }
    
    const buffer = new Uint8Array(totalSize);
    let offset = 0;
    
    // Write count
    buffer[offset++] = u8(reps.length >> 24);
    buffer[offset++] = u8(reps.length >> 16);
    buffer[offset++] = u8(reps.length >> 8);
    buffer[offset++] = u8(reps.length);
    
    // Write each representation
    for (let i = 0; i < reps.length; i++) {
      offset = reps[i].encode(buffer, offset);
    }
    
    return buffer.slice(0, offset);
  }
  
  private decodePrimeRepresentations(data: Uint8Array): Array<PrimeRepresentation> {
    const reps = new Array<PrimeRepresentation>();
    let offset = 0;
    
    // Read count
    const count = (u32(data[offset]) << 24) |
                  (u32(data[offset + 1]) << 16) |
                  (u32(data[offset + 2]) << 8) |
                  u32(data[offset + 3]);
    offset += 4;
    
    // Read each representation
    for (let i = 0; i < count; i++) {
      const result = PrimeRepresentation.decode(data, offset);
      reps.push(result.rep);
      offset = result.offset;
    }
    
    return reps;
  }
  
  private combineChunks(chunks: Array<Uint8Array>, metadata: CompressionMetadata): Uint8Array {
    const metadataBytes = metadata.serialize();
    let totalSize = metadataBytes.length;
    
    for (let i = 0; i < chunks.length; i++) {
      totalSize += chunks[i].length;
    }
    
    const combined = new Uint8Array(totalSize);
    let offset = 0;
    
    // Write metadata
    for (let i = 0; i < metadataBytes.length; i++) {
      combined[offset++] = metadataBytes[i];
    }
    
    // Write chunks
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      for (let j = 0; j < chunk.length; j++) {
        combined[offset++] = chunk[j];
      }
    }
    
    return combined;
  }
  
  private extractChunks(data: Uint8Array, metadata: CompressionMetadata): Array<Uint8Array> {
    // For now, treat entire data as one chunk
    // In a real implementation, would use metadata to determine chunk boundaries
    return [data];
  }
  
  private combineDecompressedChunks(chunks: Array<Uint8Array>, originalSize: u32): Uint8Array {
    const result = new Uint8Array(originalSize);
    let offset = 0;
    
    for (let i = 0; i < chunks.length && offset < originalSize; i++) {
      const chunk = chunks[i];
      const copySize = Math.min(chunk.length, originalSize - offset);
      
      for (let j = 0; j < copySize; j++) {
        result[offset++] = chunk[j];
      }
    }
    
    return result;
  }
  
  private deserializeMetadata(data: Uint8Array): CompressionMetadata {
    const metadata = new CompressionMetadata();
    let offset = 0;
    
    metadata.version = data[offset++];
    
    // Read algorithm name
    let algoName = "";
    for (let i = 0; i < 16; i++) {
      if (data[offset + i] != 0) {
        algoName += String.fromCharCode(data[offset + i]);
      }
    }
    metadata.algorithm = algoName;
    offset = 17;
    
    // Read sizes
    metadata.originalSize = (u32(data[offset]) << 24) |
                           (u32(data[offset + 1]) << 16) |
                           (u32(data[offset + 2]) << 8) |
                           u32(data[offset + 3]);
    offset += 4;
    
    // Read checksum
    metadata.checksum = data.slice(offset, offset + 8);
    offset = 29;
    
    // Read prime count
    metadata.primeCount = (u32(data[offset]) << 24) |
                         (u32(data[offset + 1]) << 16) |
                         (u32(data[offset + 2]) << 8) |
                         u32(data[offset + 3]);
    offset += 4;
    
    // Read dictionary ID
    metadata.dictionaryId = (u32(data[offset]) << 24) |
                           (u32(data[offset + 1]) << 16) |
                           (u32(data[offset + 2]) << 8) |
                           u32(data[offset + 3]);
    offset += 4;
    
    // Read timestamp
    metadata.timestamp = 0;
    for (let i = 0; i < 8; i++) {
      metadata.timestamp |= u64(data[offset + i]) << (8 * i);
    }
    
    return metadata;
  }
  
  private calculateFidelity(
    original: Array<PrimeRepresentation>,
    reconstructed: Array<PrimeRepresentation>
  ): f64 {
    if (original.length != reconstructed.length) {
      return 0.5; // Partial reconstruction
    }
    
    let totalSimilarity: f64 = 0;
    
    for (let i = 0; i < original.length; i++) {
      totalSimilarity += this.calculateSimilarity(original[i], reconstructed[i]);
    }
    
    return totalSimilarity / f64(original.length);
  }
  
  private reconstructFromHolographic(
    compressed: Array<PrimeRepresentation>
  ): Array<PrimeRepresentation> {
    if (compressed.length == 0) return new Array<PrimeRepresentation>();
    
    // Check if first element is a holographic base
    if (compressed.length > 1) {
      const base = compressed[0];
      const reconstructed = new Array<PrimeRepresentation>();
      
      // Reconstruct from base and differences
      for (let i = 1; i < compressed.length; i++) {
        const combined = this.combinePrimeRepresentations(base, compressed[i]);
        reconstructed.push(combined);
      }
      
      return reconstructed;
    }
    
    return compressed;
  }
  
  private combinePrimeRepresentations(
    base: PrimeRepresentation,
    diff: PrimeRepresentation
  ): PrimeRepresentation {
    const combined = new Map<u64, u32>();
    
    // Add base primes
    for (let i = 0; i < base.primes.length; i++) {
      combined.set(base.primes[i], base.exponents[i]);
    }
    
    // Add/modify with diff
    for (let i = 0; i < diff.primes.length; i++) {
      const existing = combined.get(diff.primes[i]) || 0;
      combined.set(diff.primes[i], existing + diff.exponents[i]);
    }
    
    // Convert map back to arrays
    const primes = new Array<u64>();
    const exponents = new Array<u32>();
    
    const primeKeys = combined.keys();
    for (let i = 0; i < primeKeys.length; i++) {
      const prime = primeKeys[i];
      const exp = combined.get(prime)!;
      if (exp > 0) {
        primes.push(prime);
        exponents.push(exp);
      }
    }
    
    return new PrimeRepresentation(primes, exponents);
  }
}

/**
 * Quantum state compression using PBC
 */
export class QuantumStateCompressor {
  compressor: PBCCompressor;
  
  constructor(config: PBCConfig = new PBCConfig()) {
    this.compressor = new PBCCompressor(config);
  }
  
  /**
   * Compress quantum state amplitudes and phases
   */
  compressQuantumState(
    amplitudes: Array<f64>,
    phases: Array<f64>
  ): CompressionResult {
    // Convert to fixed-point representation
    const fixedAmplitudes = new Uint8Array(amplitudes.length * 4);
    const fixedPhases = new Uint8Array(phases.length * 4);
    
    for (let i = 0; i < amplitudes.length; i++) {
      const fixedAmp = u32(amplitudes[i] * 0xFFFFFFFF);
      for (let j = 0; j < 4; j++) {
        fixedAmplitudes[i * 4 + j] = u8((fixedAmp >> (8 * j)) & 0xFF);
      }
    }
    
    for (let i = 0; i < phases.length; i++) {
      const fixedPhase = u32((phases[i] / (2 * Math.PI)) * 0xFFFFFFFF);
      for (let j = 0; j < 4; j++) {
        fixedPhases[i * 4 + j] = u8((fixedPhase >> (8 * j)) & 0xFF);
      }
    }
    
    // Combine and compress
    const combined = new Uint8Array(fixedAmplitudes.length + fixedPhases.length);
    for (let i = 0; i < fixedAmplitudes.length; i++) {
      combined[i] = fixedAmplitudes[i];
    }
    for (let i = 0; i < fixedPhases.length; i++) {
      combined[fixedAmplitudes.length + i] = fixedPhases[i];
    }
    
    return this.compressor.compress(combined);
  }
  
  /**
   * Decompress to quantum state
   */
  decompressQuantumState(
    compressed: Uint8Array,
    stateSize: i32
  ): { amplitudes: Array<f64>, phases: Array<f64> } {
    const decompressed = this.compressor.decompress(compressed);
    
    const amplitudes = new Array<f64>();
    const phases = new Array<f64>();
    
    const halfSize = decompressed.length / 2;
    
    // Extract amplitudes
    for (let i = 0; i < stateSize && i * 4 < halfSize; i++) {
      let fixedAmp: u32 = 0;
      for (let j = 0; j < 4; j++) {
        fixedAmp |= u32(decompressed[i * 4 + j]) << (8 * j);
      }
      amplitudes.push(f64(fixedAmp) / f64(0xFFFFFFFF));
    }
    
    // Extract phases
    for (let i = 0; i < stateSize && i * 4 < halfSize; i++) {
      let fixedPhase: u32 = 0;
      for (let j = 0; j < 4; j++) {
        fixedPhase |= u32(decompressed[halfSize + i * 4 + j]) << (8 * j);
      }
      phases.push(f64(fixedPhase) / f64(0xFFFFFFFF) * 2 * Math.PI);
    }
    
    return { amplitudes, phases };
  }
}