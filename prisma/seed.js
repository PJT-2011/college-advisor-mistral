/**
 * Database Seed Script
 * 
 * Populates the database with initial campus resources and sample data.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // Clear existing data
  await prisma.campusResource.deleteMany();
  console.log('✅ Cleared existing campus resources');

  // Seed Campus Resources
  const resources = [
    // Clubs
    {
      category: 'club',
      name: 'Computer Science Club',
      description: 'Weekly meetings for CS students to collaborate on projects, attend workshops, and network with industry professionals.',
      location: 'Engineering Building, Room 201',
      contactInfo: 'csclub@university.edu',
      website: 'https://university.edu/csclub',
      hours: 'Thursdays 6-8 PM',
      tags: ['technology', 'programming', 'networking', 'cs', 'engineering'],
    },
    {
      category: 'club',
      name: 'Debate Team',
      description: 'Competitive debate team that participates in regional and national tournaments. Open to all skill levels.',
      location: 'Student Union, Room 305',
      contactInfo: 'debate@university.edu',
      website: 'https://university.edu/debate',
      hours: 'Tuesdays and Thursdays 7-9 PM',
      tags: ['speaking', 'argumentation', 'competition', 'communication'],
    },
    {
      category: 'club',
      name: 'Environmental Action Group',
      description: 'Student organization focused on sustainability initiatives, campus clean-ups, and environmental advocacy.',
      location: 'Sustainability Center',
      contactInfo: 'green@university.edu',
      website: 'https://university.edu/environmental',
      hours: 'Wednesdays 5-6 PM',
      tags: ['environment', 'sustainability', 'volunteering', 'activism'],
    },

    // Services
    {
      category: 'service',
      name: 'Academic Tutoring Center',
      description: 'Free tutoring services for math, science, writing, and other core subjects. Drop-in or by appointment.',
      location: 'Library, 2nd Floor',
      contactInfo: '(555) 123-4567',
      website: 'https://university.edu/tutoring',
      hours: 'Mon-Fri 9 AM-8 PM, Sat-Sun 12-6 PM',
      tags: ['tutoring', 'academic support', 'study help', 'math', 'writing'],
    },
    {
      category: 'service',
      name: 'Career Services Center',
      description: 'Resume reviews, mock interviews, internship placement, and career counseling for all students.',
      location: 'Student Services Building, 1st Floor',
      contactInfo: 'careers@university.edu',
      website: 'https://university.edu/careers',
      hours: 'Mon-Fri 9 AM-5 PM',
      tags: ['career', 'jobs', 'internships', 'resume', 'interviews'],
    },
    {
      category: 'service',
      name: 'Writing Center',
      description: 'One-on-one consultations to help with essays, research papers, and writing assignments.',
      location: 'Library, 3rd Floor',
      contactInfo: 'writing@university.edu',
      website: 'https://university.edu/writing',
      hours: 'Mon-Thu 10 AM-8 PM, Fri 10 AM-4 PM',
      tags: ['writing', 'essays', 'papers', 'academic support'],
    },

    // Support Services
    {
      category: 'support',
      name: 'Counseling and Psychological Services (CAPS)',
      description: 'Free, confidential mental health services including individual counseling, group therapy, and crisis support.',
      location: 'Health & Wellness Center, 2nd Floor',
      contactInfo: '(555) 123-CAPS (2277)',
      website: 'https://university.edu/caps',
      hours: 'Mon-Fri 8 AM-5 PM, Crisis line 24/7',
      tags: ['mental health', 'counseling', 'therapy', 'crisis', 'wellness'],
    },
    {
      category: 'support',
      name: 'Student Health Services',
      description: 'Primary medical care, vaccinations, prescriptions, and health education for students.',
      location: 'Health & Wellness Center, 1st Floor',
      contactInfo: '(555) 123-4568',
      website: 'https://university.edu/health',
      hours: 'Mon-Fri 8 AM-5 PM',
      tags: ['health', 'medical', 'doctor', 'clinic', 'wellness'],
    },
    {
      category: 'support',
      name: 'Disability Services',
      description: 'Accommodations and support for students with disabilities, including testing accommodations and assistive technology.',
      location: 'Accessibility Center',
      contactInfo: 'disability@university.edu',
      website: 'https://university.edu/disability',
      hours: 'Mon-Fri 9 AM-5 PM',
      tags: ['disability', 'accommodations', 'accessibility', 'support'],
    },

    // Facilities
    {
      category: 'facility',
      name: 'Campus Recreation Center',
      description: 'State-of-the-art fitness facility with cardio equipment, weights, pool, rock climbing wall, and group fitness classes.',
      location: '123 Recreation Drive',
      contactInfo: '(555) 123-4569',
      website: 'https://university.edu/rec',
      hours: 'Mon-Thu 6 AM-11 PM, Fri 6 AM-10 PM, Sat-Sun 8 AM-10 PM',
      tags: ['gym', 'fitness', 'exercise', 'recreation', 'sports', 'wellness'],
    },
    {
      category: 'facility',
      name: 'Main Library',
      description: '24/7 study spaces, research assistance, computer labs, and extensive collection of books and digital resources.',
      location: 'Central Campus',
      contactInfo: '(555) 123-4570',
      website: 'https://university.edu/library',
      hours: 'Open 24/7 during semester',
      tags: ['library', 'study', 'books', 'research', 'quiet'],
    },

    // Events
    {
      category: 'event',
      name: 'Welcome Week',
      description: 'Annual orientation events for new students including campus tours, social activities, and resource fairs.',
      location: 'Various campus locations',
      contactInfo: 'orientation@university.edu',
      website: 'https://university.edu/orientation',
      hours: 'First week of Fall semester',
      tags: ['orientation', 'freshman', 'welcome', 'new students'],
    },
    {
      category: 'event',
      name: 'Career Fair',
      description: 'Bi-annual event connecting students with employers for internships and full-time positions.',
      location: 'Student Union Ballroom',
      contactInfo: 'careers@university.edu',
      website: 'https://university.edu/careerfair',
      hours: 'Fall and Spring semesters',
      tags: ['career', 'jobs', 'internships', 'networking', 'employers'],
    },
  ];

let createdCount = 0;
for (const resource of resources) {
  await prisma.campusResource.create({
    data: {
      ...resource,
      tags: Array.isArray(resource.tags) ? resource.tags.join(', ') : resource.tags,
    },
  });
  createdCount++;
}  console.log(`✅ Created ${createdCount} campus resources\n`);
  console.log('🎉 Database seeding complete!\n');
  console.log('Sample resources:');
  console.log('  - Computer Science Club');
  console.log('  - Academic Tutoring Center');
  console.log('  - Counseling Services (CAPS)');
  console.log('  - Campus Recreation Center');
  console.log('  - Career Services\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
