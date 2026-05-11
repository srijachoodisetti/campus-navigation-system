
import { Building, CampusEvent } from './types';

// Centurion University (CUTM) Branding
export const COLLEGE_LOGO = 'https://d3siqbc42egr8i.cloudfront.net/institute/eenadupratibha/posts/teaching-posts-in-centurion-u/925939eb73ad4af2b372f3d3447ab1f2.png';

// Centurion University (CUTM) Vizianagaram Campus Coordinates
export const CAMPUS_CENTER = { lat: 18.2936, lng: 83.4316 }; 

export const BUILDINGS: Building[] = [
  {
    id: 'block_a',
    name: 'Block A (BSc)',
    description: 'The primary academic hub for  BSc students. Features modern lecture halls and specialized science labs.',
    lat: 18.2936,
    lng: 83.4316,
    type: 'academic',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHbrd53dKPbSJdfctykEYHlbaK6ZDbCiTmjA&s'
  },
  {
    id: 'block_b',
    name: 'Block B (Library )',
    description: 'Houses the central digital library and the Girls\' Mess Hall. A key hub for study and student welfare.',
    lat: 18.2932,
    lng: 83.4325,
    type: 'academic',
    image: 'https://www.amecet.in/images/campus-profile/gallery/centurion/large/12.jpg'
  },
  {
    id: 'block_b_restaurant',
    name: 'Skyline Rooftop Restaurant (Block B)',
    description: 'Located on the 3rd floor of Block B. Featuring iconic green dome seating areas with panoramic mountain views.',
    lat: 18.2933,
    lng: 83.4324,
    type: 'food',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'block_c',
    name: 'Block C (Cafeteria & Admin)',
    description: 'The central administration block. Contains the main cafeteria, Academic Department offices, and the Faculty Staff Room.',
    lat: 18.2945,
    lng: 83.4310,
    type: 'food',
    image: 'https://caffeine.ai/imgs/share-logo.jpeg'
  },
  {
    id: 'block_d',
    name: 'Block D (CSE Department)',
    description: 'Dedicated center for Computer Science Engineering. Home to advanced coding labs.',
    lat: 18.2950,
    lng: 83.4305,
    type: 'academic',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ03ADJhEIsyE7pA5l_xjztsmSBuU9wWr79cw&s'
  },
  {
    id: 'solar_plant',
    name: 'Solar Power Plant',
    description: 'CUTM Renewable Energy hub. Located on the main road towards the hostel cluster.',
    lat: 18.2880,
    lng: 83.4250,
    type: 'administrative',
    image: 'https://i.postimg.cc/MKCrn7DM/Snapchat-1424030522.jpg'
  },
  {
    id: 'boys_mess',
    name: 'Boys Mess',
    description: 'The central dining hall for boys, located at the northern end of the hostel cluster.',
    lat: 18.2845,
    lng: 83.4205,
    type: 'food',
    image: ' https://www.shutterstock.com/image-photo/moscow-russia-september-28-2023-260nw-2525512963.jpg'
  },
  {
    id: 'boys_hostel',
    name: 'Boys Hostel',
    description: 'Primary residential block for male students, located ~1.7km from main campus.',
    lat: 18.2830,
    lng: 83.4215,
    type: 'residential',
    image: 'https://cutmap.ac.in/wp-content/uploads/2024/09/BOYS.jpg'
  },
  {
    id: 'skill_campus',
    name: 'Skill Campus',
    description: 'Hub for vocational training, located west of the hostel path.',
    lat: 18.2825,
    lng: 83.4190,
    type: 'academic',
    image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'sports_ground',
    name: 'Sports Ground',
    description: 'Large outdoor athletic field for cricket, football, and campus sports events.',
    lat: 18.2810,
    lng: 83.4185,
    type: 'recreational',
    image: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse3.mm.bing.net%2Fth%2Fid%2FOIP.HXR6tUIveWIB9eKbSoROsAHaCI%3Fpid%3DApi&f=1&ipt=af38a51f3ce4f09361534665a84f0117fa8d2e9af00cb89455c9fd40907df76c&ipo=images'
  }
];

export const EVENTS: CampusEvent[] = [
  {
    id: 'e6',
    title: 'Inter-Department Cricket Cup',
    description: 'Final match between CSE and Mech departments.',
    locationId: 'sports_ground',
    startTime: '2024-12-15T09:00:00',
    endTime: '2024-12-15T13:00:00',
    category: 'sports'
  },
  {
    id: 'e5',
    title: 'Skill Development Workshop',
    description: 'Hands-on training session at the Skill Campus.',
    locationId: 'skill_campus',
    startTime: '2024-12-10T10:00:00',
    endTime: '2024-12-10T16:00:00',
    category: 'workshop'
  },
  {
    id: 'e4',
    title: 'Rooftop Dinner Specials',
    description: 'Enjoy the mountain breeze at Block B Rooftop.',
    locationId: 'block_b_restaurant',
    startTime: '2024-12-01T18:00:00',
    endTime: '2024-12-01T21:00:00',
    category: 'social'
  }
];

// Updated Graph for Dijkstra reflecting the hostel cluster layout
export const CAMPUS_GRAPH: { [key: string]: { [key: string]: number } } = {
  'block_a': { 'block_b': 200, 'block_c': 150 },
  'block_b': { 'block_a': 200, 'block_c': 180, 'block_b_restaurant': 50 },
  'block_b_restaurant': { 'block_b': 50 },
  'block_c': { 'block_a': 150, 'block_b': 180, 'block_d': 250, 'solar_plant': 1000 },
  'block_d': { 'block_c': 250 },
  'solar_plant': { 'block_c': 1000, 'boys_hostel': 700 },
  'boys_hostel': { 'solar_plant': 700, 'boys_mess': 200, 'skill_campus': 300 },
  'boys_mess': { 'boys_hostel': 200 },
  'skill_campus': { 'boys_hostel': 300, 'sports_ground': 200 },
  'sports_ground': { 'skill_campus': 200 }
};
