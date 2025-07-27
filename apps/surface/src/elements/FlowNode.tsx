import { cva, cx, type VariantProps } from 'cva';
import { Handle, Position } from '@xyflow/react';

/* Base Node Component */
const NodeBase: React.FC<NodeBaseProps> = ({ data, intent, className }) => {
  const nodeStyles = nodeBaseStyles({ className, intent });

  return (
    <div
      className={cx(
        'min-w-48 rounded-lg border-2 px-4 py-3 shadow-sm',
        nodeStyles,
      )}>
      <Handle position={Position.Top} type='target' />
      <div className='font-semibold text-sm'>{data.label}</div>
      <div className='mt-1 text-xs'>{data.description}</div>
      <Handle position={Position.Bottom} type='source' />
    </div>
  );
};

/* Styles */
const nodeBaseStyles = cva({
  base: 'min-w-48 rounded-lg border-2 px-4 py-3 shadow-sm',
  variants: {
    intent: {
      api: 'border-purple-200 bg-purple-50 text-slate-950',
      component: 'border-slate-300 bg-slate-50 text-slate-950',
      database: 'border-indigo-200 bg-indigo-50 text-slate-950',
      default: 'border-blue-200 bg-blue-50 text-slate-950',
      external: 'border-slate-300 bg-slate-50 text-slate-950',
      route: 'border-lime-200 bg-lime-50 text-slate-950',
    },
  },
});

/* Specific Node Components */
const NodeRoute: React.FC<CustomNodeProps> = ({ data }) => (
  <NodeBase data={data} intent='route' />
);

const ApiNode: React.FC<CustomNodeProps> = ({ data }) => (
  <NodeBase data={data} intent='api' />
);
const DatabaseNode: React.FC<CustomNodeProps> = ({ data }) => (
  <NodeBase data={data} intent='database' />
);
const ComponentNode: React.FC<CustomNodeProps> = ({ data }) => (
  <NodeBase data={data} intent='component' />
);
const ExternalNode: React.FC<CustomNodeProps> = ({ data }) => (
  <NodeBase data={data} intent='external' />
);

/* Node Types Export */
export const nodeTypes = {
  api: ApiNode,
  component: ComponentNode,
  database: DatabaseNode,
  external: ExternalNode,
  route: NodeRoute,
};

/* Types */
export interface NodeData extends Record<string, unknown> {
  label: string;
  description: string;
}

interface CustomNodeProps {
  data: NodeData;
}

type NodeBaseStyles = VariantProps<typeof nodeBaseStyles>;
interface NodeBaseProps extends NodeBaseStyles {
  data: NodeData;
  intent: NodeBaseStyles['intent'];
  className?: string;
  labelClassName?: string;
  descriptionClassName?: string;
}
