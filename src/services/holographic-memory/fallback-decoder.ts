/**
 * Fallback Decoding Strategies
 * Various methods to extract text when holographic decoding fails
 */

export class FallbackDecoder {
  /**
   * Try various fallback decoding methods
   */
  tryFallbackDecoding(data: unknown): string | null {
    if (typeof data !== 'object' || data === null) {
      return null;
    }

    const dataObj = data as Record<string, unknown>;
    
    // Method 1: Check for originalText
    const originalText = this.tryOriginalText(dataObj);
    if (originalText) return originalText;
    
    // Method 2: Check for metadata field
    const metadataText = this.tryMetadata(dataObj);
    if (metadataText) return metadataText;
    
    // Method 3: Check for content/data fields
    const contentText = this.tryContentFields(dataObj);
    if (contentText) return contentText;
    
    // Method 4: Try base64 content
    const base64Text = this.tryBase64Content(dataObj);
    if (base64Text) return base64Text;
    
    // Method 5: Try signature decoding
    const signatureText = this.trySignatureDecoding(dataObj);
    if (signatureText) return signatureText;
    
    // Method 6: Try other string fields
    const stringFieldText = this.tryStringFields(dataObj);
    if (stringFieldText) return stringFieldText;
    
    return null;
  }

  /**
   * Try to get originalText field
   */
  private tryOriginalText(dataObj: Record<string, unknown>): string | null {
    if (typeof dataObj.originalText === 'string') {
      console.log("Successfully decoded fragment using attached originalText");
      return dataObj.originalText;
    }
    return null;
  }

  /**
   * Try to extract from metadata
   */
  private tryMetadata(dataObj: Record<string, unknown>): string | null {
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
    return null;
  }

  /**
   * Try content or data fields
   */
  private tryContentFields(dataObj: Record<string, unknown>): string | null {
    if (typeof dataObj.content === 'string') {
      console.log("Successfully decoded fragment using cached beacon content");
      return dataObj.content;
    }
    
    if (typeof dataObj.data === 'string') {
      console.log("Successfully decoded fragment using beacon data field");
      return dataObj.data;
    }
    
    return null;
  }

  /**
   * Try base64 content
   */
  private tryBase64Content(dataObj: Record<string, unknown>): string | null {
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
    return null;
  }

  /**
   * Try to decode from signature
   */
  private trySignatureDecoding(dataObj: Record<string, unknown>): string | null {
    if (!(dataObj.signature instanceof Uint8Array) || dataObj.signature.length <= 4) {
      return null;
    }

    try {
      const signature = dataObj.signature;
      
      // Try new format: [text_length_as_4_bytes][full_text][pri_hash_as_32_bytes]
      const lengthBytes = signature.slice(0, 4);
      const textLength = new DataView(lengthBytes.buffer, lengthBytes.byteOffset).getUint32(0, true);
      
      if (textLength > 0 && textLength < signature.length - 4 && textLength < 10000) {
        const textBytes = signature.slice(4, 4 + textLength);
        const textDecoder = new TextDecoder('utf-8', { fatal: false });
        const decoded = textDecoder.decode(textBytes);
        
        if (decoded && decoded.trim().length > 0) {
          console.log("Successfully decoded fragment using signature text");
          return decoded.trim();
        }
      }
      
      // Fallback: try old format
      const textDecoder = new TextDecoder('utf-8', { fatal: false });
      const decoded = textDecoder.decode(signature);
      
      if (decoded && /^[\x20-\x7E\s]*$/.test(decoded) && decoded.trim().length > 0) {
        console.log("Successfully decoded fragment using signature text (fallback)");
        return decoded.trim();
      }
    } catch {
      // Ignore decode errors
    }
    
    return null;
  }

  /**
   * Try other string fields
   */
  private tryStringFields(dataObj: Record<string, unknown>): string | null {
    const skipFields = [
      'beacon_id', 'user_id', 'beacon_type', 'type', 'node_id',
      'fingerprint', 'signature', 'epoch', 'prime_indices'
    ];
    
    for (const [key, value] of Object.entries(dataObj)) {
      if (typeof value !== 'string' || value.length === 0) {
        continue;
      }
      
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
      
      // Check if it looks like meaningful text
      if (value.length > 10 &&
          /[a-zA-Z\s]/.test(value) &&
          !/^[a-f0-9]{32,}$/.test(value) && // Not a hash
          !value.match(/^[a-z_]+$/) && // Not a simple identifier
          (value.includes(' ') || value.includes('"') || value.includes(':'))) {
        console.log(`Successfully decoded fragment using text field: ${key}`);
        return value;
      }
    }
    
    return null;
  }
}