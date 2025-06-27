'use client';

import SortableTrack from './SortableTrack';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { useState } from 'react';

type Track = { id: string; name: string, imageUrl: string;};

export default function TrackRankingBox({
  tracks,
  setTracks,
  imageUrl,
}: {
  tracks: Track[];
  setTracks: (updated: Track[]) => void;
  imageUrl: string
}) {
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = tracks.findIndex((t) => t.id === active.id);
      const newIndex = tracks.findIndex((t) => t.id === over.id);

      const reordered = arrayMove(tracks, oldIndex, newIndex);
      setTracks(reordered);
    }
  };

  return (
    <div className="w-full rounded-2xl p-1 shadow-md max-h-[32rem] overflow-y-auto">
      <h3 className="text-lg font-bold mb-3 text-white">Tracklist Ranking</h3>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={tracks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <ol className="space-y-2">
          {tracks.map((track, index) => (
            <SortableTrack 
              key={track.id} 
              id={track.id} 
              name={track.name}
              imageUrl={track.imageUrl}
              index={index}
            />
          ))}

          </ol>
        </SortableContext>
      </DndContext>
    </div>
  );
}
