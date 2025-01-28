import create from 'zustand';
import { CanvasItem, GridPosition } from '../types';

interface DashboardStore {
  canvasItems: CanvasItem[];
  selectedItem: string | null;
  addCanvasItem: (item: CanvasItem) => void;
  updateCanvasItem: (id: string, updates: Partial<CanvasItem>) => void;
  removeCanvasItem: (id: string) => void;
  setSelectedItem: (id: string | null) => void;
  updateColumnVisibility: (itemId: string, columnId: string, visible: boolean) => void;
  reorderColumns: (itemId: string, startIndex: number, endIndex: number) => void;
  findAvailablePosition: (requiredWidth: number) => GridPosition;
}

const GRID_COLUMNS = 12;

export const useStore = create<DashboardStore>((set, get) => ({
  canvasItems: [],
  selectedItem: null,

  findAvailablePosition: (requiredWidth: number): GridPosition => {
    const items = get().canvasItems;
    let row = 0;
    let found = false;
    let position: GridPosition = { row: 0, column: 0, width: requiredWidth };

    while (!found) {
      const rowItems = items.filter(item => item.position.row === row);
      const occupiedSpaces = new Array(GRID_COLUMNS).fill(false);

      // Mark occupied spaces in this row
      rowItems.forEach(item => {
        for (let i = item.position.column; i < item.position.column + item.position.width; i++) {
          occupiedSpaces[i] = true;
        }
      });

      // Find first available space that fits
      let availableStart = -1;
      let consecutiveEmpty = 0;

      for (let i = 0; i < GRID_COLUMNS; i++) {
        if (!occupiedSpaces[i]) {
          if (availableStart === -1) availableStart = i;
          consecutiveEmpty++;
          if (consecutiveEmpty >= requiredWidth) {
            position = { row, column: availableStart, width: requiredWidth };
            found = true;
            break;
          }
        } else {
          availableStart = -1;
          consecutiveEmpty = 0;
        }
      }

      if (!found) row++;
    }

    return position;
  },

  addCanvasItem: (item) =>
    set((state) => ({ canvasItems: [...state.canvasItems, item] })),

  updateCanvasItem: (id, updates) =>
    set((state) => ({
      canvasItems: state.canvasItems.map((item) =>
        item.id === id
          ? {
              ...item,
              ...updates,
              position: {
                ...item.position,
                ...(updates.position || {}),
              },
              size: {
                ...item.size,
                ...(updates.size || {}),
              },
            }
          : item
      ),
    })),

  removeCanvasItem: (id) =>
    set((state) => ({
      canvasItems: state.canvasItems.filter((item) => item.id !== id),
    })),

  setSelectedItem: (id) => set({ selectedItem: id }),

  updateColumnVisibility: (itemId, columnId, visible) =>
    set((state) => ({
      canvasItems: state.canvasItems.map((item) => {
        if (item.id === itemId && item.type === 'table') {
          return {
            ...item,
            data: {
              ...item.data,
              columns: (item.data as any).columns.map((col: any) =>
                col.id === columnId ? { ...col, visible } : col
              ),
            },
          };
        }
        return item;
      }),
    })),

  reorderColumns: (itemId, startIndex, endIndex) =>
    set((state) => ({
      canvasItems: state.canvasItems.map((item) => {
        if (item.id === itemId && item.type === 'table') {
          const columns = [...(item.data as any).columns];
          const [removed] = columns.splice(startIndex, 1);
          columns.splice(endIndex, 0, removed);
          return {
            ...item,
            data: {
              ...item.data,
              columns,
            },
          };
        }
        return item;
      }),
    })),
}));