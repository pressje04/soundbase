import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

export default function SortableTrack({
  id,
  name,
  index,
  imageUrl,
}: {
  id: string;
  name: string;
  index: number;
  imageUrl: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center gap-3 p-3 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition-colors cursor-grab"
    >
      {/* Drag Handle Icon */}
      <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />

      {/* Rank Number */}
      <div className="w-6 h-6 flex items-center justify-center rounded-full bg-zinc-700 text-xs text-gray-300 font-semibold">
        {index + 1}
      </div>

      {/* Thumbnail */}
      <img
        src={imageUrl}
        alt={`${name} cover`}
        className="w-10 h-10 rounded object-cover flex-shrink-0"
      />

      {/* Track Name */}
      <span className="text-sm text-white truncate">{name}</span>
    </li>
  );
}
