/**
 * Polyfill para TextDecoder com suporte a "utf-16le" no React Native (Hermes).
 * O h3-js usa new TextDecoder("utf-16le"), que não é suportado nativamente no RN.
 * Deve ser importado antes de qualquer código que use h3-js.
 */

function decodeUtf16LE(bytes: Uint8Array): string {
  if (bytes.length === 0) return '';
  const len = bytes.length >> 1;
  let result = '';
  for (let i = 0; i < len; i++) {
    const code = bytes[i * 2]! | (bytes[i * 2 + 1]! << 8);
    if (code >= 0xd800 && code <= 0xdbff && i + 1 < len) {
      const low = bytes[i * 2 + 2]! | (bytes[i * 2 + 3]! << 8);
      if (low >= 0xdc00 && low <= 0xdfff) {
        result += String.fromCodePoint(((code - 0xd800) << 10) + (low - 0xdc00) + 0x10000);
        i++;
        continue;
      }
    }
    result += String.fromCodePoint(code);
  }
  return result;
}

const OriginalTextDecoder = globalThis.TextDecoder;

if (typeof OriginalTextDecoder !== 'undefined') {
  const PatchedTextDecoder = class TextDecoder {
    private _encoding: string;
    private _decoder: InstanceType<typeof OriginalTextDecoder> | null = null;

    constructor(label?: string) {
      const normalized = (label ?? 'utf-8').toLowerCase();
      this._encoding = normalized === 'utf16le' ? 'utf-16le' : normalized;
      if (this._encoding !== 'utf-16le') {
        this._decoder = new OriginalTextDecoder(label);
      }
    }

    get encoding(): string {
      return this._encoding;
    }

    decode(input?: BufferSource): string {
      if (this._encoding === 'utf-16le') {
        const bytes =
          input instanceof ArrayBuffer
            ? new Uint8Array(input)
            : input
              ? new Uint8Array(input.buffer, input.byteOffset, input.byteLength)
              : new Uint8Array(0);
        return decodeUtf16LE(bytes);
      }
      return this._decoder!.decode(input);
    }
  };

  (globalThis as unknown as { TextDecoder: typeof OriginalTextDecoder }).TextDecoder =
    PatchedTextDecoder as unknown as typeof OriginalTextDecoder;
}
