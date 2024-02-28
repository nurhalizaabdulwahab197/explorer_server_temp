// node.interface.ts
export interface INode {
  status: string;
  peers: Number;
  blocks: number;
  queued: Number;
  client: string;
  node_id: string;
  node_name: string;
  enode: string;
  rpc_url: string;
  local_host: string;
}
