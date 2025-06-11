export type FilterValues = 'all' | 'important' | 'upcoming' | 'today' | 'completed';

export type IFilter = | { filterBy: 'tag'; tagId: string } | { filterBy: 'priority'; priority: string } | { filterBy: 'property'; property: FilterValues }; // Reuse your existing FilterValues type

export const SIDE_NAV_ITEMS = [
  {
    name: 'All Tasks',
    value: 'all' as FilterValues,
    icon: 'home'
  },
  {
    name: 'Important',
    value: 'important' as FilterValues,
    icon: 'star'
  },
  {
    name: 'Upcoming',
    value: 'upcoming' as FilterValues,
    icon: 'calendar'
  },
  {
    name: 'Today',
    value: 'today' as FilterValues,
    icon: 'clock'
  },
  {
    name: 'Completed',
    value: 'completed' as FilterValues,
    icon: 'folder'
  },
]