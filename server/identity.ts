// This module generates Prime Resonance Identity (PRI) for users
// based on the concepts in the project documentation and HTML example.

const RESONANCE_PRIMES = {
    gaussian: [13, 29, 41, 61, 89, 113, 149, 181, 233, 277],
    eisenstein: [7, 19, 31, 43, 67, 79, 103, 127, 139, 163],
    quaternionic: [11, 23, 47, 59, 71, 83, 107, 131, 167, 179]
};

function getRandomPrime(type: keyof typeof RESONANCE_PRIMES): number {
    const primes = RESONANCE_PRIMES[type];
    return primes[Math.floor(Math.random() * primes.length)];
}

function generateQuantumFingerprint(publicRes: any, privateRes: any): string {
    const combined = [
        ...publicRes.primaryPrimes,
        ...publicRes.harmonicPrimes,
        Math.floor(privateRes.eigenPhase * 1000)
    ];
    
    const hash = combined.reduce((acc, val) => {
        return ((acc * 31) + val) % 999999999;
    }, 1);
    
    return hash.toString(36).toUpperCase().padStart(8, '0');
}

export interface PublicResonance {
    primaryPrimes: number[];
    harmonicPrimes: number[];
}

export interface PrivateResonance {
    secretPrimes: number[];
    eigenPhase: number;
    authenticationSeed: number;
}

export interface PrimeResonanceIdentity {
    publicResonance: PublicResonance;
    privateResonance: PrivateResonance;
    fingerprint: string;
    nodeAddress: string;
}

export function generateNodeIdentity(): PrimeResonanceIdentity {
    const publicResonance: PublicResonance = {
        primaryPrimes: [
            getRandomPrime('gaussian'),
            getRandomPrime('eisenstein'),
            getRandomPrime('quaternionic')
        ],
        harmonicPrimes: [
            getRandomPrime('gaussian'),
            getRandomPrime('eisenstein')
        ]
    };
    
    const privateResonance: PrivateResonance = {
        secretPrimes: [
            getRandomPrime('quaternionic'),
            getRandomPrime('gaussian')
        ],
        eigenPhase: Math.random() * 2 * Math.PI,
        authenticationSeed: Math.floor(Math.random() * 1000000)
    };
    
    const fingerprint = generateQuantumFingerprint(publicResonance, privateResonance);
    
    return {
        publicResonance,
        privateResonance,
        fingerprint,
        nodeAddress: fingerprint.substring(0, 8).toUpperCase()
    };
}