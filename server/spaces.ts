/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { getDatabase } from './database';
import { PostManager } from './posts';
import { webcrypto } from "crypto";

const cryptoAPI = webcrypto;

async function sha256(data: Uint8Array): Promise<Uint8Array> {
  const dig = await cryptoAPI.subtle.digest("SHA-256", data);
  return new Uint8Array(dig);
}

export class SpaceManager {
    private postManager: PostManager;

    constructor(postManager: PostManager) {
        this.postManager = postManager;
        console.log('SpaceManager initialized');
    }

    async createSpace(ownerId: string, name: string, description: string, isPublic: boolean): Promise<{ spaceId: string }> {
        const db = getDatabase();
        
        // Validate input
        if (!name || name.trim().length < 3) {
            throw new Error('Space name must be at least 3 characters long');
        }
        if (name.trim().length > 50) {
            throw new Error('Space name must be 50 characters or less');
        }
        if (description && description.length > 500) {
            throw new Error('Description must be 500 characters or less');
        }
        if (!/^[a-zA-Z0-9\s\-_]+$/.test(name.trim())) {
            throw new Error('Space name can only contain letters, numbers, spaces, hyphens, and underscores');
        }
        
        // Check for name uniqueness
        const existingSpace = await new Promise<any>((resolve, reject) => {
            db.get('SELECT space_id FROM spaces WHERE LOWER(name) = LOWER(?)', [name.trim()], (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
        });
        
        if (existingSpace) {
            throw new Error('A space with this name already exists');
        }
        
        const spaceId = `space_${Math.random().toString(36).substr(2, 9)}`;
        
        // Store space metadata in the database
        const sql = `
            INSERT INTO spaces (space_id, name, description, is_public, created_at)
            VALUES (?, ?, ?, ?, ?)
        `;
        
        const params = [
            spaceId,
            name.trim(),
            description.trim(),
            isPublic ? 1 : 0,
            new Date().toISOString()
        ];

        return new Promise((resolve, reject) => {
            db.run(sql, params, (err: Error | null) => {
                if (err) {
                    console.error('Error creating space', err.message);
                    return reject(err);
                }
                console.log(`Space created: ${name} (${spaceId}) by ${ownerId}`);
                
                // Ownership is handled by the client-side SpaceManager via beacons
                resolve({ spaceId });
            });
        });
    }

    // Join/leave operations - validate space exists and log activity
    async joinSpace(spaceId: string, userId: string): Promise<void> {
        console.log(`User ${userId} joining space ${spaceId}`);
        
        // Validate space exists
        const db = getDatabase();
        const space = await new Promise<any>((resolve, reject) => {
            db.get('SELECT space_id, name FROM spaces WHERE space_id = ?', [spaceId], (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
        });
        
        if (!space) {
            throw new Error('Space not found');
        }
        
        // Membership is handled by client-side beacons, but server validates
        console.log(`User ${userId} validated for joining space ${space.name} (${spaceId})`);
        return Promise.resolve();
    }

    async leaveSpace(spaceId: string, userId: string): Promise<void> {
        console.log(`User ${userId} leaving space ${spaceId}`);
        
        // Validate space exists
        const db = getDatabase();
        const space = await new Promise<any>((resolve, reject) => {
            db.get('SELECT space_id, name FROM spaces WHERE space_id = ?', [spaceId], (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
        });
        
        if (!space) {
            throw new Error('Space not found');
        }
        
        // Membership is handled by client-side beacons, but server validates
        console.log(`User ${userId} validated for leaving space ${space.name} (${spaceId})`);
        return Promise.resolve();
    }

    async getUserSpaces(userId: string): Promise<Array<{
        space_id: string;
        name: string;
        description: string;
        is_public: number;
        created_at: string;
    }>> {
        console.log(`Getting spaces for user ${userId}`);
        
        // Since membership is stored in beacons, return all spaces for now
        // Client will filter based on actual membership beacons
        // In the future, we could maintain a server-side membership cache
        const db = getDatabase();
        const sql = `SELECT * FROM spaces ORDER BY created_at DESC`;

        return new Promise((resolve, reject) => {
            db.all(sql, [], (err, rows: Array<{
                space_id: string;
                name: string;
                description: string;
                is_public: number;
                created_at: string;
            }>) => {
                if (err) {
                    console.error('Error getting user spaces', err.message);
                    return reject(err);
                }
                console.log(`Found ${rows.length} total spaces for client-side filtering`);
                resolve(rows);
            });
        });
    }

    async getPublicSpaces(): Promise<Array<{
        space_id: string;
        name: string;
        description: string;
        is_public: number;
        created_at: string;
    }>> {
        const db = getDatabase();
        const sql = `SELECT * FROM spaces WHERE is_public = 1 ORDER BY created_at DESC`;

        return new Promise((resolve, reject) => {
            db.all(sql, [], (err, rows: Array<{
                space_id: string;
                name: string;
                description: string;
                is_public: number;
                created_at: string;
            }>) => {
                if (err) {
                    console.error('Error getting public spaces', err.message);
                    return reject(err);
                }
                resolve(rows);
            });
        });
    }

    async getAllSpaces(): Promise<Array<{
        space_id: string;
        name: string;
        description: string;
        is_public: number;
        created_at: string;
    }>> {
        const db = getDatabase();
        const sql = `SELECT * FROM spaces ORDER BY created_at DESC`;

        return new Promise((resolve, reject) => {
            db.all(sql, [], (err, rows: Array<{
                space_id: string;
                name: string;
                description: string;
                is_public: number;
                created_at: string;
            }>) => {
                if (err) {
                    console.error('Error getting all spaces', err.message);
                    return reject(err);
                }
                resolve(rows);
            });
        });
    }

    async addFileToSpace(spaceId: string, uploaderId: string, fileInfo: { fileName: string, fileType: string, fileSize: number, fingerprint: string, fileContent?: string }): Promise<void> {
        // 1. Create a new 'file_metadata' beacon for the file.
        const fileMetadata = { ...fileInfo, uploaderId, createdAt: new Date().toISOString() };
        const fileBeacon = await this.prgPut(
            new TextEncoder().encode(`file:${fileInfo.fingerprint}`),
            new TextEncoder().encode(JSON.stringify(fileMetadata)),
            Math.floor(Date.now() / 2000),
            new TextEncoder().encode("auth-secret"),
            new TextEncoder().encode(`space-key:${spaceId}`)
        );
        await this.postManager.handleBeaconSubmission(uploaderId, fileBeacon.beacon, 'file_metadata');

        // 1b. Store file content in a separate beacon if provided
        if (fileInfo.fileContent) {
            console.log(`[SpaceManager] Storing file content for ${fileInfo.fingerprint}, size: ${fileInfo.fileContent.length} chars`);
            const contentBeacon = await this.prgPut(
                new TextEncoder().encode(`file-content:${fileInfo.fingerprint}`),
                new TextEncoder().encode(fileInfo.fileContent),
                Math.floor(Date.now() / 2000),
                new TextEncoder().encode("auth-secret"),
                new TextEncoder().encode(`space-key:${spaceId}`)
            );
            await this.postManager.handleBeaconSubmission(uploaderId, contentBeacon.beacon, 'file_content');
            console.log(`[SpaceManager] File content beacon submitted for ${fileInfo.fingerprint}`);
        }

        // 2. Retrieve the current 'space_file_index' beacon.
        const fileIndexBeacon = await this.getSpaceFileIndex(spaceId);
        let fileIndex: any[] = [];
        if (fileIndexBeacon) {
            try {
                const decodedIndex = await this.prgGet(
                    new TextEncoder().encode(`space-files:${spaceId}`),
                    fileIndexBeacon,
                    new TextEncoder().encode(`space-key:${spaceId}`),
                    () => [] // This should be a proper phase provider
                );
                const indexText = new TextDecoder().decode(decodedIndex.payload);
                console.log(`[SpaceManager] Decoded file index length: ${indexText.length} characters`);
                
                // Add validation and error handling for JSON parsing
                if (indexText.trim().length > 0) {
                    try {
                        fileIndex = JSON.parse(indexText);
                        if (!Array.isArray(fileIndex)) {
                            console.warn(`[SpaceManager] File index is not an array, resetting to empty array`);
                            fileIndex = [];
                        }
                    } catch (parseError) {
                        console.error(`[SpaceManager] Failed to parse file index JSON:`, parseError);
                        console.error(`[SpaceManager] Corrupted JSON content (first 500 chars):`, indexText.substring(0, 500));
                        fileIndex = []; // Reset to empty array on parse error
                    }
                }
            } catch (decodingError) {
                console.error(`[SpaceManager] Failed to decode file index beacon:`, decodingError);
                fileIndex = []; // Reset to empty array on decoding error
            }
        }

        // 3. Check if adding this file would exceed reasonable limits
        const newFileEntry = {
            fileName: fileInfo.fileName,
            fileType: fileInfo.fileType,
            fileSize: fileInfo.fileSize,
            fingerprint: fileInfo.fingerprint,
            uploaderId,
            createdAt: fileMetadata.createdAt,
        };
        
        // Remove duplicate files with same fingerprint
        fileIndex = fileIndex.filter(f => f.fingerprint !== fileInfo.fingerprint);
        fileIndex.push(newFileEntry);
        
        // Check JSON size limits before encoding
        const indexJson = JSON.stringify(fileIndex);
        const maxIndexSize = 50000; // 50KB limit for file index
        
        if (indexJson.length > maxIndexSize) {
            // Remove oldest files to make room for new one
            console.warn(`[SpaceManager] File index too large (${indexJson.length} chars), removing oldest files`);
            fileIndex.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            
            while (JSON.stringify(fileIndex).length > maxIndexSize && fileIndex.length > 1) {
                const removed = fileIndex.shift();
                console.log(`[SpaceManager] Removed old file from index: ${removed?.fileName}`);
            }
        }

        // 4. Submit the updated 'space_file_index' beacon.
        try {
            const finalIndexJson = JSON.stringify(fileIndex);
            console.log(`[SpaceManager] Final file index size: ${finalIndexJson.length} characters, ${fileIndex.length} files`);
            
            const updatedIndexBeacon = await this.prgPut(
                new TextEncoder().encode(`space-files:${spaceId}`),
                new TextEncoder().encode(finalIndexJson),
                Math.floor(Date.now() / 2000),
                new TextEncoder().encode("auth-secret"),
                new TextEncoder().encode(`space-key:${spaceId}`)
            );
            await this.postManager.handleBeaconSubmission(spaceId, updatedIndexBeacon.beacon, 'space_file_index');
            console.log(`[SpaceManager] Successfully updated space file index for ${spaceId}`);
        } catch (encodingError) {
            console.error(`[SpaceManager] Failed to encode updated file index:`, encodingError);
            throw new Error('Failed to update space file index: encoding error');
        }
    }

    async removeFileFromSpace(spaceId: string, removerId: string, fingerprint: string): Promise<void> {
        // 1. Verify that 'removerId' has permission to remove files.
        // TODO: Add permission check

        // 2. Retrieve the 'space_file_index' beacon.
        const fileIndexBeacon = await this.getSpaceFileIndex(spaceId);
        if (!fileIndexBeacon) {
            throw new Error('File index not found for space');
        }

        // 3. Decode, remove the file metadata, and re-encode.
        const decodedIndex = await this.prgGet(
            new TextEncoder().encode(`space-files:${spaceId}`),
            fileIndexBeacon,
            new TextEncoder().encode(`space-key:${spaceId}`),
            () => []
        );
        let fileIndex: any[] = JSON.parse(new TextDecoder().decode(decodedIndex.payload));
        fileIndex = fileIndex.filter(f => f.fingerprint !== fingerprint);

        // 4. Submit the updated beacon.
        const updatedIndexBeacon = await this.prgPut(
            new TextEncoder().encode(`space-files:${spaceId}`),
            new TextEncoder().encode(JSON.stringify(fileIndex)),
            Math.floor(Date.now() / 2000),
            new TextEncoder().encode("auth-secret"),
            new TextEncoder().encode(`space-key:${spaceId}`)
        );
        await this.postManager.handleBeaconSubmission(spaceId, updatedIndexBeacon.beacon, 'space_file_index');
    }

    async getSpaceFiles(spaceId: string): Promise<{
        file_id: string;
        space_id: string;
        uploader_id: string;
        file_name: string;
        file_type: string;
        file_size: number;
        fingerprint: string;
        created_at: string;
    }[]> {
        try {
            console.log(`[SpaceManager] Retrieving files for space ${spaceId}`);
            
            // Retrieve the 'space_file_index' beacon.
            const fileIndexBeacon = await this.getSpaceFileIndex(spaceId);
            if (!fileIndexBeacon) {
                console.log(`[SpaceManager] No file index beacon found for space ${spaceId}`);
                return [];
            }

            console.log(`[SpaceManager] Found file index beacon for space ${spaceId}, decoding...`);
            
            const decodedIndex = await this.prgGet(
                new TextEncoder().encode(`space-files:${spaceId}`),
                fileIndexBeacon,
                new TextEncoder().encode(`space-key:${spaceId}`),
                () => []
            );
            
            const indexText = new TextDecoder().decode(decodedIndex.payload);
            console.log(`[SpaceManager] Decoded file index length: ${indexText.length} characters`);
            
            let fileIndex: any[] = [];
            
            // ROBUST JSON PARSING: Handle truncated/malformed JSON gracefully
            if (indexText.trim().length > 0) {
                try {
                    fileIndex = JSON.parse(indexText);
                    if (!Array.isArray(fileIndex)) {
                        console.warn(`[SpaceManager] File index is not an array, using empty array`);
                        fileIndex = [];
                    }
                } catch (parseError) {
                    console.error(`[SpaceManager] Failed to parse file index JSON:`, parseError);
                    console.error(`[SpaceManager] Corrupted JSON content (first 500 chars):`, indexText.substring(0, 500));
                    
                    // Try to repair common JSON truncation issues
                    let repairedJson = indexText.trim();
                    
                    // Handle incomplete objects by closing them
                    if (repairedJson.endsWith('{') || repairedJson.endsWith('{"')) {
                        console.warn(`[SpaceManager] Severely truncated JSON, using empty array`);
                        fileIndex = [];
                    } else {
                        // Try to close incomplete JSON objects/arrays
                        let openBraces = 0;
                        let openSquares = 0;
                        for (const char of repairedJson) {
                            if (char === '{') openBraces++;
                            else if (char === '}') openBraces--;
                            else if (char === '[') openSquares++;
                            else if (char === ']') openSquares--;
                        }
                        
                        // Close missing brackets
                        while (openSquares > 0) {
                            repairedJson += ']';
                            openSquares--;
                        }
                        while (openBraces > 0) {
                            repairedJson += '}';
                            openBraces--;
                        }
                        
                        try {
                            fileIndex = JSON.parse(repairedJson);
                            if (!Array.isArray(fileIndex)) {
                                fileIndex = [];
                            }
                            console.log(`[SpaceManager] Successfully repaired truncated JSON for file retrieval`);
                        } catch (repairError) {
                            console.warn(`[SpaceManager] Cannot repair malformed JSON: ${indexText.substring(0, 100)}...`);
                            fileIndex = [];
                        }
                    }
                }
            }
            
            console.log(`[SpaceManager] Successfully retrieved ${fileIndex.length} files for space ${spaceId}`);
            
            // Map the beacon data to match the expected format
            return fileIndex.map(f => ({
                file_id: f.fingerprint, // Use fingerprint as file_id
                space_id: spaceId,
                uploader_id: f.uploaderId,
                file_name: f.fileName,
                file_type: f.fileType,
                file_size: f.fileSize,
                fingerprint: f.fingerprint,
                created_at: f.createdAt
            }));
        } catch (error) {
            console.error(`[SpaceManager] Error retrieving files for space ${spaceId}:`, error);
            return [];
        }
    }

    async getFileContent(fingerprint: string, spaceId: string): Promise<string | null> {
        try {
            console.log(`[SpaceManager] Retrieving file content for ${fingerprint}`);
            
            // Get the file content beacon
            const db = getDatabase();
            const sql = `
                SELECT * FROM beacons
                WHERE beacon_type = 'file_content'
                ORDER BY epoch DESC
                LIMIT 50
            `;

            const contentBeacons = await new Promise<any[]>((resolve, reject) => {
                db.all(sql, [], (err, rows: any[]) => {
                    if (err) {
                        console.error('Error getting file content beacons', err.message);
                        return reject(err);
                    }
                    resolve(rows || []);
                });
            });

            console.log(`[SpaceManager] Found ${contentBeacons.length} file content beacons to search`);

            // Try to decode each beacon to find the matching file content
            for (const beacon of contentBeacons) {
                try {
                    const decodedContent = await this.prgGet(
                        new TextEncoder().encode(`file-content:${fingerprint}`),
                        beacon,
                        new TextEncoder().encode(`space-key:${spaceId}`),
                        () => []
                    );
                    
                    const contentString = new TextDecoder().decode(decodedContent.payload);
                    if (contentString && contentString.length > 0) {
                        console.log(`[SpaceManager] Successfully retrieved file content for ${fingerprint}, size: ${contentString.length} chars`);
                        return contentString;
                    }
                } catch (decodeError) {
                    // This beacon doesn't contain our file, continue searching
                    continue;
                }
            }
            
            console.log(`[SpaceManager] No file content found for ${fingerprint}`);
            return null;
        } catch (error) {
            console.error(`[SpaceManager] Error retrieving file content for ${fingerprint}:`, error);
            return null;
        }
    }

    async getSpaceFileIndex(spaceId: string): Promise<any> {
        const db = getDatabase();
        const sql = `
            SELECT * FROM beacons
            WHERE author_id = ? AND beacon_type = 'space_file_index'
            ORDER BY epoch DESC
            LIMIT 1
        `;

        return new Promise((resolve, reject) => {
            db.get(sql, [spaceId], (err, row) => {
                if (err) {
                    console.error('Error getting space file index beacon', err.message);
                    return reject(err);
                }
                resolve(row);
            });
        });
    }

    // Adapted from prdb.ts
    async prgPut(
      keyBytes: Uint8Array,
      payload: Uint8Array,
      epoch: number,
      authKey: Uint8Array,
      phaseKey?: Uint8Array,
      params: { k: number, Q: number, chunkBits: number } = { k: 32, Q: 64, chunkBits: 16 }
    ): Promise<{ beacon: any; phases: Map<number, number[]>; recipe: any; }> {
      const primes = await this.selectPrimesFromKey(keyBytes, params.k);
      const { residues, phases, recipe } = await this.encodePhases(payload, primes, params, phaseKey);

      const fingerprint = this.quantizeFingerprint(residues, primes, params.Q);
      const beacon = await this.makeBeacon(primes, epoch, fingerprint, authKey);

      return { beacon, phases, recipe };
    }

    async prgGet(
      keyBytes: Uint8Array,
      beacon: any,
      phaseKey: Uint8Array | undefined,
      phasesProvider: (p: number) => number[] | undefined,
      params: { k: number, Q: number, chunkBits: number } = { k: 32, Q: 64, chunkBits: 16 }
    ): Promise<{ payload: Uint8Array; alignmentR: number; }> {
      const primes = await this.selectPrimesFromKey(keyBytes, params.k);
      const phases = new Map<number, number[]>();
      for (const p of primes) {
        const arr = phasesProvider(p);
        if (!arr) throw new Error(`missing phases for p=${p}`);
        phases.set(p, arr);
      }

      const symbolsLen = phases.get(primes[0])!.length;
      const recipe = await this.derivePhaseRecipe(primes, symbolsLen, phaseKey);

      const { residues, alignmentR } = this.lockAndExtractResidues(primes, beacon.fingerprint, phases, recipe, params.Q);

      const payload = this.reconstructSymbols(primes, residues, params.chunkBits);
      return { payload, alignmentR };
    }

    async selectPrimesFromKey(keyBytes: Uint8Array, k: number): Promise<number[]> {
        const h = await sha256(keyBytes);
        const seed = this.u32(h, 0) ^ this.u32(h, 4) ^ this.u32(h, 8) ^ this.u32(h, 12);
        const rnd = this.xorshift32(seed);
        const chosen: Set<number> = new Set();
        const PRIME_TABLE: number[] = [
           2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53,
           59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113,
           127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181,
           191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251,
           257, 263, 269, 271, 277, 281, 283, 293
        ];
        while (chosen.size < k) {
            const i = rnd() % PRIME_TABLE.length;
            chosen.add(PRIME_TABLE[i]);
        }
        return Array.from(chosen.values()).sort((a,b)=>a-b);
    }

    u32(b: Uint8Array, i: number): number {
      return (b[i] | (b[i+1]<<8) | (b[i+2]<<16) | (b[i+3]<<24)) >>> 0;
    }

    xorshift32(seed: number) {
      let x = seed >>> 0;
      return () => {
        x ^= x << 13; x >>>= 0;
        x ^= x >>> 17; x >>>= 0;
        x ^= x << 5;  x >>>= 0;
        return x >>> 0;
      };
    }

    async encodePhases(
      payload: Uint8Array,
      primes: number[],
      params: { k: number, Q: number, chunkBits: number },
      keyK?: Uint8Array
    ): Promise<{
      symbols: number[];
      residues: Map<number, number[]>;
      phases: Map<number, number[]>;
      recipe: any;
    }> {
      const symbols = this.chunkPayload(payload, params.chunkBits);
      const recipe = await this.derivePhaseRecipe(primes, symbols.length, keyK);

      const residues = new Map<number, number[]>();
      const phases = new Map<number, number[]>();

      for (const p of primes) {
        const rList: number[] = [];
        const thList: number[] = [];
        const secretArr = recipe.secretPhase.get(p)!;

        for (let j = 0; j < symbols.length; j++) {
          const r = symbols[j] % p;
          rList.push(r);
          const theta = this.residueToPhase(r, p, recipe.phiOffset, recipe.silverOffset, secretArr[j]);
          thList.push(theta);
        }
        residues.set(p, rList);
        phases.set(p, thList);
      }

      return { symbols, residues, phases, recipe };
    }

    chunkPayload(payload: Uint8Array, chunkBits: number): number[] {
      const chunkBytes = Math.ceil(chunkBits / 8);
      const out: number[] = [];
      for (let i = 0; i < payload.length; i += chunkBytes) {
        let v = 0;
        for (let b = 0; b < chunkBytes; b++) {
          v = (v << 8) | (payload[i + b] ?? 0);
        }
        const mask = (chunkBits >= 32) ? 0xffffffff : ((1 << chunkBits) - 1);
        out.push(v & mask);
      }
      return out;
    }

    async derivePhaseRecipe(
      primes: number[],
      symbolsLen: number,
      keyK?: Uint8Array
    ): Promise<{ phiOffset: number, silverOffset: number, secretPhase: Map<number, number[]> }> {
      const TAU = Math.PI * 2;
      const PHI = (1 + Math.sqrt(5)) / 2;
      const SILVER = 1 + Math.sqrt(2);
      const phiOffset = TAU / PHI;
      const silverOffset = TAU / SILVER;
      const secretPhase = new Map<number, number[]>();

      for (const p of primes) {
        const arr: number[] = [];
        for (let j = 0; j < symbolsLen; j++) {
          if (keyK) {
            const buf = new Uint8Array(6);
            new DataView(buf.buffer).setUint32(0, p, false);
            new DataView(buf.buffer).setUint16(4, j, false);
            const mac = await this.hmacSHA256(keyK, buf);
            const val = ((mac[0] << 8) | mac[1]) / 65536;
            arr.push(val * TAU);
          } else {
            arr.push(0);
          }
        }
        secretPhase.set(p, arr);
      }
      return { phiOffset, silverOffset, secretPhase };
    }

    async hmacSHA256(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
      const k = await cryptoAPI.subtle.importKey(
        "raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
      );
      const mac = await cryptoAPI.subtle.sign("HMAC", k, data);
      return new Uint8Array(mac);
    }

    residueToPhase(r: number, p: number, phiOffset: number, silverOffset: number, secret: number): number {
        const TAU = Math.PI * 2;
        const x = TAU * (r / p) + phiOffset + silverOffset + secret;
        return x % TAU < 0 ? x % TAU + TAU : x % TAU;
    }

    quantizeFingerprint(
      residues: Map<number, number[]>,
      primes: number[],
      Q: number
    ): Uint8Array {
      const out = new Uint8Array(primes.length);
      primes.forEach((p, idx) => {
        const r = residues.get(p)!;
        const mean = r.reduce((a,b)=>a+b,0) / r.length;
        const level = Math.round((mean / p) * (Q - 1));
        out[idx] = Math.max(0, Math.min(Q-1, level));
      });
      return out;
    }

    async makeBeacon(
      primes: number[],
      epoch: number,
      fingerprint: Uint8Array,
      authKey: Uint8Array
    ): Promise<{ index: number[], epoch: number, fingerprint: Uint8Array, signature: Uint8Array }> {
      const indexBuf = new Uint8Array(primes.length * 4);
      const dv = new DataView(indexBuf.buffer);
      primes.forEach((p, i) => dv.setUint32(i*4, p, false));
      const epochBuf = new Uint8Array(4);
      new DataView(epochBuf.buffer).setUint32(0, epoch >>> 0, false);

      const concat = new Uint8Array(indexBuf.length + epochBuf.length + fingerprint.length);
      concat.set(indexBuf, 0);
      concat.set(epochBuf, indexBuf.length);
      concat.set(fingerprint, indexBuf.length + epochBuf.length);

      const signature = await this.hmacSHA256(authKey, concat);
      return { index: primes, epoch, fingerprint, signature };
    }

    lockAndExtractResidues(
      primes: number[],
      fingerprint: Uint8Array,
      phases: Map<number, number[]>,
      recipe: any,
      Q: number
    ): { residues: Map<number, number[]>, alignmentR: number } {
      const seed = this.initResiduesFromFingerprint(primes, Q, fingerprint, phases.get(primes[0])!.length);
      const refined = this.refineResiduesExactInverse(phases, primes, recipe);

      let agree = 0, total = 0;
      primes.forEach((p) => {
        const a = seed.get(p)!;
        const b = refined.get(p)!;
        for (let j = 0; j < b.length; j++) { total++; if (a[j] === b[j]) agree++; }
      });
      const R = total ? agree / total : 1;
      return { residues: refined, alignmentR: R };
    }

    initResiduesFromFingerprint(
      primes: number[],
      Q: number,
      fingerprint: Uint8Array,
      symbolsLen: number
    ): Map<number, number[]> {
      const guess = new Map<number, number[]>();
      primes.forEach((p, idx) => {
        const level = fingerprint[idx];
        const meanR = Math.round((level / (Q - 1)) * p);
        guess.set(p, Array(symbolsLen).fill(meanR % p));
      });
      return guess;
    }

    refineResiduesExactInverse(
      phases: Map<number, number[]>,
      primes: number[],
      recipe: any
    ): Map<number, number[]> {
      const out = new Map<number, number[]>();
      const TAU = Math.PI * 2;
      primes.forEach((p) => {
        const th = phases.get(p)!;
        const secret = recipe.secretPhase.get(p)!;
        const rList: number[] = [];
        for (let j = 0; j < th.length; j++) {
          let x = th[j] - recipe.phiOffset - recipe.silverOffset - secret[j];
          x = ((x % TAU) + TAU) % TAU;
          const r = Math.round((x / TAU) * p) % p;
          rList.push(r);
        }
        out.set(p, rList);
      });
      return out;
    }

    reconstructSymbols(
      primes: number[],
      residues: Map<number, number[]>,
      chunkBits: number
    ): Uint8Array {
      const chunkBytes = Math.ceil(chunkBits / 8);
      const symbolsLen = residues.get(primes[0])!.length;
      const out = new Uint8Array(symbolsLen * chunkBytes);

      for (let j = 0; j < symbolsLen; j++) {
        const pairs: Array<[bigint, bigint]> = primes.map(p => {
          const r = residues.get(p)![j];
          return [BigInt(r), BigInt(p)];
        });
        
        const mBig = this.garnerCRT(pairs);
        
        for (let b = chunkBytes - 1; b >= 0; b--) {
          out[j*chunkBytes + (chunkBytes - 1 - b)] = Number((mBig >> BigInt(8*b)) & 0xffn);
        }
      }
      return out;
    }

    garnerCRT(residues: Array<[bigint, bigint]>): bigint {
      const n = residues.length;
      if (n === 0) return BigInt(0);
      if (n === 1) return residues[0][0];
      
      let result = residues[0][0];
      let modProduct = residues[0][1];
      
      for (let i = 1; i < n; i++) {
        const [r_i, p_i] = residues[i];
        let diff = (r_i - result) % p_i;
        if (diff < 0n) diff += p_i;
        
        const inv = this.invMod(modProduct % p_i, p_i);
        const t = (diff * inv) % p_i;
        
        result = result + modProduct * t;
        modProduct = modProduct * p_i;
      }
      
      return result;
    }

    invMod(a: bigint, m: bigint): bigint {
      let t = 0n, newT = 1n;
      let r = m, newR = a % m;
      while (newR !== 0n) {
        const q = r / newR;
        [t, newT] = [newT, t - q * newT];
        [r, newR] = [newR, r - q * newR];
      }
      if (r !== 1n) throw new Error("not coprime");
      if (t < 0n) t += m;
      return t;
    }
}