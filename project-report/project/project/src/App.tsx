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
  isFullPage: boolean;
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
    ],
    isFullPage: false
  }]);

  const [summary, setSummary] = useState<string>('');

  const createQuadPage = (): PageData => ({
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
    ],
    isFullPage: false
  });

  const createFullPage = (item: Item): PageData => ({
    quadrantItems: {
      'full': [item]
    },
    layout: [
      { i: 'full', x: 0, y: 0, w: 12, h: 12, static: true }
    ],
    isFullPage: true
  });

  const isCurrentPageFull = () => {
    const currentPageData = pages[currentPage];
    if (currentPageData.isFullPage) {
      return currentPageData.quadrantItems['full'].length > 0;
    }
    return Object.values(currentPageData.quadrantItems).every(items => items.length > 0);
  };

  const addNewPage = () => {
    setPages(prev => [...prev, createQuadPage()]);
    setCurrentPage(prev => prev + 1);
  };

  const handleDrop = React.useCallback((item: Item, quadrantId: string) => {
    if (item.exhibitLayout === 'FULLPAGE') {
      // Create a new full page for this item
      setPages(prev => [...prev, createFullPage(item)]);
      setCurrentPage(prev => prev + 1);
      setSourceItems((prev) => prev.filter((i) => i.id !== item.id));
      return;
    }

    setPages(prev => {
      const newPages = [...prev];
      const currentQuadItems = newPages[currentPage].quadrantItems[quadrantId];
      
      if (currentQuadItems.length > 0) {
        setSourceItems(prevItems => [...prevItems, ...currentQuadItems]);
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
    setSourceItems((prev) => prev.filter((i) => i.id !== item.id));
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
    if (item.exhibitLayout === 'FULLPAGE') return; // Prevent moving full page items

    setPages(prev => {
      const newPages = [...prev];
      const targetQuadItems = newPages[currentPage].quadrantItems[targetQuad];
      
      if (targetQuadItems.length > 0) {
        newPages[currentPage] = {
          ...newPages[currentPage],
          quadrantItems: {
            ...newPages[currentPage].quadrantItems,
            [sourceQuad]: targetQuadItems,
            [targetQuad]: [item]
          }
        };
      } else {
        newPages[currentPage] = {
          ...newPages[currentPage],
          quadrantItems: {
            ...newPages[currentPage].quadrantItems,
            [sourceQuad]: [],
            [targetQuad]: [item]
          }
        };
      }
      return newPages;
    });
  }, [currentPage]);

  const getQuadrantName = (id: string): string => {
    const names: Record<string, string> = {
      'quad1': 'Quadrant 1',
      'quad2': 'Quadrant 2',
      'quad3': 'Quadrant 3',
      'quad4': 'Quadrant 4',
      'full': 'Full Page'
    };
    return names[id] || id;
  };

  const handleSubmit = () => {
    let summaryText = "Layout Summary:\n\n";
    
    pages.forEach((page, pageIndex) => {
      const hasItems = Object.values(page.quadrantItems).some(items => items.length > 0);
      if (!hasItems) return;

      summaryText += `Page ${pageIndex + 1}:\n`;
      
      if (page.isFullPage) {
        const fullPageItem = page.quadrantItems['full'][0];
        summaryText += `  Full Page Item:\n    • ${fullPageItem.content}\n`;
      } else {
        ['quad1', 'quad2', 'quad3', 'quad4'].forEach(quadrant => {
          const items = page.quadrantItems[quadrant];
          if (items.length > 0) {
            summaryText += `  ${getQuadrantName(quadrant)}:\n`;
            items.forEach(item => {
              summaryText += `    • ${item.content}\n`;
            });
          }
        });
      }
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
              {isCurrentPageFull() && currentPage === pages.length - 1 && (
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