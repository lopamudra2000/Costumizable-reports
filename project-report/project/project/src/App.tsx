import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import GridLayout from 'react-grid-layout';
import { Box, Button, Paper, Typography } from '@mui/material';
import { DraggableItem } from './components/DraggableItem';
import { GridQuadrant } from './components/GridQuadrant';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

interface Item {
  id: string;
  content: string;
  exhibitLayout: 'QUAD' | 'FULLPAGE';
}

interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  static: boolean;
}

interface PageData {
  quadrantItems: Record<string, Item[]>;
  layout: LayoutItem[];
}

function App() {
  const [sourceItems, setSourceItems] = useState<Item[]>([
    { id: '1', content: 'Item 1', exhibitLayout: 'QUAD' },
    { id: '2', content: 'Item 2', exhibitLayout: 'QUAD' },
    { id: '3', content: 'Item 3', exhibitLayout: 'FULLPAGE' },
    { id: '4', content: 'Item 4', exhibitLayout: 'QUAD' },
    { id: '5', content: 'Item 5', exhibitLayout: 'FULLPAGE' },
    { id: '6', content: 'Item 6', exhibitLayout: 'QUAD' },
    { id: '7', content: 'Item 7', exhibitLayout: 'QUAD' },
    { id: '8', content: 'Item 8', exhibitLayout: 'QUAD' },
  ]);

  const [currentPage, setCurrentPage] = useState(0);
  const [pages, setPages] = useState<PageData[]>([{
    quadrantItems: {
      'quad1': [],
      'quad2': [],
      'quad3': [],
      'quad4': [],
    },
    layout: [
      { i: 'quad1', x: 0, y: 0, w: 6, h: 6, static: true },
      { i: 'quad2', x: 6, y: 0, w: 6, h: 6, static: true },
      { i: 'quad3', x: 0, y: 6, w: 6, h: 6, static: true },
      { i: 'quad4', x: 6, y: 6, w: 6, h: 6, static: true },
    ]
  }]);

  const [summary, setSummary] = useState<string>('');

  const hasAnyItems = () => {
    const currentPageData = pages[currentPage];
    return Object.values(currentPageData.quadrantItems).some(items => items.length > 0);
  };

  const addNewPage = () => {
    setPages(prev => [...prev, {
      quadrantItems: {
        'quad1': [],
        'quad2': [],
        'quad3': [],
        'quad4': [],
      },
      layout: [
        { i: 'quad1', x: 0, y: 0, w: 6, h: 6, static: true },
        { i: 'quad2', x: 6, y: 0, w: 6, h: 6, static: true },
        { i: 'quad3', x: 0, y: 6, w: 6, h: 6, static: true },
        { i: 'quad4', x: 6, y: 6, w: 6, h: 6, static: true },
      ]
    }]);
    setCurrentPage(prev => prev + 1);
  };

  const hasQuadItems = (quadId: string): boolean => {
    const currentPageData = pages[currentPage];
    const adjacentQuads = [];
    
    if (quadId === 'quad1' || quadId === 'quad2') {
      adjacentQuads.push('quad1', 'quad2');
    }
    if (quadId === 'quad3' || quadId === 'quad4') {
      adjacentQuads.push('quad3', 'quad4');
    }
    
    return adjacentQuads.some(quad => {
      const items = currentPageData.quadrantItems[quad];
      return items.length > 0 && items[0].exhibitLayout === 'QUAD';
    });
  };

  const isQuadrantDisabled = (quadId: string) => {
    const currentPageData = pages[currentPage];
    
    // Check if adjacent quadrant has a FULLPAGE item
    if (quadId === 'quad2') {
      const quad1Items = currentPageData.quadrantItems['quad1'];
      return quad1Items.length > 0 && quad1Items[0].exhibitLayout === 'FULLPAGE';
    }
    if (quadId === 'quad4') {
      const quad3Items = currentPageData.quadrantItems['quad3'];
      return quad3Items.length > 0 && quad3Items[0].exhibitLayout === 'FULLPAGE';
    }
    
    return false;
  };

  const canAcceptFullPage = (quadId: string): boolean => {
    const currentPageData = pages[currentPage];

    // Only quadrants 1 and 3 can accept FULLPAGE items
    if (quadId !== 'quad1' && quadId !== 'quad3') {
      return false;
    }

    // Check if the adjacent quadrant has a QUAD item
    if (quadId === 'quad1') {
      const quad2Items = currentPageData.quadrantItems['quad2'];
      return !(quad2Items.length > 0);
    }

    if (quadId === 'quad3') {
      const quad4Items = currentPageData.quadrantItems['quad4'];
      return !(quad4Items.length > 0);
    }

    return false;
  };

  const handleDrop = React.useCallback((item: Item, quadrantId: string) => {
    // Remove the item from source items first
    setSourceItems((prev) => prev.filter((i) => i.id !== item.id));

    setPages(prev => {
      const newPages = [...prev];
      const currentQuadItems = newPages[currentPage].quadrantItems[quadrantId];
      
      // If quadrant already has items, return the dragged item to source
      if (currentQuadItems.length > 0) {
        // Add the item back to source items
        setSourceItems(prevItems => [...prevItems, item]);
        return prev;
      }
      
      newPages[currentPage] = {
        ...newPages[currentPage],
        quadrantItems: {
          ...newPages[currentPage].quadrantItems,
          [quadrantId]: [item]
        }
      };
      return newPages;
    });
  }, [currentPage]);

  const handleItemDelete = React.useCallback((item: Item, quadrantId: string) => {
    setSourceItems(prev => [...prev, item]);
    setPages(prev => {
      const newPages = [...prev];
      newPages[currentPage] = {
        ...newPages[currentPage],
        quadrantItems: {
          ...newPages[currentPage].quadrantItems,
          [quadrantId]: []
        }
      };
      return newPages;
    });
  }, [currentPage]);

  const handleItemMove = React.useCallback((
    item: Item,
    sourceQuad: string,
    targetQuad: string
  ) => {
    setPages(prev => {
      const newPages = [...prev];
      const targetQuadItems = newPages[currentPage].quadrantItems[targetQuad];
      
      // If target quadrant has items, don't allow move
      if (targetQuadItems.length > 0) {
        return prev;
      }

      newPages[currentPage] = {
        ...newPages[currentPage],
        quadrantItems: {
          ...newPages[currentPage].quadrantItems,
          [sourceQuad]: [],
          [targetQuad]: [item]
        }
      };
      return newPages;
    });
  }, [currentPage]);

  const getQuadrantName = (id: string): string => {
    const names: Record<string, string> = {
      'quad1': 'Quadrant 1',
      'quad2': 'Quadrant 2',
      'quad3': 'Quadrant 3',
      'quad4': 'Quadrant 4'
    };
    return names[id] || id;
  };

  const handleSubmit = () => {
    let summaryText = "Layout Summary:\n\n";
    
    pages.forEach((page, pageIndex) => {
      const hasItems = Object.values(page.quadrantItems).some(items => items.length > 0);
      if (!hasItems) return;

      summaryText += `Page ${pageIndex + 1}:\n`;
      
      ['quad1', 'quad2', 'quad3', 'quad4'].forEach(quadrant => {
        const items = page.quadrantItems[quadrant];
        if (items.length > 0) {
          summaryText += `  ${getQuadrantName(quadrant)}:\n`;
          items.forEach(item => {
            summaryText += `    • ${item.content} (${item.exhibitLayout})\n`;
          });
        }
      });
      summaryText += "\n";
    });

    setSummary(summaryText);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.100' }}>
        {/* Left Sidebar */}
        <Paper
          sx={{
            width: '25%',
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 0,
            boxShadow: 2,
          }}
        >
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Available Items
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            {sourceItems.map((item) => (
              <Box key={item.id} sx={{ mb: 2 }}>
                <DraggableItem {...item} />
              </Box>
            ))}
          </Box>
          
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{ mb: 2 }}
          >
            Submit
          </Button>

          {summary && (
            <Paper
              sx={{
                p: 2,
                bgcolor: 'grey.50',
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                overflow: 'auto',
                maxHeight: '400px',
              }}
            >
              {summary}
            </Paper>
          )}
        </Paper>

        {/* Right Grid Layout */}
        <Box sx={{ width: '75%', p: 3, overflow: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h5">
              Page {currentPage + 1} of {pages.length}
            </Typography>
            <Box>
              <Button
                variant="outlined"
                onClick={() => setCurrentPage(prev => prev - 1)}
                disabled={currentPage === 0}
                sx={{ mr: 1 }}
              >
                Previous Page
              </Button>
              <Button
                variant="outlined"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage === pages.length - 1}
                sx={{ mr: 1 }}
              >
                Next Page
              </Button>
              {hasAnyItems() && currentPage === pages.length - 1 && (
                <Button
                  variant="contained"
                  onClick={addNewPage}
                  color="primary"
                >
                  Add New Page
                </Button>
              )}
            </Box>
          </Box>
          <Paper sx={{ p: 3 }}>
            <GridLayout
              className="layout"
              layout={pages[currentPage].layout}
              cols={12}
              rowHeight={30}
              width={900}
              isDraggable={false}
              isResizable={false}
              margin={[20, 20]}
              compactType={null}
              preventCollision={true}
            >
              {pages[currentPage].layout.map((l) => (
                <div key={l.i}>
                  <GridQuadrant
                    id={l.i}
                    items={pages[currentPage].quadrantItems[l.i]}
                    onDrop={handleDrop}
                    onItemDelete={(item) => handleItemDelete(item, l.i)}
                    onItemMove={handleItemMove}
                    isDisabled={isQuadrantDisabled(l.i)}
                    canAcceptFullPage={canAcceptFullPage(l.i)}
                    hasQuadItems={hasQuadItems(l.i)}
                  />
                </div>
              ))}
            </GridLayout>
          </Paper>
        </Box>
      </Box>
    </DndProvider>
  );
}

export default App;