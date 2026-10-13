import { z } from 'zod';

import { projectSchema, workInProgressSchema, workPageSchema, type ProjectStatus } from './schemas';

/** The visible label for each status; used by the Home list and by the Work meta rows. */
export const STATUS_LABEL: Record<ProjectStatus, string> = { 'in-progress': 'In progress' };

/*
 * One array feeds both pages: Home's "Work in progress" list reads name/summary/status,
 * Work's articles read meta/proposition/description/decisions.
 */
export const projects = z.array(projectSchema).parse([
  {
    id: 'inventory',
    name: 'Inventory Distribution',
    summary: 'A multi-tenant platform connecting a central warehouse to retail shops.',
    status: 'in-progress',
    variant: 'full',
    meta: [
      { term: 'Role', detail: 'Full Stack Developer' },
      { term: 'Period', detail: 'May 2026 – present' },
      { term: 'Status', detail: STATUS_LABEL['in-progress'] },
      {
        term: 'Built with',
        detail:
          'React, Next.js, TypeScript, Tailwind CSS, TanStack Query, Zustand, NestJS, PostgreSQL, JWT, REST APIs, IndexedDB, Docker',
      },
    ],
    proposition: 'A central warehouse and many retail shops, running on one multi-tenant platform.',
    diagram:
      'One warehouse feeding three shops, with the credit ledger beneath: every stock movement in one transaction.',
    description:
      'It covers inventory, distribution from the warehouse, sales in the shops, customer credit and business analytics, for warehouse administrators, shop owners and employees.',
    decisions: [
      {
        lead: 'Stock moves between places.',
        text: 'Orders go through creation, approval, shipment and receipt, and every stock movement is saved in one transaction.',
      },
      {
        lead: 'Customers buy on credit and pay in parts.',
        text: 'Partial payments, debt tracking, FIFO payment allocation, aging reports and an immutable financial ledger.',
      },
      {
        lead: 'The network in the shops is unreliable.',
        text: 'An offline-first PWA: sales and stock changes are saved in IndexedDB, queued, and synced with conflict resolution when the connection returns.',
      },
      {
        lead: 'Prices change, but old reports must stay true.',
        text: 'Weighted-average costing with immutable transaction snapshots, so past sales and profit reports stay accurate.',
      },
      {
        lead: 'Every action has to be secure and traceable.',
        text: 'Role-based authorization, audit logging, multilingual support, analytics dashboards and optimized backend services.',
      },
    ],
  },
  {
    id: 'sportbooker',
    name: 'SportBooker',
    summary:
      'A multi-tenant sports booking platform for players, venue operators and administrators.',
    status: 'in-progress',
    variant: 'full',
    meta: [
      { term: 'Role', detail: 'Full Stack Developer, contributing to the platform' },
      { term: 'For', detail: 'Syria Sport' },
      { term: 'Period', detail: 'Jan – Apr 2026' },
      {
        term: 'Built with',
        detail: 'React, Vite, TypeScript, Tailwind CSS, Zustand, NestJS, PostgreSQL, REST APIs',
      },
    ],
    proposition: 'Sports venue booking for players, venue operators and administrators.',
    diagram:
      'Three venues on their own subdomains sharing one platform, used by administrators, operators, staff and players.',
    description:
      'A multi-tenant platform serving the Syrian community through Syria Sport, where people manage bookings, schedules and sports facilities. I worked on both the frontend and the backend.',
    decisions: [
      {
        lead: 'Many organizations, one platform.',
        text: 'I contributed to a multi-tenant architecture that uses subdomains to keep each organization separate while they share one application.',
      },
      {
        lead: 'Four kinds of users with different rights.',
        text: 'Role-based access control and authentication workflows for administrators, operators, staff and players.',
      },
      {
        lead: 'Three audiences, on desktop and on phones.',
        text: 'Responsive interfaces built from reusable React components, with centralized Zustand state.',
      },
      {
        lead: 'Everything comes from the API.',
        text: 'REST integrations for authentication, bookings, scheduling, user management and tenant-specific data.',
      },
      {
        lead: 'Work on both sides.',
        text: 'NestJS services, PostgreSQL database design, migrations and seed data.',
      },
    ],
  },
  {
    id: 'your-guide',
    name: 'Your Guide',
    summary: 'A task, time and study management app. Personal project.',
    status: 'in-progress',
    variant: 'small',
    meta: [
      { term: 'Type', detail: 'Personal project' },
      { term: 'Status', detail: STATUS_LABEL['in-progress'] },
    ],
    proposition: 'A task, time and study management app.',
    diagram: 'Tasks, time and study as three overlapping circles.',
  },
]);

export const workPage = workPageSchema.parse({
  kicker: '01 — Work',
  pageTitle: 'Work',
  description:
    'Inventory Distribution, SportBooker and Your Guide: what each project does, my part in it, and the decisions behind it.',
  title: 'Three things I’m building.',
  lede: 'Two multi-tenant platforms and one personal project. For each one: what it does, my part in it, and the decisions that shaped it.',
  indexLabel: 'Projects on this page',
  decisionsLabel: 'Decisions',
});

export const workInProgress = workInProgressSchema.parse({
  title: 'Work in progress.',
  aside: "Three products I'm building now",
});
