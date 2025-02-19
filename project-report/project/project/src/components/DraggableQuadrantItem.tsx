import React from 'react';
import { useDrag } from 'react-dnd';
import { Paper, Typography, IconButton, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

interface DraggableQuadrantItemProps {
  item: {
    id: string;
    content: string;
  };
  sourceQuadrant: string;
  onDelete: () => void;
}

export const DraggableQuadrantItem: React.FC<DraggableQuadrantItemProps> = ({
  item,
  sourceQuadrant,
  onDelete
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'QUADRANT_ITEM',
    item: { ...item, sourceQuadrant },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [item, sourceQuadrant]);

  return (
    <Paper
      ref={drag}
      elevation={isDragging ? 0 : 1}
      sx={{
        p: 1,
        cursor: 'move',
        opacity: isDragging ? 0.5 : 1,
        transition: 'all 0.2s',
        bgcolor: 'background.paper',
        '&:hover': {
          bgcolor: 'grey.50',
          '& .actions': {
            opacity: 1,
          },
        },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <DragIndicatorIcon sx={{ color: 'grey.500' }} />
        <Typography>{item.content}</Typography>
      </Box>
      <IconButton
        size="small"
        onClick={onDelete}
        className="actions"
        sx={{
          opacity: 0,
          transition: 'opacity 0.2s',
          '&:hover': {
            color: 'error.main',
          },
        }}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    </Paper>
  );
};