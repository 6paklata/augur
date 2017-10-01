export function isJsonRpcRequest(message: any): boolean {
  if (typeof message.jsonrpc !== "string") return false;
  if (message.jsonrpc !== "2.0") return false;
  if (typeof message.id !== "string" && typeof message.id !== "number") return false;
  if (typeof message.method !== "string") return false;
  if (typeof message.params !== "object") return false;
  if (!Array.isArray(message.params)) return false;
  return true;
}
