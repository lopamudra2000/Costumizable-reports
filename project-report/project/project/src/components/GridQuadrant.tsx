import React from 'react';
import { useDrop } from 'react-dnd';
import { Box, Paper, Typography } from '@mui/material';
import { DraggableQuadrantItem } from './DraggableQuadrantItem';

interface Item {
  id: string;
  content: string;
  exhibitLayout: 'QUAD' | 'FULLPAGE';
}

interface GridQuadrantProps {
  id: string;
  items: Item[];
  onDrop: (item: Item, quadrantId: string) => void;
  onItemDelete: (item: Item) => void;
  onItemMove: (item: Item, sourceQuad: string, targetQuad: string) => void;
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
    drop: (item: Item & { sourceQuadrant?: string }) => {
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

  const isFullPage = id === 'full';

  return (
    <Paper
      ref={drop}
      sx={{
        p: 2,
        height: '100%',
        minHeight: isFullPage ? 400 : 200,
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
      {isFullPage && (
        <Typography variant="h6" gutterBottom>
          Full Page Layout
        </Typography>
      )}
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