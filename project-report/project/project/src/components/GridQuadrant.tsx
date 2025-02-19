import React from 'react';
import { useDrop } from 'react-dnd';
import { Box, Paper } from '@mui/material';
import { DraggableQuadrantItem } from './DraggableQuadrantItem.tsx';

interface GridQuadrantProps {
  id: string;
  items: Array<{ id: string; content: string }>;
  onDrop: (item: any, quadrantId: string) => void;
  onItemDelete: (item: { id: string; content: string }) => void;
  onItemMove: (item: { id: string; content: string }, sourceQuad: string, targetQuad: string) => void;
}

export const GridQuadrant: React.FC<GridQuadrantProps> = ({ 
  id, 
  items, 
  onDrop, 
  onItemDelete,
  onItemMove 
}) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ['ITEM', 'QUADRANT_ITEM'],
    drop: (item: any & { sourceQuadrant?: string }) => {
      if (item.sourceQuadrant) {
        if (item.sourceQuadrant !== id) {
          onItemMove(item, item.sourceQuadrant, id);
        }
      } else {
        onDrop(item, id);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }), [id, onDrop, onItemMove]);

  return (
    <Paper
      ref={drop}
      sx={{
        p: 2,
        height: '100%',
        minHeight: 200,
        bgcolor: isOver ? 'primary.50' : canDrop ? 'grey.50' : 'background.paper',
        border: 2,
        borderColor: isOver 
          ? 'primary.main'
          : canDrop 
            ? 'primary.light'
            : 'grey.200',
        transition: 'all 0.2s',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {items.map((item) => (
          <DraggableQuadrantItem
            key={item.id}
            item={item}
            sourceQuadrant={id}
            onDelete={() => onItemDelete(item)}
          />
        ))}
      </Box>
    </Paper>
  );
};