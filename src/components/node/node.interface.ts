export interface INode {
  status: string;
  peers: number;
  blocks: number;
  queued: number;
  client: string;
  node_id: string;
  node_name: string;
  enode: string;
  rpc_url: string;
  local_host: string;
}
