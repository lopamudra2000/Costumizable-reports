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
  isDisabled?: boolean;
  canAcceptFullPage: boolean;
  hasQuadItems: boolean;
}

export const GridQuadrant: React.FC<GridQuadrantProps> = ({
  id,
  items,
  onDrop,
  onItemDelete,
  onItemMove,
  isDisabled = false,
  canAcceptFullPage,
  hasQuadItems
}) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ['ITEM', 'QUADRANT_ITEM'],
    canDrop: (item: Item & { sourceQuadrant?: string }) => {
      if (isDisabled) return false;
      
      // Prevent FULLPAGE items from being placed where QUAD items exist
      if (item.exhibitLayout === 'FULLPAGE') {
        if (!canAcceptFullPage || hasQuadItems) return false;
      }
      
      // Prevent QUAD items from being placed where FULLPAGE items exist
      if (item.exhibitLayout === 'QUAD') {
        const hasFullPageItem = items.some(i => i.exhibitLayout === 'FULLPAGE');
        if (hasFullPageItem) return false;
      }
      
      return true;
    },
    drop: (item: Item & { sourceQuadrant?: string }) => {
      if (isDisabled) return;
      if (item.exhibitLayout === 'FULLPAGE' && (!canAcceptFullPage || hasQuadItems)) return;
      if (item.exhibitLayout === 'QUAD' && items.some(i => i.exhibitLayout === 'FULLPAGE')) return;
      
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
  }), [id, onDrop, onItemMove, isDisabled, canAcceptFullPage, hasQuadItems, items]);

  return (
    <Paper
      ref={drop}
      sx={{
        p: 2,
        height: '100%',
        minHeight: 200,
        bgcolor: isDisabled 
          ? 'grey.300'
          : isOver 
            ? canDrop ? 'primary.50' : 'error.100'
            : canDrop 
              ? 'grey.50' 
              : 'background.paper',
        border: 2,
        borderColor: isDisabled
          ? 'grey.400'
          : isOver 
            ? canDrop ? 'primary.main' : 'error.main'
            : canDrop 
              ? 'primary.light'
              : 'grey.200',
        transition: 'all 0.2s',
        opacity: isDisabled ? 0.7 : 1,
        pointerEvents: isDisabled ? 'none' : 'auto',
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