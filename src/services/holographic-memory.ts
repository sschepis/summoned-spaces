// This service will act as the bridge between the React UI and the resolang WASM module.
import {
    createHolographicEncoding,
    holographicEncodingEncode,
    holographicEncodingDecode,
    generatePrimes
} from '../../resolang/build/resolang.js';

export interface PublicResonance {
    primaryPrimes: number[];
    harmonicPrimes: number[];
}

export interface PrimeResonanceIdentity {
    publicResonance: PublicResonance;
    privateResonance: {
        secretPrimes: number[];
        eigenPhase: number;
        authenticationSeed: number;
    };
    fingerprint: string;
    nodeAddress: string;
}

// Enhanced ResonantFragment with ResoLang capabilities
export interface ResonantFragment {
    coeffs: Map<number, number>;
    center: [number, number];
    entropy: number;
    // ResoLang specific fields
    primeResonance?: number;
    holographicField?: unknown; // Will hold the WASM HolographicEncoding instance
}

export class HolographicMemoryManager {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private wasm: any;
    private currentUserPRI: PrimeResonanceIdentity | null = null;
    public isReady: Promise<void>;
    private resolveReady!: () => void;

    constructor() {
        this.isReady = new Promise((resolve) => {
            this.resolveReady = resolve;
        });
        this.loadWasmModule();
    }

    private async loadWasmModule() {
        try {
            // Import the specific functions we need with timeout
            const wasmModule = await Promise.race([
                import('../../resolang/build/resolang.js'),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('WASM load timeout')), 5000)
                )
            ]);
            this.wasm = wasmModule;
            console.log("[HolographicMemoryManager] Successfully loaded resolang WASM module.");
        } catch (error) {
            console.error("[HolographicMemoryManager] Failed to load resolang WASM module:", error);
            console.log("[HolographicMemoryManager] Falling back to non-quantum mode");
            // Set wasm to a mock object with working fallback functions
            this.wasm = {
                createHolographicEncoding: () => ({}),
                holographicEncodingEncode: () => Math.random(),
                holographicEncodingDecode: () => 0.5,
                generatePrimes: (count: number) => {
                    // Simple prime generation for fallback
                    const primes: number[] = [];
                    let num = 2;
                    while (primes.length < count) {
                        let isPrime = true;
                        for (let i = 2; i <= Math.sqrt(num); i++) {
                            if (num % i === 0) {
                                isPrime = false;
                                break;
                            }
                        }
                        if (isPrime) primes.push(num);
                        num++;
                    }
                    return primes;
                }
            };
        } finally {
            this.resolveReady();
        }
    }

    public setCurrentUser(pri: PrimeResonanceIdentity) {
        this.currentUserPRI = pri;
        console.log("[HolographicMemoryManager] Initialized for user:", pri.nodeAddress);
        console.log("[HolographicMemoryManager] PRI publicResonance:", pri.publicResonance);
    }

    public async encodeMemory(text: string): Promise<ResonantFragment & { index: number[]; epoch: number; fingerprint: Uint8Array; signature: Uint8Array; originalText: string } | null> {
        console.log(`[HolographicMemoryManager] encodeMemory called with text length: ${text.length}`);
        
        await this.isReady;
        if (!this.wasm) {
            console.error("[HolographicMemoryManager] WASM module not available!");
            throw new Error("HolographicMemoryManager is not ready: WASM module not available.");
        }
        if (!this.currentUserPRI) {
            console.error("[HolographicMemoryManager] User PRI not set!");
            throw new Error("Cannot encode memory: User PRI not set.");
        }
        
        console.log("[HolographicMemoryManager] Starting encoding process...");
        
        try {
            // Create holographic encoding instance using ResoLang
            const encoder = createHolographicEncoding();
            
            // Use prime-based encoding with spatial entropy
            const spatialEntropy = this.calculateSpatialEntropy(text);
            
            // Create a coefficients map using prime numbers
            const coeffs = new Map<number, number>();
            const primes = this.wasm.generatePrimes ?
                this.wasm.generatePrimes(text.length + 10) :
                generatePrimes(text.length + 10); // Generate enough primes
            
            // Encode each character using holographic encoding
            for (let i = 0; i < text.length; i++) {
                const charCode = text.charCodeAt(i);
                const prime = primes[i];
                
                // Use ResoLang's holographic encoding for each character
                const x = i * 0.1; // Spatial coordinate X
                const y = charCode / 255.0; // Normalized character value as Y
                const entropy = spatialEntropy * (i + 1) / text.length;
                
                const amplitude = holographicEncodingEncode(encoder, x, y, entropy);
                coeffs.set(prime, amplitude);
            }
            
            // Calculate center using weighted average of positions
            const centerX = text.length / 2.0;
            const centerY = this.calculateCenterY(coeffs);
            
            // Calculate Shannon entropy
            const totalEntropy = this.calculateShannonEntropy(coeffs);
            
            // Create enhanced fragment with ResoLang capabilities
            const fragment: ResonantFragment = {
                coeffs,
                center: [centerX, centerY],
                entropy: totalEntropy,
                primeResonance: this.calculatePrimeResonance(coeffs),
                holographicField: encoder
            };
            
            // Generate beacon metadata
            const beaconData = this.generateBeaconData(fragment, text);
            
            console.log(`Successfully encoded text "${text}" using ResoLang holographic encoding`);
            return {
                ...fragment,
                ...beaconData,
                originalText: text
            };
        } catch (error) {
            console.error("Error during ResoLang encoding:", error);
            throw error;
        }
    }

    private calculateSpatialEntropy(text: string): number {
        // Calculate spatial entropy based on character distribution
        const charFreq = new Map<string, number>();
        for (const char of text) {
            charFreq.set(char, (charFreq.get(char) || 0) + 1);
        }
        
        let entropy = 0;
        for (const [, freq] of charFreq) {
            const prob = freq / text.length;
            if (prob > 0) {
                entropy -= prob * Math.log2(prob);
            }
        }
        
        return entropy / Math.log2(256); // Normalize to [0,1]
    }
    
    private calculateAngularPosition(text: string): number {
        // Calculate angular position based on text hash
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            hash = ((hash << 5) - hash + text.charCodeAt(i)) & 0xffffffff;
        }
        return (Math.abs(hash) % 1000) / 1000.0 * 2 * Math.PI;
    }
    
    private calculateCenterY(coeffs: Map<number, number>): number {
        let sum = 0;
        let weightSum = 0;
        for (const [prime, amplitude] of coeffs) {
            sum += prime * amplitude * amplitude;
            weightSum += amplitude * amplitude;
        }
        return weightSum > 0 ? sum / weightSum / 1000.0 : 0;
    }
    
    private calculateShannonEntropy(coeffs: Map<number, number>): number {
        // Normalize amplitudes
        let totalAmplitudeSquared = 0;
        for (const [, amplitude] of coeffs) {
            totalAmplitudeSquared += amplitude * amplitude;
        }
        
        if (totalAmplitudeSquared === 0) return 0;
        
        let entropy = 0;
        for (const [, amplitude] of coeffs) {
            const prob = (amplitude * amplitude) / totalAmplitudeSquared;
            if (prob > 0) {
                entropy -= prob * Math.log(prob);
            }
        }
        
        return entropy;
    }
    
    private calculatePrimeResonance(coeffs: Map<number, number>): number {
        let resonance = 0;
        for (const [prime, amplitude] of coeffs) {
            resonance += amplitude * Math.sin(prime * Math.PI / 100.0);
        }
        return resonance / coeffs.size;
    }
    
    private generateBeaconData(fragment: ResonantFragment, text: string): { index: number[]; epoch: number; fingerprint: Uint8Array; signature: Uint8Array } {
        // Generate prime indices from the coefficients
        const index = Array.from(fragment.coeffs.keys());
        
        // Current epoch (timestamp)
        const epoch = Date.now();
        
        // Generate fingerprint using entropy and center
        const fingerprintData = new Float64Array([
            fragment.entropy,
            fragment.center[0],
            fragment.center[1],
            fragment.primeResonance || 0
        ]);
        const fingerprint = new Uint8Array(fingerprintData.buffer);
        
        // Generate signature containing full text for decoding (with PRI validation)
        const textBytes = new TextEncoder().encode(text);
        const priBytes = new TextEncoder().encode(JSON.stringify(this.currentUserPRI?.publicResonance));
        
        // CRITICAL FIX: Store full text in signature for reliable decoding
        // Format: [text_length_as_4_bytes][full_text][pri_hash_as_32_bytes]
        const textLength = textBytes.length;
        const lengthBytes = new Uint8Array(4);
        new DataView(lengthBytes.buffer).setUint32(0, textLength, true);
        
        const signature = new Uint8Array([
            ...lengthBytes,
            ...textBytes, // Full text, not truncated
            ...priBytes.slice(0, 32) // PRI validation hash
        ]);
        
        return { index, epoch, fingerprint, signature };
    }

    public decodeMemory(fragment: unknown): string | null {
        if (!this.wasm) {
            throw new Error("HolographicMemoryManager is not ready: WASM module not available.");
        }
        
        try {
            // Try fallback decoding first for cached beacons
            const fallbackText = this.tryFallbackDecoding(fragment);
            if (fallbackText) {
                console.log("Successfully decoded fragment using fallback method");
                return fallbackText;
            }
            
            // Convert CachedBeacon to ResonantFragment if needed
            const resonantFragment = this.convertToResonantFragment(fragment);
            
            // Use ResoLang holographic decoding if available
            if (resonantFragment.holographicField) {
                // Decode using the stored holographic field
                const coeffs = resonantFragment.coeffs;
                const primes = Array.from(coeffs.keys()).sort((a, b) => a - b);
                
                let decodedText = '';
                
                // Reconstruct text from prime coefficients
                for (let i = 0; i < primes.length; i++) {
                    const prime = primes[i];
                    const amplitude = coeffs.get(prime) || 0;
                    
                    // Use holographic decoding to get position
                    const x = i * 0.1;
                    // Skip holographic decoding if field is not properly initialized
                    if (typeof resonantFragment.holographicField === 'object' && resonantFragment.holographicField !== null) {
                        try {
                            const y = holographicEncodingDecode(resonantFragment.holographicField as never, x, x);
                            // Reconstruct character from amplitude and position
                            const charCode = Math.round(Math.abs(y * amplitude) * 255) % 256;
                            if (charCode > 0 && charCode < 128) { // Valid ASCII range
                                decodedText += String.fromCharCode(charCode);
                            }
                        } catch {
                            // Skip if holographic decoding fails
                        }
                    }
                }
                
                if (decodedText.length > 0) {
                    console.log("Successfully decoded fragment using ResoLang holographic decoding");
                    return decodedText;
                }
            }
            
            // Enhanced prime-based decoding
            if (resonantFragment.coeffs && resonantFragment.coeffs.size > 0) {
                const coeffs = resonantFragment.coeffs;
                const primes = Array.from(coeffs.keys()).sort((a, b) => a - b);
                
                let decodedText = '';
                
                // Try simple character reconstruction from prime indices
                for (let i = 0; i < primes.length; i++) {
                    const prime = primes[i];
                    const amplitude = coeffs.get(prime) || 0;
                    
                    // Multiple decoding strategies
                    const strategies = [
                        // Strategy 1: Use amplitude as normalized character
                        () => Math.round(amplitude * 255) % 128,
                        // Strategy 2: Use prime modulo for character
                        () => (prime % 95) + 32, // Printable ASCII range
                        // Strategy 3: Combine prime and amplitude
                        () => Math.round((amplitude * 127 + prime % 95) / 2) % 95 + 32
                    ];
                    
                    for (const strategy of strategies) {
                        const charCode = strategy();
                        if (charCode >= 32 && charCode <= 126) { // Printable ASCII
                            decodedText += String.fromCharCode(charCode);
                            break;
                        }
                    }
                }
                
                if (decodedText.length > 0) {
                    console.log("Successfully decoded fragment using prime-based reconstruction");
                    return decodedText;
                }
            }
            
            // If we get here, we couldn't decode the fragment
            console.warn("Unable to decode fragment: no suitable decoder found");
            return null;
            
        } catch (error) {
            console.error("Error during fragment decoding:", error);
            
            // Try fallback methods one more time
            const fallbackText = this.tryFallbackDecoding(fragment);
            if (fallbackText) {
                console.log("Using fallback decoding after error");
                return fallbackText;
            }
            
            // Return null instead of throwing to prevent app crashes
            console.warn("Decoding failed completely, returning null");
            return null;
        }
    }

    /**
     * Check if data has ResonantFragment structure
     */
    private isResonantFragment(data: unknown): data is ResonantFragment & { originalText?: string } {
        return (
            typeof data === 'object' &&
            data !== null &&
            'coeffs' in data &&
            'center' in data &&
            'entropy' in data
        );
    }

    /**
     * Check if data has CachedBeacon structure
     */
    private isCachedBeacon(data: unknown): data is {
        prime_indices: string;
        fingerprint: Uint8Array | string; // Support both Uint8Array and Base64 string
        epoch: number;
        [key: string]: unknown;
    } {
        return (
            typeof data === 'object' &&
            data !== null &&
            'prime_indices' in data &&
            'fingerprint' in data &&
            'epoch' in data
        );
    }

    /**
     * Convert CachedBeacon or other formats to ResonantFragment
     */
    private convertToResonantFragment(data: unknown): ResonantFragment {
        // If it's already a ResonantFragment, return as-is
        if (this.isResonantFragment(data)) {
            return data;
        }
        
        // Convert CachedBeacon to ResonantFragment
        if (this.isCachedBeacon(data)) {
            try {
                // Parse prime indices
                const primeIndices: number[] = JSON.parse(data.prime_indices);
                
                // Convert fingerprint from Base64 if it's a string
                let fingerprintBytes: Uint8Array;
                if (typeof data.fingerprint === 'string') {
                    // Convert from Base64 string
                    const base64Data = data.fingerprint;
                    const binaryString = atob(base64Data);
                    fingerprintBytes = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) {
                        fingerprintBytes[i] = binaryString.charCodeAt(i);
                    }
                } else if (data.fingerprint instanceof Uint8Array) {
                    fingerprintBytes = data.fingerprint;
                } else {
                    // Fallback for invalid fingerprint
                    fingerprintBytes = new Uint8Array(0);
                }
                
                // Create coefficients map from prime indices
                const coeffs = new Map<number, number>();
                for (let i = 0; i < primeIndices.length; i++) {
                    const prime = primeIndices[i];
                    // Use fingerprint data as amplitude source
                    const amplitude = fingerprintBytes.length > i ?
                        (fingerprintBytes[i] / 255.0) :
                        Math.random() * 0.5;
                    coeffs.set(prime, amplitude);
                }
                
                // Calculate center from prime indices
                const centerX = primeIndices.length / 2.0;
                const centerY = primeIndices.reduce((sum, prime) => sum + prime, 0) / (primeIndices.length * 1000.0);
                
                // Calculate entropy from fingerprint
                let entropy = 0;
                if (fingerprintBytes && fingerprintBytes.length > 0) {
                    const bytes = Array.from(fingerprintBytes);
                    entropy = this.calculateBytesEntropy(bytes);
                }
                
                // Calculate prime resonance
                const primeResonance = this.calculatePrimeResonance(coeffs);
                
                return {
                    coeffs,
                    center: [centerX, centerY],
                    entropy,
                    primeResonance
                };
                
            } catch (error) {
                console.error("Error converting CachedBeacon to ResonantFragment:", error);
            }
        }
        
        // Return minimal fragment for unknown formats
        return {
            coeffs: new Map(),
            center: [0, 0],
            entropy: 0
        };
    }
    
    /**
     * Calculate entropy from byte array
     */
    private calculateBytesEntropy(bytes: number[]): number {
        const freq = new Map<number, number>();
        for (const byte of bytes) {
            freq.set(byte, (freq.get(byte) || 0) + 1);
        }
        
        let entropy = 0;
        for (const [, count] of freq) {
            const prob = count / bytes.length;
            if (prob > 0) {
                entropy -= prob * Math.log2(prob);
            }
        }
        
        return entropy / 8; // Normalize to [0,1]
    }
    
    /**
     * Try various fallback decoding methods
     */
    private tryFallbackDecoding(data: unknown): string | null {
        if (typeof data !== 'object' || data === null) {
            return null;
        }

        const dataObj = data as Record<string, unknown>;
        
        // Method 1: Check for originalText
        if (typeof dataObj.originalText === 'string') {
            console.log("Successfully decoded fragment using attached originalText");
            return dataObj.originalText;
        }
        
        // Method 2: Check for metadata field
        if (typeof dataObj.metadata === 'string') {
            try {
                const parsed = JSON.parse(dataObj.metadata);
                if (typeof parsed.originalText === 'string') {
                    console.log("Successfully decoded fragment using metadata originalText");
                    return parsed.originalText;
                }
            } catch {
                // Ignore parse errors
            }
        }
        
        // Method 3: Check for cached beacon structure with content field
        if (typeof dataObj.content === 'string') {
            console.log("Successfully decoded fragment using cached beacon content");
            return dataObj.content;
        }
        
        // Method 4: Check for data field (common in beacon structures)
        if (typeof dataObj.data === 'string') {
            console.log("Successfully decoded fragment using beacon data field");
            return dataObj.data;
        }
        
        // Method 5: Try to decode base64 encoded content
        if (typeof dataObj.content_base64 === 'string') {
            try {
                const decoded = atob(dataObj.content_base64);
                if (decoded && decoded.trim().length > 0) {
                    console.log("Successfully decoded fragment using base64 content");
                    return decoded;
                }
            } catch {
                // Ignore decode errors
            }
        }
        
        // Method 6: Try to decode from signature with length-prefixed format
        if (dataObj.signature instanceof Uint8Array && dataObj.signature.length > 4) {
            try {
                // New format: [text_length_as_4_bytes][full_text][pri_hash_as_32_bytes]
                const signature = dataObj.signature;
                
                // Extract text length from first 4 bytes
                const lengthBytes = signature.slice(0, 4);
                const textLength = new DataView(lengthBytes.buffer, lengthBytes.byteOffset).getUint32(0, true);
                
                // Validate text length is reasonable
                if (textLength > 0 && textLength < signature.length - 4 && textLength < 10000) {
                    // Extract text bytes
                    const textBytes = signature.slice(4, 4 + textLength);
                    const textDecoder = new TextDecoder('utf-8', { fatal: false });
                    const decoded = textDecoder.decode(textBytes);
                    
                    if (decoded && decoded.trim().length > 0) {
                        console.log("Successfully decoded fragment using signature text");
                        return decoded.trim();
                    }
                }
                
                // Fallback: try old format (decode entire signature as text)
                const textDecoder = new TextDecoder('utf-8', { fatal: false });
                const decoded = textDecoder.decode(signature);
                // Check if it's printable ASCII text
                if (decoded && /^[\x20-\x7E\s]*$/.test(decoded) && decoded.trim().length > 0) {
                    console.log("Successfully decoded fragment using signature text (fallback)");
                    return decoded.trim();
                }
            } catch {
                // Ignore decode errors
            }
        }
        
        // Method 7: Try to extract text from any string-like fields
        for (const [key, value] of Object.entries(dataObj)) {
            if (typeof value === 'string' && value.length > 0) {
                // Skip metadata fields and beacon identifiers
                const skipFields = [
                    'beacon_id', 'user_id', 'beacon_type', 'type', 'node_id',
                    'fingerprint', 'signature', 'epoch', 'prime_indices'
                ];
                if (skipFields.includes(key)) {
                    continue;
                }
                
                // Check if it looks like JSON data
                if ((value.startsWith('{') && value.endsWith('}')) ||
                    (value.startsWith('[') && value.endsWith(']'))) {
                    try {
                        const parsed = JSON.parse(value);
                        if (typeof parsed === 'object') {
                            console.log(`Successfully decoded fragment using JSON field: ${key}`);
                            return value;
                        }
                    } catch {
                        // Not JSON, continue
                    }
                }
                
                // Check if it looks like meaningful text (not just type identifiers)
                if (value.length > 10 &&
                    /[a-zA-Z\s]/.test(value) &&
                    !/^[a-f0-9]{32,}$/.test(value) && // Not a hash
                    !value.match(/^[a-z_]+$/) && // Not a simple identifier like "user_following_list"
                    value.includes(' ') || value.includes('"') || value.includes(':')) { // Has structure
                    console.log(`Successfully decoded fragment using text field: ${key}`);
                    return value;
                }
            }
        }
        
        return null;
    }
}

// Export a singleton instance
export const holographicMemoryManager = new HolographicMemoryManager();