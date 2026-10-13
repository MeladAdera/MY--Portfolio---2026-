import { InventoryDiagram } from './inventory-diagram';
import { SportBookerDiagram } from './sportbooker-diagram';
import { YourGuideDiagram } from './your-guide-diagram';

import type { DiagramProps } from './diagram';
import type { ComponentType } from 'react';

/**
 * The system diagram of each project, by project id. A project without one simply gets a
 * card without a drawing; adding a project means adding a small SVG here.
 */
export const projectDiagrams: Readonly<Record<string, ComponentType<DiagramProps>>> = {
  inventory: InventoryDiagram,
  sportbooker: SportBookerDiagram,
  'your-guide': YourGuideDiagram,
};
