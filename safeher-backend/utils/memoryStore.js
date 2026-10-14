// In-Memory Database Store for SafeHer (used when MongoDB is not connected)

const users = [];
const walkSessions = new Map();
const escorts = new Map();
const communityAlerts = [
  {
    id: 'alert-1',
    title: 'Streetlight out near Gate 2 walkway',
    location: 'Gate 2 / Cycle Stand',
    category: 'Lighting / Visibility',
    description: 'The pole light near cycle stand is completely dark after 8:30 PM.',
    upvotes: 35,
    expiresInDays: 6,
    createdAt: new Date()
  },
  {
    id: 'alert-2',
    title: 'Suspicious grey sedan idling near Lot D',
    location: 'West Student Parking Lot D',
    category: 'Suspicious Activity',
    description: 'Car parked with engine revving when solo pedestrians pass. Campus police notified.',
    upvotes: 48,
    expiresInDays: 5,
    createdAt: new Date()
  }
];
const complaints = [];
const anonymousReports = [];
const heatmapReports = [];

module.exports = {
  users,
  walkSessions,
  escorts,
  communityAlerts,
  complaints,
  anonymousReports,
  heatmapReports
};
