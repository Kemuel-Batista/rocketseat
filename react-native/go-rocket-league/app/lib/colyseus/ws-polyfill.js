/**
 * Stub para o pacote "ws" no React Native.
 * O ambiente já fornece WebSocket global; o Colyseus SDK usa globalThis.WebSocket || require('ws').
 * Ao resolver "ws" para este arquivo, evitamos carregar o pacote Node "ws" (que usa stream, etc.).
 */
module.exports = globalThis.WebSocket;
