import React from 'react';
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import ExhibitList from './components/ExhibitList';
import Canvas from './components/Canvas';
import CustomizationPanel from './components/CustomizationPanel';
import { useStore } from './store/store';
import { tableData, pieChartData, barChartData } from './data/mockData';

function App() {
  const addCanvasItem = useStore((state) => state.addCanvasItem);
  const updateCanvasItem = useStore((state) => state.updateCanvasItem);
  const canvasItems = useStore((state) => state.canvasItems);
  const findAvailablePosition = useStore((state) => state.findAvailablePosition);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && over.id === 'canvas') {
      // If the dragged item is from the exhibit list
      if (active.data.current?.type && !active.data.current?.isCanvasItem) {
        const exhibit = active.data.current;
        
        let data;
        switch (exhibit.type) {
          case 'table':
            data = tableData;
            break;
          case 'pie':
            data = pieChartData;
            break;
          case 'bar':
            data = barChartData;
            break;
          default:
            data = {};
        }

        // Find available position in the grid
        const position = findAvailablePosition(6); // Default to 6 columns width

        const newItem = {
          id: `${exhibit.type}-${Date.now()}`,
          exhibitId: exhibit.id,
          type: exhibit.type,
          position,
          size: { width: 400, height: 300 },
          data
        };

        addCanvasItem(newItem);
      }
      // If the dragged item is already on the canvas
      else if (active.data.current?.isCanvasItem) {
        const item = active.data.current;
        const newPosition = findAvailablePosition(item.position.width);
        updateCanvasItem(item.id, { position: newPosition });
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext items={canvasItems.map(item => item.id)} strategy={rectSortingStrategy}>
          <div className="w-64 bg-white shadow-lg">
            <ExhibitList />
          </div>
          <div className="flex-1 p-6 overflow-hidden">
            <Canvas />
          </div>
          <div className="w-80 bg-white shadow-lg">
            <CustomizationPanel />
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

export default App;