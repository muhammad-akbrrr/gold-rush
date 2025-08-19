import { randomBytes, secretbox } from 'tweetnacl';
import bs58 from 'bs58';

/**
 * Encryption utilities using tweetnacl for client-side encryption
 */

/**
 * Generate a random encryption key
 */
export function generateEncryptionKey(): Uint8Array {
    return randomBytes(secretbox.keyLength);
}

/**
 * Generate a random nonce
 */
export function generateNonce(): Uint8Array {
    return randomBytes(secretbox.nonceLength);
}

/**
 * Encrypt data using symmetric encryption
 */
export function encryptData(data: string, key: Uint8Array): string {
    try {
        const nonce = generateNonce();
        const message = new TextEncoder().encode(data);
        const encrypted = secretbox(message, nonce, key);
        
        if (!encrypted) {
            throw new Error('Encryption failed');
        }

        // Combine nonce and encrypted data
        const combined = new Uint8Array(nonce.length + encrypted.length);
        combined.set(nonce);
        combined.set(encrypted, nonce.length);
        
        return bs58.encode(combined);
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt data');
    }
}

/**
 * Decrypt data using symmetric encryption
 */
export function decryptData(encryptedData: string, key: Uint8Array): string {
    try {
        const combined = bs58.decode(encryptedData);
        
        // Extract nonce and encrypted message
        const nonce = combined.slice(0, secretbox.nonceLength);
        const encrypted = combined.slice(secretbox.nonceLength);
        
        const decrypted = secretbox.open(encrypted, nonce, key);
        
        if (!decrypted) {
            throw new Error('Decryption failed - invalid data or key');
        }
        
        return new TextDecoder().decode(decrypted);
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt data');
    }
}

/**
 * Generate a key from a password using a simple key derivation
 * Note: This is basic - in production you might want to use PBKDF2 or similar
 */
export function deriveKeyFromPassword(password: string, salt: Uint8Array): Uint8Array {
    const encoder = new TextEncoder();
    const passwordBytes = encoder.encode(password);
    
    // Simple key derivation - hash password with salt multiple times
    let key = new Uint8Array(passwordBytes.length + salt.length);
    key.set(passwordBytes);
    key.set(salt, passwordBytes.length);
    
    // Multiple rounds of hashing to derive key
    for (let i = 0; i < 1000; i++) {
        key = new Uint8Array(simpleHash(key));
    }
    
    // Return first 32 bytes as key
    return key.slice(0, secretbox.keyLength);
}


/**
 * Simple hash function fallback
 */
function simpleHash(data: Uint8Array): Uint8Array {
    const hash = new Uint8Array(32);
    let h = 0x811c9dc5;
    
    for (let i = 0; i < data.length; i++) {
        h ^= data[i];
        h = (h * 0x01000193) >>> 0;
    }
    
    for (let i = 0; i < 32; i++) {
        hash[i] = (h >>> (i % 4 * 8)) & 0xff;
    }
    
    return hash;
}

/**
 * Generate a deterministic key from wallet address and session info
 */
export function generateSessionKey(walletAddress: string, sessionId: string): Uint8Array {
    const combined = walletAddress + sessionId + Date.now().toString();
    const salt = new TextEncoder().encode('web3-session-salt');
    return deriveKeyFromPassword(combined, salt);
}

/**
 * Validate encrypted data format
 */
export function isValidEncryptedData(data: string): boolean {
    try {
        const decoded = bs58.decode(data);
        return decoded.length > secretbox.nonceLength;
    } catch {
        return false;
    }
}

/**
 * Generate a secure random session ID
 */
export function generateSessionId(): string {
    const bytes = randomBytes(16);
    return bs58.encode(bytes);
}

/**
 * Create integrity hash for data validation
 */
export function createIntegrityHash(data: string): string {
    const bytes = new TextEncoder().encode(data);
    const hash = simpleHash(bytes);
    return bs58.encode(hash);
}

/**
 * Verify data integrity
 */
export function verifyIntegrity(data: string, hash: string): boolean {
    try {
        const computedHash = createIntegrityHash(data);
        return computedHash === hash;
    } catch {
        return false;
    }
}