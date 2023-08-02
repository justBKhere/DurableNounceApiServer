import bs58 from 'bs58';

export function base58ToUint8Array(base58String: string): Uint8Array {
    const bytes = bs58.decode(base58String);
    return new Uint8Array(bytes);
}

export function uint8ArrayToBase58(uint8Array: Uint8Array): string {
    const base58String = bs58.encode(uint8Array);
    return base58String;
}
