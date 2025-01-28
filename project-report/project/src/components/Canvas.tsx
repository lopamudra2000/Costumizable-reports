import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useStore } from '../store/store';
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, PieChart, Pie } from 'recharts';
import { ResizableBox } from 'react-resizable';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download } from 'lucide-react';
import { disclaimers } from '../data/mockData';
import 'react-resizable/css/styles.css';
import { CanvasItem as CanvasItemType } from '../types';

const GRID_COLUMNS = 12;
const GRID_GAP = 16; // pixels
const MIN_COLUMN_WIDTH = 6; // minimum columns an item can occupy

interface DraggableItemProps {
  item: CanvasItemType;
  children: React.ReactNode;
  gridColumnWidth: number;
}

function DraggableItem({ item, children, gridColumnWidth }: DraggableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: item.id,
    data: { ...item, isCanvasItem: true }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    position: 'absolute' as const,
    left: item.position.column * gridColumnWidth + (item.position.column * GRID_GAP),
    top: item.position.row * (item.size.height + GRID_GAP),
    width: (item.position.width * gridColumnWidth) + ((item.position.width - 1) * GRID_GAP),
    height: item.size.height,
    zIndex: isDragging ? 999 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

function Canvas() {
  const { setNodeRef } = useDroppable({
    id: 'canvas',
  });

  const containerRef = React.useRef<HTMLDivElement>(null);
  const [gridColumnWidth, setGridColumnWidth] = React.useState(0);

  React.useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth - (GRID_GAP * (GRID_COLUMNS - 1));
      setGridColumnWidth(containerWidth / GRID_COLUMNS);
    }
  }, []);

  const canvasItems = useStore((state) => state.canvasItems);
  const setSelectedItem = useStore((state) => state.setSelectedItem);
  const updateCanvasItem = useStore((state) => state.updateCanvasItem);

  const handleResize = (item: CanvasItemType, newWidth: number) => {
    const newGridWidth = Math.max(
      MIN_COLUMN_WIDTH,
      Math.min(
        GRID_COLUMNS - item.position.column,
        Math.round(newWidth / (gridColumnWidth + GRID_GAP))
      )
    );

    updateCanvasItem(item.id, {
      position: {
        ...item.position,
        width: newGridWidth
      }
    });
  };

  const exportToPDF = async () => {
    if (!containerRef.current) return;

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;

    // Add report title
    pdf.setFontSize(20);
    pdf.text('Dynamic Report Dashboard', pageWidth / 2, margin, { align: 'center' });
    pdf.setFontSize(12);
    
    let yOffset = margin + 10;

    for (const item of canvasItems) {
      const itemContainer = document.getElementById(`exhibit-${item.id}`);
      if (!itemContainer) continue;

      // Add new page if needed
      if (yOffset > pageHeight - 60) {
        pdf.addPage();
        yOffset = margin;
      }

      // Add exhibit title
      pdf.setFontSize(14);
      pdf.text(item.title || `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} Report`, margin, yOffset);
      yOffset += 10;

      // Capture the exhibit
      const canvas = await html2canvas(itemContainer, {
        scale: 2,
        backgroundColor: null,
      });

      // Calculate dimensions to fit within page width while maintaining aspect ratio
      const imgWidth = pageWidth - (margin * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Add the exhibit image
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', margin, yOffset, imgWidth, imgHeight);
      yOffset += imgHeight + 5;

      // Add disclaimer
      pdf.setFontSize(8);
      pdf.setTextColor(128);
      const disclaimer = disclaimers[item.type as keyof typeof disclaimers] || '';
      pdf.text(disclaimer, margin, yOffset, { maxWidth: pageWidth - (margin * 2) });
      yOffset += 15;

      pdf.setTextColor(0);
    }

    // Save the PDF
    pdf.save('dashboard-report.pdf');
  };

  const renderTableComponent = (data: any) => (
    <div className="overflow-auto h-full">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {data.columns
              .filter((col: any) => col.visible)
              .map((column: any) => (
                <th
                  key={column.id}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.title}
                </th>
              ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.rows.map((row: any, idx: number) => (
            <tr key={idx}>
              {data.columns
                .filter((col: any) => col.visible)
                .map((column: any) => (
                  <td
                    key={column.id}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {row[column.field]}
                  </td>
                ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderPieChart = (data: any) => (
    <PieChart width={300} height={200}>
      <Pie
        data={data.labels.map((label: string, index: number) => ({
          name: label,
          value: data.values[index],
        }))}
        cx="50%"
        cy="50%"
        outerRadius={80}
        fill="#8884d8"
        dataKey="value"
        label
      />
      <Tooltip />
    </PieChart>
  );

  const renderBarChart = (data: any) => (
    <BarChart width={300} height={200} data={data.labels.map((label: string, index: number) => ({
      name: label,
      value: data.values[index],
    }))}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="value" fill="#8884d8" />
    </BarChart>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-end mb-4">
        <button
          onClick={exportToPDF}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download size={16} />
          Export to PDF
        </button>
      </div>
      <div
        ref={(node) => {
          setNodeRef(node);
          if (containerRef) containerRef.current = node;
        }}
        className="relative flex-1 w-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-4 overflow-auto"
        style={{ minHeight: '800px' }}
      >
        <div className="relative w-full h-full min-h-[800px]">
          {gridColumnWidth > 0 && canvasItems.map((item) => (
            <DraggableItem key={item.id} item={item} gridColumnWidth={gridColumnWidth}>
              <ResizableBox
                width={(item.position.width * gridColumnWidth) + ((item.position.width - 1) * GRID_GAP)}
                height={item.size.height}
                onResize={(e, { size }) => {
                  handleResize(item, size.width);
                  updateCanvasItem(item.id, {
                    size: { ...item.size, height: size.height }
                  });
                }}
                minConstraints={[MIN_COLUMN_WIDTH * gridColumnWidth, 200]}
                maxConstraints={[(GRID_COLUMNS - item.position.column) * gridColumnWidth, 600]}
                handle={<div className="absolute bottom-right w-4 h-4 bg-blue-500 rounded-full cursor-se-resize" />}
              >
                <div
                  id={`exhibit-${item.id}`}
                  onClick={() => setSelectedItem(item.id)}
                  className="w-full h-full bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow"
                >
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {item.title || `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} Report`}
                    </h3>
                  </div>
                  <div className="h-[calc(100%-2rem)] overflow-auto">
                    {item.type === 'table' && renderTableComponent(item.data)}
                    {item.type === 'pie' && renderPieChart(item.data)}
                    {item.type === 'bar' && renderBarChart(item.data)}
                    {item.type === 'image' && (
                      <img
                        src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800"
                        alt="Demo"
                        className="w-full h-full object-cover rounded"
                      />
                    )}
                  </div>
                </div>
              </ResizableBox>
            </DraggableItem>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Canvas;