import React from 'react';
import { useDrag } from 'react-dnd';
import { Paper, Typography, Box, Chip } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

interface DraggableItemProps {
  id: string;
  content: string;
  exhibitLayout: 'QUAD' | 'FULLPAGE';
}

export const DraggableItem: React.FC<DraggableItemProps> = ({ id, content, exhibitLayout }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ITEM',
    item: { id, content, exhibitLayout },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [id, content, exhibitLayout]);

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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <DragIndicatorIcon sx={{ color: 'grey.500' }} />
        <Box sx={{ flex: 1 }}>
          <Typography>{content}</Typography>
          <Chip
            label={exhibitLayout}
            size="small"
            color={exhibitLayout === 'FULLPAGE' ? 'primary' : 'default'}
            sx={{ mt: 1 }}
          />
        </Box>
      </Box>
    </Paper>
  );
};