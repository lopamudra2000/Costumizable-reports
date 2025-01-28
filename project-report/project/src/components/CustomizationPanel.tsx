import React from 'react';
import { useStore } from '../store/store';
import { ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';

function CustomizationPanel() {
  const selectedItem = useStore((state) => state.selectedItem);
  const canvasItems = useStore((state) => state.canvasItems);
  const updateColumnVisibility = useStore((state) => state.updateColumnVisibility);
  const updateCanvasItem = useStore((state) => state.updateCanvasItem);

  const selectedExhibit = canvasItems.find(item => item.id === selectedItem);

  if (!selectedExhibit) {
    return (
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Customization Panel</h2>
        <p className="text-gray-500">Select an exhibit to customize</p>
      </div>
    );
  }

  const handleSizeChange = (dimension: 'width' | 'height', value: number) => {
    updateCanvasItem(selectedExhibit.id, {
      size: {
        ...selectedExhibit.size,
        [dimension]: value
      }
    });
  };

  const handleTitleChange = (title: string) => {
    updateCanvasItem(selectedExhibit.id, { title });
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Customize {selectedExhibit.type}</h2>
      
      <div className="space-y-6">
        {/* Title Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            value={selectedExhibit.title || ''}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder={`${selectedExhibit.type.charAt(0).toUpperCase() + selectedExhibit.type.slice(1)} Report`}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Size Controls */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-700">Size</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm text-gray-600">Width</label>
              <input
                type="range"
                min="200"
                max="800"
                value={selectedExhibit.size.width}
                onChange={(e) => handleSizeChange('width', parseInt(e.target.value))}
                className="w-full"
              />
              <span className="text-sm text-gray-500">{selectedExhibit.size.width}px</span>
            </div>
            <div>
              <label className="block text-sm text-gray-600">Height</label>
              <input
                type="range"
                min="200"
                max="600"
                value={selectedExhibit.size.height}
                onChange={(e) => handleSizeChange('height', parseInt(e.target.value))}
                className="w-full"
              />
              <span className="text-sm text-gray-500">{selectedExhibit.size.height}px</span>
            </div>
          </div>
        </div>

        {/* Table Customization */}
        {selectedExhibit.type === 'table' && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-700">Column Visibility</h3>
            {(selectedExhibit.data as any).columns.map((column: any) => (
              <div key={column.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium">{column.title}</span>
                <button
                  onClick={() => updateColumnVisibility(selectedExhibit.id, column.id, !column.visible)}
                  className={`p-1 rounded ${column.visible ? 'text-blue-600' : 'text-gray-400'}`}
                >
                  {column.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Chart Customization */}
        {(selectedExhibit.type === 'pie' || selectedExhibit.type === 'bar') && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-700">Chart Data</h3>
            <div className="space-y-2">
              {(selectedExhibit.data as any).labels.map((label: string, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">{label}</span>
                  <span className="text-sm text-gray-600">
                    {(selectedExhibit.data as any).values[index]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomizationPanel;