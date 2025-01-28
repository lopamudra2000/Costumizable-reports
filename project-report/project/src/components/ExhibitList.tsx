import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { exhibits } from '../data/mockData';
import { BarChart, PieChart, Table, Image } from 'lucide-react';

const iconMap = {
  'BarChart': BarChart,
  'PieChart': PieChart,
  'Table': Table,
  'Image': Image
};

function ExhibitList() {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Available Exhibits</h2>
      <div className="space-y-2">
        {exhibits.map((exhibit) => (
          <DraggableExhibit key={exhibit.id} exhibit={exhibit} />
        ))}
      </div>
    </div>
  );
}

interface DraggableExhibitProps {
  exhibit: {
    id: string;
    type: string;
    title: string;
    icon: string;
  };
}

function DraggableExhibit({ exhibit }: DraggableExhibitProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: exhibit.id,
    data: exhibit
  });

  const Icon = iconMap[exhibit.icon as keyof typeof iconMap];

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className="p-3 bg-white rounded-lg shadow cursor-move hover:shadow-md transition-shadow"
    >
      <div className="flex items-center space-x-2">
        {Icon && <Icon className="w-5 h-5 text-gray-600" />}
        <span>{exhibit.title}</span>
      </div>
    </div>
  );
}

export default ExhibitList;