export const seedNotifications = [
  {
    id: 'notif-1',
    userId: 'usr-organizer',
    title: 'New Attendee Registered',
    message: 'Marcus Chen registered for Annual Tech Innovators Summit 2026.',
    time: '2 hours ago',
    read: false,
    type: 'registration',
    link: '/organizer/events/evt-101/attendees'
  },
  {
    id: 'notif-2',
    userId: 'usr-organizer',
    title: 'Milestone: 75% Capacity Reached',
    message: 'Annual Tech Innovators Summit 2026 has reached 384 of 500 registrations.',
    time: '5 hours ago',
    read: false,
    type: 'milestone',
    link: '/organizer/events/evt-101/attendees'
  },
  {
    id: 'notif-3',
    userId: 'usr-organizer',
    title: 'Event Published Successfully',
    message: 'UX Future Design Summit is now live and accepting registrations.',
    time: '2 days ago',
    read: true,
    type: 'publish',
    link: '/events/evt-107'
  },
  {
    id: 'notif-4',
    userId: 'usr-attendee',
    title: 'Booking Confirmed!',
    message: 'Your ticket for Annual Tech Innovators Summit 2026 (ES-2026-8819) is confirmed.',
    time: '1 day ago',
    read: false,
    type: 'ticket',
    link: '/attendee/bookings'
  },
  {
    id: 'notif-5',
    userId: 'usr-admin',
    title: 'New Organizer Onboarded',
    message: 'SoundScape India verified their profile and published Moonlight Jazz Music Night.',
    time: '1 day ago',
    read: true,
    type: 'system',
    link: '/admin/users'
  }
];
