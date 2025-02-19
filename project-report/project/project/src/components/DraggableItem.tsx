import React from 'react';
import { useDrag } from 'react-dnd';
import { Paper, Typography } from '@mui/material';

interface DraggableItemProps {
  id: string;
  content: string;
}

export const DraggableItem: React.FC<DraggableItemProps> = ({ id, content }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ITEM',
    item: { id, content },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [id, content]); // Add dependencies to ensure drag source updates

  return (
    <Paper
      ref={drag}
      elevation={isDragging ? 0 : 1}
      sx={{
        p: 2,
        cursor: 'move',
        opacity: isDragging ? 0.5 : 1,
        transition: 'all 0.2s',
        bgcolor: 'background.paper',
        '&:hover': {
          bgcolor: 'grey.50',
          boxShadow: 2,
        },
        border: isDragging ? '2px dashed grey' : 'none',
      }}
    >
      <Typography>{content}</Typography>
    </Paper>
  );
};