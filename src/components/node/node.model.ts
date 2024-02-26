// node.model.ts
import mongoose from 'mongoose';
import { INode } from './node.interface';

const nodeSchema = new mongoose.Schema<INode>({
  status: { type: String },
  peers: { type: Number, required: true },
  blocks: { type: Number, required: true },
  queued: { type: Number, required: true },
  client: { type: String, required: true },
  node_id: { type: String, required: true, unique: true },
  node_name: { type: String, required: true },
  enode: { type: String, required: true },
  rpc_url: { type: String, required: true },
  local_host: { type: String, required: true },
});

const NodeModel = mongoose.model<INode>('Node', nodeSchema);

// eslint-disable-next-line import/prefer-default-export
export { NodeModel };
