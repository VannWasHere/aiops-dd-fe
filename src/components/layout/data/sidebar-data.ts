import {
  LayoutDashboard,
  Cloud,
  Activity,
  MessagesSquare,
  Settings,
  Search,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Ops Investigator',
    email: 'ops-admin@cable3.io',
    avatar: '',
  },
  teams: [
    {
      name: 'Cable3 Ops',
      logo: Activity,
      plan: 'AI-powered Incidents',
    },
  ],
  navGroups: [
    {
      title: 'Investigator Platform',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Traces',
          url: '/traces',
          icon: Search,
        },
        {
          title: 'Bedrock Usage',
          url: '/services',
          icon: Cloud,
        },
        {
          title: 'Investigations',
          url: '/investigations',
          icon: Activity,
        },
        {
          title: 'AI Chat',
          url: '/chat',
          icon: MessagesSquare,
        },
        {
          title: 'Settings',
          url: '/settings',
          icon: Settings,
        },
      ],
    },
  ],
}
