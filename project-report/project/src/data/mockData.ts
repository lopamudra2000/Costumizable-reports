import { Exhibit, TableData, ChartData } from '../types';
import { BarChart, PieChart, Table, Image } from 'lucide-react';

export const exhibits: Exhibit[] = [
  { id: 'table1', type: 'table', title: 'Sales Report', icon: 'Table' },
  { id: 'pie1', type: 'pie', title: 'Market Share', icon: 'PieChart' },
  { id: 'bar1', type: 'bar', title: 'Revenue Growth', icon: 'BarChart' },
  { id: 'image1', type: 'image', title: 'Product Overview', icon: 'Image' }
];

export const tableData: TableData = {
  columns: [
    { id: 'col1', title: 'Product', field: 'product', visible: true },
    { id: 'col2', title: 'Sales', field: 'sales', visible: true },
    { id: 'col3', title: 'Revenue', field: 'revenue', visible: true },
    { id: 'col4', title: 'Growth', field: 'growth', visible: true }
  ],
  rows: [
    { product: 'Product A', sales: 150, revenue: 15000, growth: '10%' },
    { product: 'Product B', sales: 200, revenue: 20000, growth: '15%' },
    { product: 'Product C', sales: 180, revenue: 18000, growth: '12%' }
  ]
};

export const pieChartData: ChartData = {
  labels: ['Product A', 'Product B', 'Product C'],
  values: [30, 45, 25]
};

export const barChartData: ChartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr'],
  values: [1200, 1900, 1500, 2100]
};

export const disclaimers = {
  table: 'This report contains confidential sales data. Do not distribute.',
  pie: 'Market share data is based on internal analysis.',
  bar: 'Revenue figures are subject to audit.',
  image: 'Product images are for illustration purposes only.'
};