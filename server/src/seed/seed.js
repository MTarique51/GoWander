import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Listing from '../models/Listing.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import ProviderApplication from '../models/ProviderApplication.js';
import Favorite from '../models/Favorite.js';
import Notification from '../models/Notification.js';
import AuditLog from '../models/AuditLog.js';

// IMPORTANT: This is a destructive development/demo seed. It clears all GoWander
// collections listed below before inserting the demo dataset. Never run in production.

const ADMIN = {
  name: 'GoWander Admin',
  email: 'admin@gowander.com',
  password: 'Admin@123',
};
const HASH_ROUNDS = 12;

// Stable Unsplash photo URLs. A different travel photo is assigned to each listing.
// These are stored in the existing Listing.images field; no model changes are made.
const LISTING_IMAGE_POOL = [
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1586500036706-41963de24d8b?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1596394516093-15e2f6f5f4c5?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?auto=format&fit=crop&w=1200&q=85',
];

const getRandomListingImage = () =>
  LISTING_IMAGE_POOL[Math.floor(Math.random() * LISTING_IMAGE_POOL.length)];
const DATA = {
  providers: [
    {
      name: 'Aarav Sharma',
      email: 'provider01@gowander.com',
      phone: '+91 9895822412',
      bio: 'Local travel host based in India, creating small-group adventure and cultural experiences across multiple destinations.',
      role: 'provider',
      providerStatus: 'approved',
      password: 'Provider@123',
    },
    {
      name: 'Meera Thakur',
      email: 'provider02@gowander.com',
      phone: '+91 9824942603',
      bio: 'Local travel host based in India, creating small-group culture and cultural experiences across multiple destinations.',
      role: 'provider',
      providerStatus: 'approved',
      password: 'Provider@123',
    },
    {
      name: 'Riya Singh',
      email: 'provider03@gowander.com',
      phone: '+91 9813356886',
      bio: 'Local travel host based in India, creating small-group food and cultural experiences across multiple destinations.',
      role: 'provider',
      providerStatus: 'approved',
      password: 'Provider@123',
    },
    {
      name: 'Kabir Verma',
      email: 'provider04@gowander.com',
      phone: '+91 9846913810',
      bio: 'Local travel host based in India, creating small-group nature and cultural experiences across multiple destinations.',
      role: 'provider',
      providerStatus: 'approved',
      password: 'Provider@123',
    },
    {
      name: 'Ananya Kapoor',
      email: 'provider05@gowander.com',
      phone: '+91 9842868828',
      bio: 'Local travel host based in India, creating small-group sightseeing and cultural experiences across multiple destinations.',
      role: 'provider',
      providerStatus: 'approved',
      password: 'Provider@123',
    },
    {
      name: 'Vivaan Rao',
      email: 'provider06@gowander.com',
      phone: '+91 9839958838',
      bio: 'Local travel host based in India, creating small-group wellness and cultural experiences across multiple destinations.',
      role: 'provider',
      providerStatus: 'approved',
      password: 'Provider@123',
    },
    {
      name: 'Ishita Khan',
      email: 'provider07@gowander.com',
      phone: '+91 9828728463',
      bio: 'Local travel host based in India, creating small-group workshop and cultural experiences across multiple destinations.',
      role: 'provider',
      providerStatus: 'approved',
      password: 'Provider@123',
    },
    {
      name: 'Arjun Patel',
      email: 'provider08@gowander.com',
      phone: '+91 9823756669',
      bio: 'Local travel host based in India, creating small-group adventure and cultural experiences across multiple destinations.',
      role: 'provider',
      providerStatus: 'approved',
      password: 'Provider@123',
    },
    {
      name: 'Sana Joshi',
      email: 'provider09@gowander.com',
      phone: '+91 9883197857',
      bio: 'Local travel host based in India, creating small-group culture and cultural experiences across multiple destinations.',
      role: 'provider',
      providerStatus: 'approved',
      password: 'Provider@123',
    },
    {
      name: 'Dev Das',
      email: 'provider10@gowander.com',
      phone: '+91 9821668732',
      bio: 'Local travel host based in India, creating small-group food and cultural experiences across multiple destinations.',
      role: 'provider',
      providerStatus: 'approved',
      password: 'Provider@123',
    },
    {
      name: 'Aditi Malhotra',
      email: 'provider11@gowander.com',
      phone: '+91 9889254563',
      bio: 'Local travel host based in India, creating small-group nature and cultural experiences across multiple destinations.',
      role: 'provider',
      providerStatus: 'approved',
      password: 'Provider@123',
    },
    {
      name: 'Rehan Mehta',
      email: 'provider12@gowander.com',
      phone: '+91 9866629388',
      bio: 'Local travel host based in India, creating small-group sightseeing and cultural experiences across multiple destinations.',
      role: 'provider',
      providerStatus: 'approved',
      password: 'Provider@123',
    },
    {
      name: 'Kavya Iyer',
      email: 'provider13@gowander.com',
      phone: '+91 9814265799',
      bio: 'Local travel host based in India, creating small-group wellness and cultural experiences across multiple destinations.',
      role: 'provider',
      providerStatus: 'approved',
      password: 'Provider@123',
    },
    {
      name: 'Neel Chopra',
      email: 'provider14@gowander.com',
      phone: '+91 9813999315',
      bio: 'Local travel host based in India, creating small-group workshop and cultural experiences across multiple destinations.',
      role: 'provider',
      providerStatus: 'approved',
      password: 'Provider@123',
    },
    {
      name: 'Zoya Bose',
      email: 'provider15@gowander.com',
      phone: '+91 9822575562',
      bio: 'Local travel host based in India, creating small-group adventure and cultural experiences across multiple destinations.',
      role: 'provider',
      providerStatus: 'approved',
      password: 'Provider@123',
    },
    {
      name: 'Ibrahim Saxena',
      email: 'provider16@gowander.com',
      phone: '+91 9839345092',
      bio: 'Local travel host based in India, creating small-group culture and cultural experiences across multiple destinations.',
      role: 'provider',
      providerStatus: 'approved',
      password: 'Provider@123',
    },
    {
      name: 'Tara Gill',
      email: 'provider17@gowander.com',
      phone: '+91 9841227216',
      bio: 'Local travel host based in India, creating small-group food and cultural experiences across multiple destinations.',
      role: 'provider',
      providerStatus: 'approved',
      password: 'Provider@123',
    },
    {
      name: 'Rohan Nair',
      email: 'provider18@gowander.com',
      phone: '+91 9877827638',
      bio: 'Local travel host based in India, creating small-group nature and cultural experiences across multiple destinations.',
      role: 'provider',
      providerStatus: 'approved',
      password: 'Provider@123',
    },
    {
      name: 'Maya Kulkarni',
      email: 'provider19@gowander.com',
      phone: '+91 9890801586',
      bio: 'Local travel host based in India, creating small-group sightseeing and cultural experiences across multiple destinations.',
      role: 'provider',
      providerStatus: 'approved',
      password: 'Provider@123',
    },
    {
      name: 'Aditya Mishra',
      email: 'provider20@gowander.com',
      phone: '+91 9813561597',
      bio: 'Local travel host based in India, creating small-group wellness and cultural experiences across multiple destinations.',
      role: 'provider',
      providerStatus: 'approved',
      password: 'Provider@123',
    },
    {
      name: 'Nisha Reddy',
      email: 'provider21@gowander.com',
      phone: '+91 9885329037',
      bio: 'Local travel host based in India, creating small-group workshop and cultural experiences across multiple destinations.',
      role: 'provider',
      providerStatus: 'approved',
      password: 'Provider@123',
    },
    {
      name: 'Farhan Sethi',
      email: 'provider22@gowander.com',
      phone: '+91 9836687537',
      bio: 'Local travel host based in India, creating small-group adventure and cultural experiences across multiple destinations.',
      role: 'provider',
      providerStatus: 'approved',
      password: 'Provider@123',
    },
    {
      name: 'Diya Banerjee',
      email: 'provider23@gowander.com',
      phone: '+91 9897226012',
      bio: 'Local travel host based in India, creating small-group culture and cultural experiences across multiple destinations.',
      role: 'provider',
      providerStatus: 'approved',
      password: 'Provider@123',
    },
    {
      name: 'Karan Ali',
      email: 'provider24@gowander.com',
      phone: '+91 9883140807',
      bio: 'Local travel host based in India, creating small-group food and cultural experiences across multiple destinations.',
      role: 'provider',
      providerStatus: 'approved',
      password: 'Provider@123',
    },
  ],
  travelers: [
    {
      name: 'Vivaan Das',
      email: 'traveler001@gowander.com',
      role: 'traveler',
      password: 'Traveler@123',
    },
    {
      name: 'Ishita Malhotra',
      email: 'traveler002@gowander.com',
      role: 'traveler',
      password: 'Traveler@123',
    },
    {
      name: 'Arjun Mehta',
      email: 'traveler003@gowander.com',
      role: 'traveler',
      password: 'Traveler@123',
    },
    {
      name: 'Sana Iyer',
      email: 'traveler004@gowander.com',
      role: 'traveler',
      password: 'Traveler@123',
    },
    {
      name: 'Dev Chopra',
      email: 'traveler005@gowander.com',
      role: 'traveler',
      password: 'Traveler@123',
    },
    {
      name: 'Aditi Bose',
      email: 'traveler006@gowander.com',
      role: 'traveler',
      password: 'Traveler@123',
    },
    {
      name: 'Rehan Saxena',
      email: 'traveler007@gowander.com',
      role: 'traveler',
      password: 'Traveler@123',
    },
    {
      name: 'Kavya Gill',
      email: 'traveler008@gowander.com',
      role: 'traveler',
      password: 'Traveler@123',
    },
    {
      name: 'Neel Nair',
      email: 'traveler009@gowander.com',
      role: 'traveler',
      password: 'Traveler@123',
    },
    {
      name: 'Zoya Kulkarni',
      email: 'traveler010@gowander.com',
      role: 'traveler',
      password: 'Traveler@123',
    },
    {
      name: 'Ibrahim Mishra',
      email: 'traveler011@gowander.com',
      role: 'traveler',
      password: 'Traveler@123',
    },
    {
      name: 'Tara Reddy',
      email: 'traveler012@gowander.com',
      role: 'traveler',
      password: 'Traveler@123',
    },
    {
      name: 'Rohan Sethi',
      email: 'traveler013@gowander.com',
      role: 'traveler',
      password: 'Traveler@123',
    },
    {
      name: 'Maya Banerjee',
      email: 'traveler014@gowander.com',
      role: 'traveler',
      password: 'Traveler@123',
    },
    {
      name: 'Aditya Ali',
      email: 'traveler015@gowander.com',
      role: 'traveler',
      password: 'Traveler@123',
    },
    {
      name: 'Nisha Sharma',
      email: 'traveler016@gowander.com',
      role: 'traveler',
      password: 'Traveler@123',
    },
    {
      name: 'Farhan Thakur',
      email: 'traveler017@gowander.com',
      role: 'traveler',
      password: 'Traveler@123',
    },
    {
      name: 'Diya Singh',
      email: 'traveler018@gowander.com',
      role: 'traveler',
      password: 'Traveler@123',
    },
    {
      name: 'Karan Verma',
      email: 'traveler019@gowander.com',
      role: 'traveler',
      password: 'Traveler@123',
    },
    {
      name: 'Aarav Kapoor',
      email: 'traveler020@gowander.com',
      role: 'traveler',
      password: 'Traveler@123',
    },
    {
      name: 'Meera Rao',
      email: 'traveler021@gowander.com',
      role: 'traveler',
      password: 'Traveler@123',
    },
    {
      name: 'Riya Khan',
      email: 'traveler022@gowander.com',
      role: 'traveler',
      password: 'Traveler@123',
    },
    {
      name: 'Kabir Patel',
      email: 'traveler023@gowander.com',
      role: 'traveler',
      password: 'Traveler@123',
    },
    {
      name: 'Ananya Joshi',
      email: 'traveler024@gowander.com',
      role: 'traveler',
      password: 'Traveler@123',
    },
    {
      name: 'Vivaan Das',
      email: 'traveler025@gowander.com',
      role: 'traveler',
      password: 'Traveler@123',
    },
    {
      name: 'Ishita Malhotra',
      email: 'traveler026@gowander.com',
      role: 'traveler',
      password: 'Traveler@123',
    },
    {
      name: 'Arjun Mehta',
      email: 'traveler027@gowander.com',
      role: 'traveler',
      password: 'Traveler@123',
    },
    {
      name: 'Sana Iyer',
      email: 'traveler028@gowander.com',
      role: 'traveler',
      password: 'Traveler@123',
    },
    {
      name: 'Dev Chopra',
      email: 'traveler029@gowander.com',
      role: 'traveler',
      password: 'Traveler@123',
    },
    {
      name: 'Aditi Bose',
      email: 'traveler030@gowander.com',
      role: 'traveler',
      password: 'Traveler@123',
    },
  ],
  listings: [
    {
      providerEmail: 'provider01@gowander.com',
      title: 'Manali Guided Mountain Trail #001',
      category: 'adventure',
      description:
        'Enjoy a carefully planned adventure experience in Manali, Himachal Pradesh. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned adventure experience in Manali, Himachal Pradesh. Discover local highlights with an experienced host, explore memorable places, and en',
      location: {
        city: 'Manali',
        state: 'Himachal Pradesh',
        country: 'India',
        address: 'Central Manali',
        geo: { type: 'Point', coordinates: [77.184676, 32.237568] },
      },
      price: 1499,
      currency: 'INR',
      durationHours: 1.5,
      maxGuests: 6,
      status: 'published',
    },
    {
      providerEmail: 'provider02@gowander.com',
      title: 'Jaisalmer Old Town Heritage Walk #002',
      category: 'culture',
      description:
        'Enjoy a carefully planned culture experience in Jaisalmer, Rajasthan. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned culture experience in Jaisalmer, Rajasthan. Discover local highlights with an experienced host, explore memorable places, and enjoy a ',
      location: {
        city: 'Jaisalmer',
        state: 'Rajasthan',
        country: 'India',
        address: 'Central Jaisalmer',
        geo: { type: 'Point', coordinates: [70.918207, 26.90931] },
      },
      price: 999,
      currency: 'INR',
      durationHours: 4,
      maxGuests: 8,
      status: 'published',
    },
    {
      providerEmail: 'provider03@gowander.com',
      title: 'Mysuru Street Food Trail #003',
      category: 'food',
      description:
        'Enjoy a carefully planned food experience in Mysuru, Karnataka. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned food experience in Mysuru, Karnataka. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-',
      location: {
        city: 'Mysuru',
        state: 'Karnataka',
        country: 'India',
        address: 'Central Mysuru',
        geo: { type: 'Point', coordinates: [76.619511, 12.290997] },
      },
      price: 1799,
      currency: 'INR',
      durationHours: 6,
      maxGuests: 12,
      status: 'published',
    },
    {
      providerEmail: 'provider04@gowander.com',
      title: 'Srinagar Waterfall and Forest Walk #004',
      category: 'nature',
      description:
        'Enjoy a carefully planned nature experience in Srinagar, Jammu and Kashmir. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned nature experience in Srinagar, Jammu and Kashmir. Discover local highlights with an experienced host, explore memorable places, and en',
      location: {
        city: 'Srinagar',
        state: 'Jammu and Kashmir',
        country: 'India',
        address: 'Central Srinagar',
        geo: { type: 'Point', coordinates: [74.785526, 34.065438] },
      },
      price: 2499,
      currency: 'INR',
      durationHours: 2,
      maxGuests: 10,
      status: 'published',
    },
    {
      providerEmail: 'provider05@gowander.com',
      title: 'Dehradun City Highlights Tour #005',
      category: 'sightseeing',
      description:
        'Enjoy a carefully planned sightseeing experience in Dehradun, Uttarakhand. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned sightseeing experience in Dehradun, Uttarakhand. Discover local highlights with an experienced host, explore memorable places, and enj',
      location: {
        city: 'Dehradun',
        state: 'Uttarakhand',
        country: 'India',
        address: 'Central Dehradun',
        geo: { type: 'Point', coordinates: [78.01114, 30.308227] },
      },
      price: 3999,
      currency: 'INR',
      durationHours: 6,
      maxGuests: 12,
      status: 'published',
    },
    {
      providerEmail: 'provider06@gowander.com',
      title: 'Goa Yoga and Mindfulness Session #006',
      category: 'wellness',
      description:
        'Enjoy a carefully planned wellness experience in Goa, Goa. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned wellness experience in Goa, Goa. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group',
      location: {
        city: 'Goa',
        state: 'Goa',
        country: 'India',
        address: 'Central Goa',
        geo: { type: 'Point', coordinates: [73.812414, 15.473682] },
      },
      price: 3999,
      currency: 'INR',
      durationHours: 4,
      maxGuests: 8,
      status: 'published',
    },
    {
      providerEmail: 'provider07@gowander.com',
      title: 'Pune Handicraft Workshop #007',
      category: 'workshop',
      description:
        'Enjoy a carefully planned workshop experience in Pune, Maharashtra. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned workshop experience in Pune, Maharashtra. Discover local highlights with an experienced host, explore memorable places, and enjoy a sm',
      location: {
        city: 'Pune',
        state: 'Maharashtra',
        country: 'India',
        address: 'Central Pune',
        geo: { type: 'Point', coordinates: [73.880961, 18.534613] },
      },
      price: 799,
      currency: 'INR',
      durationHours: 8,
      maxGuests: 8,
      status: 'published',
    },
    {
      providerEmail: 'provider08@gowander.com',
      title: 'Shimla Guided Mountain Trail #008',
      category: 'adventure',
      description:
        'Enjoy a carefully planned adventure experience in Shimla, Himachal Pradesh. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned adventure experience in Shimla, Himachal Pradesh. Discover local highlights with an experienced host, explore memorable places, and en',
      location: {
        city: 'Shimla',
        state: 'Himachal Pradesh',
        country: 'India',
        address: 'Central Shimla',
        geo: { type: 'Point', coordinates: [77.171071, 31.118164] },
      },
      price: 999,
      currency: 'INR',
      durationHours: 6,
      maxGuests: 8,
      status: 'published',
    },
    {
      providerEmail: 'provider09@gowander.com',
      title: 'Varanasi Old Town Heritage Walk #009',
      category: 'culture',
      description:
        'Enjoy a carefully planned culture experience in Varanasi, Uttar Pradesh. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned culture experience in Varanasi, Uttar Pradesh. Discover local highlights with an experienced host, explore memorable places, and enjoy',
      location: {
        city: 'Varanasi',
        state: 'Uttar Pradesh',
        country: 'India',
        address: 'Central Varanasi',
        geo: { type: 'Point', coordinates: [82.959375, 25.308279] },
      },
      price: 3999,
      currency: 'INR',
      durationHours: 2,
      maxGuests: 12,
      status: 'published',
    },
    {
      providerEmail: 'provider10@gowander.com',
      title: 'Darjeeling Street Food Trail #010',
      category: 'food',
      description:
        'Enjoy a carefully planned food experience in Darjeeling, West Bengal. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned food experience in Darjeeling, West Bengal. Discover local highlights with an experienced host, explore memorable places, and enjoy a ',
      location: {
        city: 'Darjeeling',
        state: 'West Bengal',
        country: 'India',
        address: 'Central Darjeeling',
        geo: { type: 'Point', coordinates: [88.273049, 27.042366] },
      },
      price: 1299,
      currency: 'INR',
      durationHours: 3,
      maxGuests: 10,
      status: 'published',
    },
    {
      providerEmail: 'provider11@gowander.com',
      title: 'Puducherry Waterfall and Forest Walk #011',
      category: 'nature',
      description:
        'Enjoy a carefully planned nature experience in Puducherry, Puducherry. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned nature experience in Puducherry, Puducherry. Discover local highlights with an experienced host, explore memorable places, and enjoy a',
      location: {
        city: 'Puducherry',
        state: 'Puducherry',
        country: 'India',
        address: 'Central Puducherry',
        geo: { type: 'Point', coordinates: [79.802273, 11.961181] },
      },
      price: 3999,
      currency: 'INR',
      durationHours: 4,
      maxGuests: 8,
      status: 'published',
    },
    {
      providerEmail: 'provider12@gowander.com',
      title: 'Udaipur City Highlights Tour #012',
      category: 'sightseeing',
      description:
        'Enjoy a carefully planned sightseeing experience in Udaipur, Rajasthan. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned sightseeing experience in Udaipur, Rajasthan. Discover local highlights with an experienced host, explore memorable places, and enjoy ',
      location: {
        city: 'Udaipur',
        state: 'Rajasthan',
        country: 'India',
        address: 'Central Udaipur',
        geo: { type: 'Point', coordinates: [73.729643, 24.59644] },
      },
      price: 1299,
      currency: 'INR',
      durationHours: 1.5,
      maxGuests: 8,
      status: 'published',
    },
    {
      providerEmail: 'provider13@gowander.com',
      title: 'Kochi Yoga and Mindfulness Session #013',
      category: 'wellness',
      description:
        'Enjoy a carefully planned wellness experience in Kochi, Kerala. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned wellness experience in Kochi, Kerala. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-',
      location: {
        city: 'Kochi',
        state: 'Kerala',
        country: 'India',
        address: 'Central Kochi',
        geo: { type: 'Point', coordinates: [76.262358, 9.913848] },
      },
      price: 3499,
      currency: 'INR',
      durationHours: 6,
      maxGuests: 6,
      status: 'published',
    },
    {
      providerEmail: 'provider14@gowander.com',
      title: 'Amritsar Handicraft Workshop #014',
      category: 'workshop',
      description:
        'Enjoy a carefully planned workshop experience in Amritsar, Punjab. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned workshop experience in Amritsar, Punjab. Discover local highlights with an experienced host, explore memorable places, and enjoy a sma',
      location: {
        city: 'Amritsar',
        state: 'Punjab',
        country: 'India',
        address: 'Central Amritsar',
        geo: { type: 'Point', coordinates: [74.880072, 31.629825] },
      },
      price: 3999,
      currency: 'INR',
      durationHours: 12,
      maxGuests: 6,
      status: 'published',
    },
    {
      providerEmail: 'provider15@gowander.com',
      title: 'Rishikesh Guided Mountain Trail #015',
      category: 'adventure',
      description:
        'Enjoy a carefully planned adventure experience in Rishikesh, Uttarakhand. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned adventure experience in Rishikesh, Uttarakhand. Discover local highlights with an experienced host, explore memorable places, and enjo',
      location: {
        city: 'Rishikesh',
        state: 'Uttarakhand',
        country: 'India',
        address: 'Central Rishikesh',
        geo: { type: 'Point', coordinates: [78.255844, 30.076765] },
      },
      price: 2999,
      currency: 'INR',
      durationHours: 5,
      maxGuests: 12,
      status: 'published',
    },
    {
      providerEmail: 'provider16@gowander.com',
      title: 'New Delhi Old Town Heritage Walk #016',
      category: 'culture',
      description:
        'Enjoy a carefully planned culture experience in New Delhi, Delhi. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned culture experience in New Delhi, Delhi. Discover local highlights with an experienced host, explore memorable places, and enjoy a smal',
      location: {
        city: 'New Delhi',
        state: 'Delhi',
        country: 'India',
        address: 'Central New Delhi',
        geo: { type: 'Point', coordinates: [77.205422, 28.617241] },
      },
      price: 1799,
      currency: 'INR',
      durationHours: 4,
      maxGuests: 6,
      status: 'published',
    },
    {
      providerEmail: 'provider17@gowander.com',
      title: 'Gangtok Street Food Trail #017',
      category: 'food',
      description:
        'Enjoy a carefully planned food experience in Gangtok, Sikkim. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned food experience in Gangtok, Sikkim. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-gr',
      location: {
        city: 'Gangtok',
        state: 'Sikkim',
        country: 'India',
        address: 'Central Gangtok',
        geo: { type: 'Point', coordinates: [88.606976, 27.322536] },
      },
      price: 599,
      currency: 'INR',
      durationHours: 2,
      maxGuests: 6,
      status: 'published',
    },
    {
      providerEmail: 'provider18@gowander.com',
      title: 'Manali Waterfall and Forest Walk #018',
      category: 'nature',
      description:
        'Enjoy a carefully planned nature experience in Manali, Himachal Pradesh. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned nature experience in Manali, Himachal Pradesh. Discover local highlights with an experienced host, explore memorable places, and enjoy',
      location: {
        city: 'Manali',
        state: 'Himachal Pradesh',
        country: 'India',
        address: 'Central Manali',
        geo: { type: 'Point', coordinates: [77.195072, 32.251283] },
      },
      price: 2199,
      currency: 'INR',
      durationHours: 2,
      maxGuests: 10,
      status: 'published',
    },
    {
      providerEmail: 'provider19@gowander.com',
      title: 'Varanasi City Highlights Tour #019',
      category: 'sightseeing',
      description:
        'Enjoy a carefully planned sightseeing experience in Varanasi, Uttar Pradesh. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned sightseeing experience in Varanasi, Uttar Pradesh. Discover local highlights with an experienced host, explore memorable places, and e',
      location: {
        city: 'Varanasi',
        state: 'Uttar Pradesh',
        country: 'India',
        address: 'Central Varanasi',
        geo: { type: 'Point', coordinates: [82.967981, 25.337445] },
      },
      price: 2999,
      currency: 'INR',
      durationHours: 5,
      maxGuests: 12,
      status: 'published',
    },
    {
      providerEmail: 'provider20@gowander.com',
      title: 'Bengaluru Yoga and Mindfulness Session #020',
      category: 'wellness',
      description:
        'Enjoy a carefully planned wellness experience in Bengaluru, Karnataka. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned wellness experience in Bengaluru, Karnataka. Discover local highlights with an experienced host, explore memorable places, and enjoy a',
      location: {
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        address: 'Central Bengaluru',
        geo: { type: 'Point', coordinates: [77.612639, 12.952059] },
      },
      price: 4999,
      currency: 'INR',
      durationHours: 2,
      maxGuests: 12,
      status: 'published',
    },
    {
      providerEmail: 'provider21@gowander.com',
      title: 'Leh Handicraft Workshop #021',
      category: 'workshop',
      description:
        'Enjoy a carefully planned workshop experience in Leh, Ladakh. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned workshop experience in Leh, Ladakh. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-gr',
      location: {
        city: 'Leh',
        state: 'Ladakh',
        country: 'India',
        address: 'Central Leh',
        geo: { type: 'Point', coordinates: [77.589644, 34.163344] },
      },
      price: 1799,
      currency: 'INR',
      durationHours: 2,
      maxGuests: 8,
      status: 'published',
    },
    {
      providerEmail: 'provider22@gowander.com',
      title: 'Jaipur Guided Mountain Trail #022',
      category: 'adventure',
      description:
        'Enjoy a carefully planned adventure experience in Jaipur, Rajasthan. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned adventure experience in Jaipur, Rajasthan. Discover local highlights with an experienced host, explore memorable places, and enjoy a s',
      location: {
        city: 'Jaipur',
        state: 'Rajasthan',
        country: 'India',
        address: 'Central Jaipur',
        geo: { type: 'Point', coordinates: [75.784038, 26.910549] },
      },
      price: 4999,
      currency: 'INR',
      durationHours: 5,
      maxGuests: 12,
      status: 'published',
    },
    {
      providerEmail: 'provider23@gowander.com',
      title: 'Munnar Old Town Heritage Walk #023',
      category: 'culture',
      description:
        'Enjoy a carefully planned culture experience in Munnar, Kerala. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned culture experience in Munnar, Kerala. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-',
      location: {
        city: 'Munnar',
        state: 'Kerala',
        country: 'India',
        address: 'Central Munnar',
        geo: { type: 'Point', coordinates: [77.072598, 10.089207] },
      },
      price: 799,
      currency: 'INR',
      durationHours: 5,
      maxGuests: 12,
      status: 'published',
    },
    {
      providerEmail: 'provider24@gowander.com',
      title: 'Mumbai Street Food Trail #024',
      category: 'food',
      description:
        'Enjoy a carefully planned food experience in Mumbai, Maharashtra. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned food experience in Mumbai, Maharashtra. Discover local highlights with an experienced host, explore memorable places, and enjoy a smal',
      location: {
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        address: 'Central Mumbai',
        geo: { type: 'Point', coordinates: [72.883149, 19.062114] },
      },
      price: 999,
      currency: 'INR',
      durationHours: 1.5,
      maxGuests: 12,
      status: 'published',
    },
    {
      providerEmail: 'provider01@gowander.com',
      title: 'Dharamshala Birdwatching Morning #025',
      category: 'nature',
      description:
        'Enjoy a carefully planned nature experience in Dharamshala, Himachal Pradesh. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned nature experience in Dharamshala, Himachal Pradesh. Discover local highlights with an experienced host, explore memorable places, and ',
      location: {
        city: 'Dharamshala',
        state: 'Himachal Pradesh',
        country: 'India',
        address: 'Central Dharamshala',
        geo: { type: 'Point', coordinates: [76.314608, 32.199779] },
      },
      price: 1799,
      currency: 'INR',
      durationHours: 5,
      maxGuests: 6,
      status: 'published',
    },
    {
      providerEmail: 'provider02@gowander.com',
      title: 'Agra Photography Walk #026',
      category: 'sightseeing',
      description:
        'Enjoy a carefully planned sightseeing experience in Agra, Uttar Pradesh. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned sightseeing experience in Agra, Uttar Pradesh. Discover local highlights with an experienced host, explore memorable places, and enjoy',
      location: {
        city: 'Agra',
        state: 'Uttar Pradesh',
        country: 'India',
        address: 'Central Agra',
        geo: { type: 'Point', coordinates: [77.985996, 27.19182] },
      },
      price: 799,
      currency: 'INR',
      durationHours: 2,
      maxGuests: 10,
      status: 'published',
    },
    {
      providerEmail: 'provider03@gowander.com',
      title: 'Darjeeling Wellness Retreat Day #027',
      category: 'wellness',
      description:
        'Enjoy a carefully planned wellness experience in Darjeeling, West Bengal. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned wellness experience in Darjeeling, West Bengal. Discover local highlights with an experienced host, explore memorable places, and enjo',
      location: {
        city: 'Darjeeling',
        state: 'West Bengal',
        country: 'India',
        address: 'Central Darjeeling',
        geo: { type: 'Point', coordinates: [88.282101, 27.060119] },
      },
      price: 2999,
      currency: 'INR',
      durationHours: 3,
      maxGuests: 6,
      status: 'published',
    },
    {
      providerEmail: 'provider04@gowander.com',
      title: 'Manali Local Art Experience #028',
      category: 'workshop',
      description:
        'Enjoy a carefully planned workshop experience in Manali, Himachal Pradesh. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned workshop experience in Manali, Himachal Pradesh. Discover local highlights with an experienced host, explore memorable places, and enj',
      location: {
        city: 'Manali',
        state: 'Himachal Pradesh',
        country: 'India',
        address: 'Central Manali',
        geo: { type: 'Point', coordinates: [77.196688, 32.257474] },
      },
      price: 999,
      currency: 'INR',
      durationHours: 5,
      maxGuests: 12,
      status: 'published',
    },
    {
      providerEmail: 'provider05@gowander.com',
      title: 'Jaisalmer Sunrise Trek #029',
      category: 'adventure',
      description:
        'Enjoy a carefully planned adventure experience in Jaisalmer, Rajasthan. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned adventure experience in Jaisalmer, Rajasthan. Discover local highlights with an experienced host, explore memorable places, and enjoy ',
      location: {
        city: 'Jaisalmer',
        state: 'Rajasthan',
        country: 'India',
        address: 'Central Jaisalmer',
        geo: { type: 'Point', coordinates: [70.926922, 26.912626] },
      },
      price: 1299,
      currency: 'INR',
      durationHours: 4,
      maxGuests: 8,
      status: 'published',
    },
    {
      providerEmail: 'provider06@gowander.com',
      title: 'Mysuru Local Culture Discovery #030',
      category: 'culture',
      description:
        'Enjoy a carefully planned culture experience in Mysuru, Karnataka. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned culture experience in Mysuru, Karnataka. Discover local highlights with an experienced host, explore memorable places, and enjoy a sma',
      location: {
        city: 'Mysuru',
        state: 'Karnataka',
        country: 'India',
        address: 'Central Mysuru',
        geo: { type: 'Point', coordinates: [76.63435, 12.302667] },
      },
      price: 1799,
      currency: 'INR',
      durationHours: 12,
      maxGuests: 12,
      status: 'published',
    },
    {
      providerEmail: 'provider07@gowander.com',
      title: 'Srinagar Traditional Cooking Experience #031',
      category: 'food',
      description:
        'Enjoy a carefully planned food experience in Srinagar, Jammu and Kashmir. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned food experience in Srinagar, Jammu and Kashmir. Discover local highlights with an experienced host, explore memorable places, and enjo',
      location: {
        city: 'Srinagar',
        state: 'Jammu and Kashmir',
        country: 'India',
        address: 'Central Srinagar',
        geo: { type: 'Point', coordinates: [74.794874, 34.073616] },
      },
      price: 799,
      currency: 'INR',
      durationHours: 6,
      maxGuests: 4,
      status: 'published',
    },
    {
      providerEmail: 'provider08@gowander.com',
      title: 'Dehradun Birdwatching Morning #032',
      category: 'nature',
      description:
        'Enjoy a carefully planned nature experience in Dehradun, Uttarakhand. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned nature experience in Dehradun, Uttarakhand. Discover local highlights with an experienced host, explore memorable places, and enjoy a ',
      location: {
        city: 'Dehradun',
        state: 'Uttarakhand',
        country: 'India',
        address: 'Central Dehradun',
        geo: { type: 'Point', coordinates: [78.036615, 30.305705] },
      },
      price: 1299,
      currency: 'INR',
      durationHours: 1.5,
      maxGuests: 4,
      status: 'published',
    },
    {
      providerEmail: 'provider09@gowander.com',
      title: 'Goa Photography Walk #033',
      category: 'sightseeing',
      description:
        'Enjoy a carefully planned sightseeing experience in Goa, Goa. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned sightseeing experience in Goa, Goa. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-gr',
      location: {
        city: 'Goa',
        state: 'Goa',
        country: 'India',
        address: 'Central Goa',
        geo: { type: 'Point', coordinates: [73.838192, 15.473255] },
      },
      price: 799,
      currency: 'INR',
      durationHours: 1.5,
      maxGuests: 8,
      status: 'published',
    },
    {
      providerEmail: 'provider10@gowander.com',
      title: 'Pune Wellness Retreat Day #034',
      category: 'wellness',
      description:
        'Enjoy a carefully planned wellness experience in Pune, Maharashtra. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned wellness experience in Pune, Maharashtra. Discover local highlights with an experienced host, explore memorable places, and enjoy a sm',
      location: {
        city: 'Pune',
        state: 'Maharashtra',
        country: 'India',
        address: 'Central Pune',
        geo: { type: 'Point', coordinates: [73.835243, 18.50992] },
      },
      price: 3999,
      currency: 'INR',
      durationHours: 12,
      maxGuests: 6,
      status: 'published',
    },
    {
      providerEmail: 'provider11@gowander.com',
      title: 'Shimla Local Art Experience #035',
      category: 'workshop',
      description:
        'Enjoy a carefully planned workshop experience in Shimla, Himachal Pradesh. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned workshop experience in Shimla, Himachal Pradesh. Discover local highlights with an experienced host, explore memorable places, and enj',
      location: {
        city: 'Shimla',
        state: 'Himachal Pradesh',
        country: 'India',
        address: 'Central Shimla',
        geo: { type: 'Point', coordinates: [77.175362, 31.113734] },
      },
      price: 3499,
      currency: 'INR',
      durationHours: 12,
      maxGuests: 6,
      status: 'published',
    },
    {
      providerEmail: 'provider12@gowander.com',
      title: 'Varanasi Sunrise Trek #036',
      category: 'adventure',
      description:
        'Enjoy a carefully planned adventure experience in Varanasi, Uttar Pradesh. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned adventure experience in Varanasi, Uttar Pradesh. Discover local highlights with an experienced host, explore memorable places, and enj',
      location: {
        city: 'Varanasi',
        state: 'Uttar Pradesh',
        country: 'India',
        address: 'Central Varanasi',
        geo: { type: 'Point', coordinates: [82.988131, 25.3299] },
      },
      price: 1299,
      currency: 'INR',
      durationHours: 2,
      maxGuests: 4,
      status: 'published',
    },
    {
      providerEmail: 'provider13@gowander.com',
      title: 'Darjeeling Local Culture Discovery #037',
      category: 'culture',
      description:
        'Enjoy a carefully planned culture experience in Darjeeling, West Bengal. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned culture experience in Darjeeling, West Bengal. Discover local highlights with an experienced host, explore memorable places, and enjoy',
      location: {
        city: 'Darjeeling',
        state: 'West Bengal',
        country: 'India',
        address: 'Central Darjeeling',
        geo: { type: 'Point', coordinates: [88.274249, 27.035172] },
      },
      price: 2199,
      currency: 'INR',
      durationHours: 12,
      maxGuests: 4,
      status: 'published',
    },
    {
      providerEmail: 'provider14@gowander.com',
      title: 'Puducherry Traditional Cooking Experience #038',
      category: 'food',
      description:
        'Enjoy a carefully planned food experience in Puducherry, Puducherry. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned food experience in Puducherry, Puducherry. Discover local highlights with an experienced host, explore memorable places, and enjoy a s',
      location: {
        city: 'Puducherry',
        state: 'Puducherry',
        country: 'India',
        address: 'Central Puducherry',
        geo: { type: 'Point', coordinates: [79.816968, 11.960967] },
      },
      price: 799,
      currency: 'INR',
      durationHours: 1.5,
      maxGuests: 10,
      status: 'published',
    },
    {
      providerEmail: 'provider15@gowander.com',
      title: 'Udaipur Birdwatching Morning #039',
      category: 'nature',
      description:
        'Enjoy a carefully planned nature experience in Udaipur, Rajasthan. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned nature experience in Udaipur, Rajasthan. Discover local highlights with an experienced host, explore memorable places, and enjoy a sma',
      location: {
        city: 'Udaipur',
        state: 'Rajasthan',
        country: 'India',
        address: 'Central Udaipur',
        geo: { type: 'Point', coordinates: [73.723911, 24.597424] },
      },
      price: 799,
      currency: 'INR',
      durationHours: 4,
      maxGuests: 6,
      status: 'published',
    },
    {
      providerEmail: 'provider16@gowander.com',
      title: 'Kochi Photography Walk #040',
      category: 'sightseeing',
      description:
        'Enjoy a carefully planned sightseeing experience in Kochi, Kerala. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned sightseeing experience in Kochi, Kerala. Discover local highlights with an experienced host, explore memorable places, and enjoy a sma',
      location: {
        city: 'Kochi',
        state: 'Kerala',
        country: 'India',
        address: 'Central Kochi',
        geo: { type: 'Point', coordinates: [76.25181, 9.929145] },
      },
      price: 2199,
      currency: 'INR',
      durationHours: 3,
      maxGuests: 8,
      status: 'published',
    },
    {
      providerEmail: 'provider17@gowander.com',
      title: 'Amritsar Wellness Retreat Day #041',
      category: 'wellness',
      description:
        'Enjoy a carefully planned wellness experience in Amritsar, Punjab. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned wellness experience in Amritsar, Punjab. Discover local highlights with an experienced host, explore memorable places, and enjoy a sma',
      location: {
        city: 'Amritsar',
        state: 'Punjab',
        country: 'India',
        address: 'Central Amritsar',
        geo: { type: 'Point', coordinates: [74.870431, 31.648979] },
      },
      price: 799,
      currency: 'INR',
      durationHours: 12,
      maxGuests: 12,
      status: 'published',
    },
    {
      providerEmail: 'provider18@gowander.com',
      title: 'Rishikesh Local Art Experience #042',
      category: 'workshop',
      description:
        'Enjoy a carefully planned workshop experience in Rishikesh, Uttarakhand. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned workshop experience in Rishikesh, Uttarakhand. Discover local highlights with an experienced host, explore memorable places, and enjoy',
      location: {
        city: 'Rishikesh',
        state: 'Uttarakhand',
        country: 'India',
        address: 'Central Rishikesh',
        geo: { type: 'Point', coordinates: [78.247495, 30.092986] },
      },
      price: 2999,
      currency: 'INR',
      durationHours: 1.5,
      maxGuests: 4,
      status: 'published',
    },
    {
      providerEmail: 'provider19@gowander.com',
      title: 'New Delhi Sunrise Trek #043',
      category: 'adventure',
      description:
        'Enjoy a carefully planned adventure experience in New Delhi, Delhi. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned adventure experience in New Delhi, Delhi. Discover local highlights with an experienced host, explore memorable places, and enjoy a sm',
      location: {
        city: 'New Delhi',
        state: 'Delhi',
        country: 'India',
        address: 'Central New Delhi',
        geo: { type: 'Point', coordinates: [77.230318, 28.627848] },
      },
      price: 999,
      currency: 'INR',
      durationHours: 8,
      maxGuests: 10,
      status: 'published',
    },
    {
      providerEmail: 'provider20@gowander.com',
      title: 'Gangtok Local Culture Discovery #044',
      category: 'culture',
      description:
        'Enjoy a carefully planned culture experience in Gangtok, Sikkim. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned culture experience in Gangtok, Sikkim. Discover local highlights with an experienced host, explore memorable places, and enjoy a small',
      location: {
        city: 'Gangtok',
        state: 'Sikkim',
        country: 'India',
        address: 'Central Gangtok',
        geo: { type: 'Point', coordinates: [88.605568, 27.353486] },
      },
      price: 599,
      currency: 'INR',
      durationHours: 3,
      maxGuests: 10,
      status: 'published',
    },
    {
      providerEmail: 'provider21@gowander.com',
      title: 'Manali Traditional Cooking Experience #045',
      category: 'food',
      description:
        'Enjoy a carefully planned food experience in Manali, Himachal Pradesh. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned food experience in Manali, Himachal Pradesh. Discover local highlights with an experienced host, explore memorable places, and enjoy a',
      location: {
        city: 'Manali',
        state: 'Himachal Pradesh',
        country: 'India',
        address: 'Central Manali',
        geo: { type: 'Point', coordinates: [77.163808, 32.235217] },
      },
      price: 2499,
      currency: 'INR',
      durationHours: 5,
      maxGuests: 10,
      status: 'published',
    },
    {
      providerEmail: 'provider22@gowander.com',
      title: 'Varanasi Birdwatching Morning #046',
      category: 'nature',
      description:
        'Enjoy a carefully planned nature experience in Varanasi, Uttar Pradesh. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned nature experience in Varanasi, Uttar Pradesh. Discover local highlights with an experienced host, explore memorable places, and enjoy ',
      location: {
        city: 'Varanasi',
        state: 'Uttar Pradesh',
        country: 'India',
        address: 'Central Varanasi',
        geo: { type: 'Point', coordinates: [82.98373, 25.32682] },
      },
      price: 2999,
      currency: 'INR',
      durationHours: 12,
      maxGuests: 6,
      status: 'published',
    },
    {
      providerEmail: 'provider23@gowander.com',
      title: 'Bengaluru Photography Walk #047',
      category: 'sightseeing',
      description:
        'Enjoy a carefully planned sightseeing experience in Bengaluru, Karnataka. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned sightseeing experience in Bengaluru, Karnataka. Discover local highlights with an experienced host, explore memorable places, and enjo',
      location: {
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        address: 'Central Bengaluru',
        geo: { type: 'Point', coordinates: [77.579095, 12.960308] },
      },
      price: 599,
      currency: 'INR',
      durationHours: 1.5,
      maxGuests: 8,
      status: 'published',
    },
    {
      providerEmail: 'provider24@gowander.com',
      title: 'Leh Wellness Retreat Day #048',
      category: 'wellness',
      description:
        'Enjoy a carefully planned wellness experience in Leh, Ladakh. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned wellness experience in Leh, Ladakh. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-gr',
      location: {
        city: 'Leh',
        state: 'Ladakh',
        country: 'India',
        address: 'Central Leh',
        geo: { type: 'Point', coordinates: [77.554958, 34.155967] },
      },
      price: 2999,
      currency: 'INR',
      durationHours: 3,
      maxGuests: 4,
      status: 'published',
    },
    {
      providerEmail: 'provider01@gowander.com',
      title: 'Jaipur Traditional Craft Class #049',
      category: 'workshop',
      description:
        'Enjoy a carefully planned workshop experience in Jaipur, Rajasthan. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned workshop experience in Jaipur, Rajasthan. Discover local highlights with an experienced host, explore memorable places, and enjoy a sm',
      location: {
        city: 'Jaipur',
        state: 'Rajasthan',
        country: 'India',
        address: 'Central Jaipur',
        geo: { type: 'Point', coordinates: [75.810339, 26.895604] },
      },
      price: 999,
      currency: 'INR',
      durationHours: 2,
      maxGuests: 12,
      status: 'published',
    },
    {
      providerEmail: 'provider02@gowander.com',
      title: 'Munnar River Adventure #050',
      category: 'adventure',
      description:
        'Enjoy a carefully planned adventure experience in Munnar, Kerala. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned adventure experience in Munnar, Kerala. Discover local highlights with an experienced host, explore memorable places, and enjoy a smal',
      location: {
        city: 'Munnar',
        state: 'Kerala',
        country: 'India',
        address: 'Central Munnar',
        geo: { type: 'Point', coordinates: [77.037898, 10.103373] },
      },
      price: 2199,
      currency: 'INR',
      durationHours: 2,
      maxGuests: 12,
      status: 'published',
    },
    {
      providerEmail: 'provider03@gowander.com',
      title: 'Mumbai Historic Landmarks Tour #051',
      category: 'culture',
      description:
        'Enjoy a carefully planned culture experience in Mumbai, Maharashtra. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned culture experience in Mumbai, Maharashtra. Discover local highlights with an experienced host, explore memorable places, and enjoy a s',
      location: {
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        address: 'Central Mumbai',
        geo: { type: 'Point', coordinates: [72.865011, 19.079781] },
      },
      price: 3499,
      currency: 'INR',
      durationHours: 2,
      maxGuests: 10,
      status: 'published',
    },
    {
      providerEmail: 'provider04@gowander.com',
      title: 'Dharamshala Local Flavours Walk #052',
      category: 'food',
      description:
        'Enjoy a carefully planned food experience in Dharamshala, Himachal Pradesh. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned food experience in Dharamshala, Himachal Pradesh. Discover local highlights with an experienced host, explore memorable places, and en',
      location: {
        city: 'Dharamshala',
        state: 'Himachal Pradesh',
        country: 'India',
        address: 'Central Dharamshala',
        geo: { type: 'Point', coordinates: [76.331269, 32.221609] },
      },
      price: 1799,
      currency: 'INR',
      durationHours: 5,
      maxGuests: 6,
      status: 'published',
    },
    {
      providerEmail: 'provider05@gowander.com',
      title: 'Agra Nature Escape #053',
      category: 'nature',
      description:
        'Enjoy a carefully planned nature experience in Agra, Uttar Pradesh. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned nature experience in Agra, Uttar Pradesh. Discover local highlights with an experienced host, explore memorable places, and enjoy a sm',
      location: {
        city: 'Agra',
        state: 'Uttar Pradesh',
        country: 'India',
        address: 'Central Agra',
        geo: { type: 'Point', coordinates: [78.016586, 27.169267] },
      },
      price: 1499,
      currency: 'INR',
      durationHours: 8,
      maxGuests: 6,
      status: 'published',
    },
    {
      providerEmail: 'provider06@gowander.com',
      title: 'Darjeeling Landmarks and Viewpoints #054',
      category: 'sightseeing',
      description:
        'Enjoy a carefully planned sightseeing experience in Darjeeling, West Bengal. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned sightseeing experience in Darjeeling, West Bengal. Discover local highlights with an experienced host, explore memorable places, and e',
      location: {
        city: 'Darjeeling',
        state: 'West Bengal',
        country: 'India',
        address: 'Central Darjeeling',
        geo: { type: 'Point', coordinates: [88.274885, 27.033] },
      },
      price: 1799,
      currency: 'INR',
      durationHours: 2,
      maxGuests: 4,
      status: 'published',
    },
    {
      providerEmail: 'provider07@gowander.com',
      title: 'Manali Sunrise Meditation #055',
      category: 'wellness',
      description:
        'Enjoy a carefully planned wellness experience in Manali, Himachal Pradesh. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned wellness experience in Manali, Himachal Pradesh. Discover local highlights with an experienced host, explore memorable places, and enj',
      location: {
        city: 'Manali',
        state: 'Himachal Pradesh',
        country: 'India',
        address: 'Central Manali',
        geo: { type: 'Point', coordinates: [77.186614, 32.259538] },
      },
      price: 799,
      currency: 'INR',
      durationHours: 2,
      maxGuests: 12,
      status: 'published',
    },
    {
      providerEmail: 'provider08@gowander.com',
      title: 'Jaisalmer Traditional Craft Class #056',
      category: 'workshop',
      description:
        'Enjoy a carefully planned workshop experience in Jaisalmer, Rajasthan. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned workshop experience in Jaisalmer, Rajasthan. Discover local highlights with an experienced host, explore memorable places, and enjoy a',
      location: {
        city: 'Jaisalmer',
        state: 'Rajasthan',
        country: 'India',
        address: 'Central Jaisalmer',
        geo: { type: 'Point', coordinates: [70.893958, 26.906308] },
      },
      price: 1799,
      currency: 'INR',
      durationHours: 2,
      maxGuests: 6,
      status: 'published',
    },
    {
      providerEmail: 'provider09@gowander.com',
      title: 'Mysuru River Adventure #057',
      category: 'adventure',
      description:
        'Enjoy a carefully planned adventure experience in Mysuru, Karnataka. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned adventure experience in Mysuru, Karnataka. Discover local highlights with an experienced host, explore memorable places, and enjoy a s',
      location: {
        city: 'Mysuru',
        state: 'Karnataka',
        country: 'India',
        address: 'Central Mysuru',
        geo: { type: 'Point', coordinates: [76.632876, 12.28211] },
      },
      price: 2999,
      currency: 'INR',
      durationHours: 5,
      maxGuests: 12,
      status: 'published',
    },
    {
      providerEmail: 'provider10@gowander.com',
      title: 'Srinagar Historic Landmarks Tour #058',
      category: 'culture',
      description:
        'Enjoy a carefully planned culture experience in Srinagar, Jammu and Kashmir. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned culture experience in Srinagar, Jammu and Kashmir. Discover local highlights with an experienced host, explore memorable places, and e',
      location: {
        city: 'Srinagar',
        state: 'Jammu and Kashmir',
        country: 'India',
        address: 'Central Srinagar',
        geo: { type: 'Point', coordinates: [74.821493, 34.095984] },
      },
      price: 2999,
      currency: 'INR',
      durationHours: 1.5,
      maxGuests: 12,
      status: 'published',
    },
    {
      providerEmail: 'provider11@gowander.com',
      title: 'Dehradun Local Flavours Walk #059',
      category: 'food',
      description:
        'Enjoy a carefully planned food experience in Dehradun, Uttarakhand. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned food experience in Dehradun, Uttarakhand. Discover local highlights with an experienced host, explore memorable places, and enjoy a sm',
      location: {
        city: 'Dehradun',
        state: 'Uttarakhand',
        country: 'India',
        address: 'Central Dehradun',
        geo: { type: 'Point', coordinates: [78.022169, 30.323036] },
      },
      price: 999,
      currency: 'INR',
      durationHours: 5,
      maxGuests: 4,
      status: 'published',
    },
    {
      providerEmail: 'provider12@gowander.com',
      title: 'Goa Nature Escape #060',
      category: 'nature',
      description:
        'Enjoy a carefully planned nature experience in Goa, Goa. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned nature experience in Goa, Goa. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group i',
      location: {
        city: 'Goa',
        state: 'Goa',
        country: 'India',
        address: 'Central Goa',
        geo: { type: 'Point', coordinates: [73.847286, 15.500597] },
      },
      price: 999,
      currency: 'INR',
      durationHours: 5,
      maxGuests: 8,
      status: 'published',
    },
    {
      providerEmail: 'provider13@gowander.com',
      title: 'Pune Landmarks and Viewpoints #061',
      category: 'sightseeing',
      description:
        'Enjoy a carefully planned sightseeing experience in Pune, Maharashtra. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned sightseeing experience in Pune, Maharashtra. Discover local highlights with an experienced host, explore memorable places, and enjoy a',
      location: {
        city: 'Pune',
        state: 'Maharashtra',
        country: 'India',
        address: 'Central Pune',
        geo: { type: 'Point', coordinates: [73.861941, 18.529104] },
      },
      price: 1299,
      currency: 'INR',
      durationHours: 5,
      maxGuests: 12,
      status: 'published',
    },
    {
      providerEmail: 'provider14@gowander.com',
      title: 'Shimla Sunrise Meditation #062',
      category: 'wellness',
      description:
        'Enjoy a carefully planned wellness experience in Shimla, Himachal Pradesh. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned wellness experience in Shimla, Himachal Pradesh. Discover local highlights with an experienced host, explore memorable places, and enj',
      location: {
        city: 'Shimla',
        state: 'Himachal Pradesh',
        country: 'India',
        address: 'Central Shimla',
        geo: { type: 'Point', coordinates: [77.172827, 31.121013] },
      },
      price: 599,
      currency: 'INR',
      durationHours: 2,
      maxGuests: 10,
      status: 'published',
    },
    {
      providerEmail: 'provider15@gowander.com',
      title: 'Varanasi Traditional Craft Class #063',
      category: 'workshop',
      description:
        'Enjoy a carefully planned workshop experience in Varanasi, Uttar Pradesh. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned workshop experience in Varanasi, Uttar Pradesh. Discover local highlights with an experienced host, explore memorable places, and enjo',
      location: {
        city: 'Varanasi',
        state: 'Uttar Pradesh',
        country: 'India',
        address: 'Central Varanasi',
        geo: { type: 'Point', coordinates: [82.990367, 25.299363] },
      },
      price: 1799,
      currency: 'INR',
      durationHours: 3,
      maxGuests: 8,
      status: 'published',
    },
    {
      providerEmail: 'provider16@gowander.com',
      title: 'Darjeeling River Adventure #064',
      category: 'adventure',
      description:
        'Enjoy a carefully planned adventure experience in Darjeeling, West Bengal. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned adventure experience in Darjeeling, West Bengal. Discover local highlights with an experienced host, explore memorable places, and enj',
      location: {
        city: 'Darjeeling',
        state: 'West Bengal',
        country: 'India',
        address: 'Central Darjeeling',
        geo: { type: 'Point', coordinates: [88.249379, 27.038673] },
      },
      price: 4999,
      currency: 'INR',
      durationHours: 8,
      maxGuests: 12,
      status: 'published',
    },
    {
      providerEmail: 'provider17@gowander.com',
      title: 'Puducherry Historic Landmarks Tour #065',
      category: 'culture',
      description:
        'Enjoy a carefully planned culture experience in Puducherry, Puducherry. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned culture experience in Puducherry, Puducherry. Discover local highlights with an experienced host, explore memorable places, and enjoy ',
      location: {
        city: 'Puducherry',
        state: 'Puducherry',
        country: 'India',
        address: 'Central Puducherry',
        geo: { type: 'Point', coordinates: [79.783783, 11.92461] },
      },
      price: 4999,
      currency: 'INR',
      durationHours: 3,
      maxGuests: 12,
      status: 'published',
    },
    {
      providerEmail: 'provider18@gowander.com',
      title: 'Udaipur Local Flavours Walk #066',
      category: 'food',
      description:
        'Enjoy a carefully planned food experience in Udaipur, Rajasthan. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned food experience in Udaipur, Rajasthan. Discover local highlights with an experienced host, explore memorable places, and enjoy a small',
      location: {
        city: 'Udaipur',
        state: 'Rajasthan',
        country: 'India',
        address: 'Central Udaipur',
        geo: { type: 'Point', coordinates: [73.689301, 24.580169] },
      },
      price: 2999,
      currency: 'INR',
      durationHours: 3,
      maxGuests: 10,
      status: 'published',
    },
    {
      providerEmail: 'provider19@gowander.com',
      title: 'Kochi Nature Escape #067',
      category: 'nature',
      description:
        'Enjoy a carefully planned nature experience in Kochi, Kerala. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned nature experience in Kochi, Kerala. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-gr',
      location: {
        city: 'Kochi',
        state: 'Kerala',
        country: 'India',
        address: 'Central Kochi',
        geo: { type: 'Point', coordinates: [76.248672, 9.92353] },
      },
      price: 599,
      currency: 'INR',
      durationHours: 6,
      maxGuests: 6,
      status: 'published',
    },
    {
      providerEmail: 'provider20@gowander.com',
      title: 'Amritsar Landmarks and Viewpoints #068',
      category: 'sightseeing',
      description:
        'Enjoy a carefully planned sightseeing experience in Amritsar, Punjab. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned sightseeing experience in Amritsar, Punjab. Discover local highlights with an experienced host, explore memorable places, and enjoy a ',
      location: {
        city: 'Amritsar',
        state: 'Punjab',
        country: 'India',
        address: 'Central Amritsar',
        geo: { type: 'Point', coordinates: [74.881403, 31.640677] },
      },
      price: 1799,
      currency: 'INR',
      durationHours: 8,
      maxGuests: 12,
      status: 'published',
    },
    {
      providerEmail: 'provider21@gowander.com',
      title: 'Rishikesh Sunrise Meditation #069',
      category: 'wellness',
      description:
        'Enjoy a carefully planned wellness experience in Rishikesh, Uttarakhand. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned wellness experience in Rishikesh, Uttarakhand. Discover local highlights with an experienced host, explore memorable places, and enjoy',
      location: {
        city: 'Rishikesh',
        state: 'Uttarakhand',
        country: 'India',
        address: 'Central Rishikesh',
        geo: { type: 'Point', coordinates: [78.280074, 30.103931] },
      },
      price: 1299,
      currency: 'INR',
      durationHours: 3,
      maxGuests: 6,
      status: 'published',
    },
    {
      providerEmail: 'provider22@gowander.com',
      title: 'New Delhi Traditional Craft Class #070',
      category: 'workshop',
      description:
        'Enjoy a carefully planned workshop experience in New Delhi, Delhi. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned workshop experience in New Delhi, Delhi. Discover local highlights with an experienced host, explore memorable places, and enjoy a sma',
      location: {
        city: 'New Delhi',
        state: 'Delhi',
        country: 'India',
        address: 'Central New Delhi',
        geo: { type: 'Point', coordinates: [77.228071, 28.594891] },
      },
      price: 4999,
      currency: 'INR',
      durationHours: 6,
      maxGuests: 10,
      status: 'published',
    },
    {
      providerEmail: 'provider23@gowander.com',
      title: 'Gangtok River Adventure #071',
      category: 'adventure',
      description:
        'Enjoy a carefully planned adventure experience in Gangtok, Sikkim. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned adventure experience in Gangtok, Sikkim. Discover local highlights with an experienced host, explore memorable places, and enjoy a sma',
      location: {
        city: 'Gangtok',
        state: 'Sikkim',
        country: 'India',
        address: 'Central Gangtok',
        geo: { type: 'Point', coordinates: [88.621612, 27.353463] },
      },
      price: 1299,
      currency: 'INR',
      durationHours: 5,
      maxGuests: 6,
      status: 'published',
    },
    {
      providerEmail: 'provider24@gowander.com',
      title: 'Manali Historic Landmarks Tour #072',
      category: 'culture',
      description:
        'Enjoy a carefully planned culture experience in Manali, Himachal Pradesh. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned culture experience in Manali, Himachal Pradesh. Discover local highlights with an experienced host, explore memorable places, and enjo',
      location: {
        city: 'Manali',
        state: 'Himachal Pradesh',
        country: 'India',
        address: 'Central Manali',
        geo: { type: 'Point', coordinates: [77.203069, 32.223924] },
      },
      price: 599,
      currency: 'INR',
      durationHours: 12,
      maxGuests: 6,
      status: 'published',
    },
    {
      providerEmail: 'provider01@gowander.com',
      title: 'Varanasi Market-to-Table Food Tour #073',
      category: 'food',
      description:
        'Enjoy a carefully planned food experience in Varanasi, Uttar Pradesh. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned food experience in Varanasi, Uttar Pradesh. Discover local highlights with an experienced host, explore memorable places, and enjoy a ',
      location: {
        city: 'Varanasi',
        state: 'Uttar Pradesh',
        country: 'India',
        address: 'Central Varanasi',
        geo: { type: 'Point', coordinates: [82.958879, 25.334338] },
      },
      price: 1799,
      currency: 'INR',
      durationHours: 5,
      maxGuests: 6,
      status: 'published',
    },
    {
      providerEmail: 'provider02@gowander.com',
      title: 'Bengaluru Lakeside Experience #074',
      category: 'nature',
      description:
        'Enjoy a carefully planned nature experience in Bengaluru, Karnataka. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned nature experience in Bengaluru, Karnataka. Discover local highlights with an experienced host, explore memorable places, and enjoy a s',
      location: {
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        address: 'Central Bengaluru',
        geo: { type: 'Point', coordinates: [77.580746, 12.978001] },
      },
      price: 2199,
      currency: 'INR',
      durationHours: 6,
      maxGuests: 8,
      status: 'published',
    },
    {
      providerEmail: 'provider03@gowander.com',
      title: 'Leh Sunset City Tour #075',
      category: 'sightseeing',
      description:
        'Enjoy a carefully planned sightseeing experience in Leh, Ladakh. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned sightseeing experience in Leh, Ladakh. Discover local highlights with an experienced host, explore memorable places, and enjoy a small',
      location: {
        city: 'Leh',
        state: 'Ladakh',
        country: 'India',
        address: 'Central Leh',
        geo: { type: 'Point', coordinates: [77.595318, 34.171276] },
      },
      price: 1499,
      currency: 'INR',
      durationHours: 6,
      maxGuests: 12,
      status: 'published',
    },
    {
      providerEmail: 'provider04@gowander.com',
      title: 'Jaipur Yoga and Mindfulness Session #076',
      category: 'wellness',
      description:
        'Enjoy a carefully planned wellness experience in Jaipur, Rajasthan. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned wellness experience in Jaipur, Rajasthan. Discover local highlights with an experienced host, explore memorable places, and enjoy a sm',
      location: {
        city: 'Jaipur',
        state: 'Rajasthan',
        country: 'India',
        address: 'Central Jaipur',
        geo: { type: 'Point', coordinates: [75.782284, 26.931646] },
      },
      price: 2999,
      currency: 'INR',
      durationHours: 6,
      maxGuests: 4,
      status: 'published',
    },
    {
      providerEmail: 'provider05@gowander.com',
      title: 'Munnar Handicraft Workshop #077',
      category: 'workshop',
      description:
        'Enjoy a carefully planned workshop experience in Munnar, Kerala. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned workshop experience in Munnar, Kerala. Discover local highlights with an experienced host, explore memorable places, and enjoy a small',
      location: {
        city: 'Munnar',
        state: 'Kerala',
        country: 'India',
        address: 'Central Munnar',
        geo: { type: 'Point', coordinates: [77.040267, 10.107716] },
      },
      price: 999,
      currency: 'INR',
      durationHours: 5,
      maxGuests: 4,
      status: 'published',
    },
    {
      providerEmail: 'provider06@gowander.com',
      title: 'Mumbai Outdoor Explorer Day #078',
      category: 'adventure',
      description:
        'Enjoy a carefully planned adventure experience in Mumbai, Maharashtra. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned adventure experience in Mumbai, Maharashtra. Discover local highlights with an experienced host, explore memorable places, and enjoy a',
      location: {
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        address: 'Central Mumbai',
        geo: { type: 'Point', coordinates: [72.85812, 19.073383] },
      },
      price: 4999,
      currency: 'INR',
      durationHours: 6,
      maxGuests: 10,
      status: 'published',
    },
    {
      providerEmail: 'provider07@gowander.com',
      title: 'Dharamshala Artisan Quarter Walk #079',
      category: 'culture',
      description:
        'Enjoy a carefully planned culture experience in Dharamshala, Himachal Pradesh. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned culture experience in Dharamshala, Himachal Pradesh. Discover local highlights with an experienced host, explore memorable places, and',
      location: {
        city: 'Dharamshala',
        state: 'Himachal Pradesh',
        country: 'India',
        address: 'Central Dharamshala',
        geo: { type: 'Point', coordinates: [76.32871, 32.219457] },
      },
      price: 2199,
      currency: 'INR',
      durationHours: 4,
      maxGuests: 8,
      status: 'published',
    },
    {
      providerEmail: 'provider08@gowander.com',
      title: 'Agra Market-to-Table Food Tour #080',
      category: 'food',
      description:
        'Enjoy a carefully planned food experience in Agra, Uttar Pradesh. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned food experience in Agra, Uttar Pradesh. Discover local highlights with an experienced host, explore memorable places, and enjoy a smal',
      location: {
        city: 'Agra',
        state: 'Uttar Pradesh',
        country: 'India',
        address: 'Central Agra',
        geo: { type: 'Point', coordinates: [77.985319, 27.174142] },
      },
      price: 2999,
      currency: 'INR',
      durationHours: 4,
      maxGuests: 8,
      status: 'published',
    },
    {
      providerEmail: 'provider09@gowander.com',
      title: 'Darjeeling Lakeside Experience #081',
      category: 'nature',
      description:
        'Enjoy a carefully planned nature experience in Darjeeling, West Bengal. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned nature experience in Darjeeling, West Bengal. Discover local highlights with an experienced host, explore memorable places, and enjoy ',
      location: {
        city: 'Darjeeling',
        state: 'West Bengal',
        country: 'India',
        address: 'Central Darjeeling',
        geo: { type: 'Point', coordinates: [88.262865, 27.058955] },
      },
      price: 1799,
      currency: 'INR',
      durationHours: 6,
      maxGuests: 4,
      status: 'published',
    },
    {
      providerEmail: 'provider10@gowander.com',
      title: 'Manali Sunset City Tour #082',
      category: 'sightseeing',
      description:
        'Enjoy a carefully planned sightseeing experience in Manali, Himachal Pradesh. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned sightseeing experience in Manali, Himachal Pradesh. Discover local highlights with an experienced host, explore memorable places, and ',
      location: {
        city: 'Manali',
        state: 'Himachal Pradesh',
        country: 'India',
        address: 'Central Manali',
        geo: { type: 'Point', coordinates: [77.199688, 32.231613] },
      },
      price: 1499,
      currency: 'INR',
      durationHours: 8,
      maxGuests: 8,
      status: 'published',
    },
    {
      providerEmail: 'provider11@gowander.com',
      title: 'Jaisalmer Yoga and Mindfulness Session #083',
      category: 'wellness',
      description:
        'Enjoy a carefully planned wellness experience in Jaisalmer, Rajasthan. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned wellness experience in Jaisalmer, Rajasthan. Discover local highlights with an experienced host, explore memorable places, and enjoy a',
      location: {
        city: 'Jaisalmer',
        state: 'Rajasthan',
        country: 'India',
        address: 'Central Jaisalmer',
        geo: { type: 'Point', coordinates: [70.90342, 26.907526] },
      },
      price: 999,
      currency: 'INR',
      durationHours: 4,
      maxGuests: 10,
      status: 'published',
    },
    {
      providerEmail: 'provider12@gowander.com',
      title: 'Mysuru Handicraft Workshop #084',
      category: 'workshop',
      description:
        'Enjoy a carefully planned workshop experience in Mysuru, Karnataka. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned workshop experience in Mysuru, Karnataka. Discover local highlights with an experienced host, explore memorable places, and enjoy a sm',
      location: {
        city: 'Mysuru',
        state: 'Karnataka',
        country: 'India',
        address: 'Central Mysuru',
        geo: { type: 'Point', coordinates: [76.647646, 12.290966] },
      },
      price: 4999,
      currency: 'INR',
      durationHours: 3,
      maxGuests: 12,
      status: 'published',
    },
    {
      providerEmail: 'provider13@gowander.com',
      title: 'Srinagar Outdoor Explorer Day #085',
      category: 'adventure',
      description:
        'Enjoy a carefully planned adventure experience in Srinagar, Jammu and Kashmir. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned adventure experience in Srinagar, Jammu and Kashmir. Discover local highlights with an experienced host, explore memorable places, and',
      location: {
        city: 'Srinagar',
        state: 'Jammu and Kashmir',
        country: 'India',
        address: 'Central Srinagar',
        geo: { type: 'Point', coordinates: [74.800755, 34.079943] },
      },
      price: 599,
      currency: 'INR',
      durationHours: 5,
      maxGuests: 8,
      status: 'published',
    },
    {
      providerEmail: 'provider14@gowander.com',
      title: 'Dehradun Artisan Quarter Walk #086',
      category: 'culture',
      description:
        'Enjoy a carefully planned culture experience in Dehradun, Uttarakhand. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned culture experience in Dehradun, Uttarakhand. Discover local highlights with an experienced host, explore memorable places, and enjoy a',
      location: {
        city: 'Dehradun',
        state: 'Uttarakhand',
        country: 'India',
        address: 'Central Dehradun',
        geo: { type: 'Point', coordinates: [78.017709, 30.32793] },
      },
      price: 3499,
      currency: 'INR',
      durationHours: 6,
      maxGuests: 10,
      status: 'published',
    },
    {
      providerEmail: 'provider15@gowander.com',
      title: 'Goa Market-to-Table Food Tour #087',
      category: 'food',
      description:
        'Enjoy a carefully planned food experience in Goa, Goa. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned food experience in Goa, Goa. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group iti',
      location: {
        city: 'Goa',
        state: 'Goa',
        country: 'India',
        address: 'Central Goa',
        geo: { type: 'Point', coordinates: [73.824889, 15.497925] },
      },
      price: 2999,
      currency: 'INR',
      durationHours: 12,
      maxGuests: 6,
      status: 'published',
    },
    {
      providerEmail: 'provider16@gowander.com',
      title: 'Pune Lakeside Experience #088',
      category: 'nature',
      description:
        'Enjoy a carefully planned nature experience in Pune, Maharashtra. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned nature experience in Pune, Maharashtra. Discover local highlights with an experienced host, explore memorable places, and enjoy a smal',
      location: {
        city: 'Pune',
        state: 'Maharashtra',
        country: 'India',
        address: 'Central Pune',
        geo: { type: 'Point', coordinates: [73.864643, 18.511751] },
      },
      price: 3999,
      currency: 'INR',
      durationHours: 6,
      maxGuests: 4,
      status: 'published',
    },
    {
      providerEmail: 'provider17@gowander.com',
      title: 'Shimla Sunset City Tour #089',
      category: 'sightseeing',
      description:
        'Enjoy a carefully planned sightseeing experience in Shimla, Himachal Pradesh. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned sightseeing experience in Shimla, Himachal Pradesh. Discover local highlights with an experienced host, explore memorable places, and ',
      location: {
        city: 'Shimla',
        state: 'Himachal Pradesh',
        country: 'India',
        address: 'Central Shimla',
        geo: { type: 'Point', coordinates: [77.189321, 31.114846] },
      },
      price: 3999,
      currency: 'INR',
      durationHours: 5,
      maxGuests: 6,
      status: 'published',
    },
    {
      providerEmail: 'provider18@gowander.com',
      title: 'Varanasi Yoga and Mindfulness Session #090',
      category: 'wellness',
      description:
        'Enjoy a carefully planned wellness experience in Varanasi, Uttar Pradesh. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned wellness experience in Varanasi, Uttar Pradesh. Discover local highlights with an experienced host, explore memorable places, and enjo',
      location: {
        city: 'Varanasi',
        state: 'Uttar Pradesh',
        country: 'India',
        address: 'Central Varanasi',
        geo: { type: 'Point', coordinates: [82.989228, 25.303494] },
      },
      price: 599,
      currency: 'INR',
      durationHours: 4,
      maxGuests: 10,
      status: 'published',
    },
    {
      providerEmail: 'provider19@gowander.com',
      title: 'Darjeeling Handicraft Workshop #091',
      category: 'workshop',
      description:
        'Enjoy a carefully planned workshop experience in Darjeeling, West Bengal. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned workshop experience in Darjeeling, West Bengal. Discover local highlights with an experienced host, explore memorable places, and enjo',
      location: {
        city: 'Darjeeling',
        state: 'West Bengal',
        country: 'India',
        address: 'Central Darjeeling',
        geo: { type: 'Point', coordinates: [88.271864, 27.05174] },
      },
      price: 2499,
      currency: 'INR',
      durationHours: 8,
      maxGuests: 12,
      status: 'published',
    },
    {
      providerEmail: 'provider20@gowander.com',
      title: 'Puducherry Outdoor Explorer Day #092',
      category: 'adventure',
      description:
        'Enjoy a carefully planned adventure experience in Puducherry, Puducherry. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned adventure experience in Puducherry, Puducherry. Discover local highlights with an experienced host, explore memorable places, and enjo',
      location: {
        city: 'Puducherry',
        state: 'Puducherry',
        country: 'India',
        address: 'Central Puducherry',
        geo: { type: 'Point', coordinates: [79.793022, 11.949454] },
      },
      price: 2499,
      currency: 'INR',
      durationHours: 8,
      maxGuests: 6,
      status: 'published',
    },
    {
      providerEmail: 'provider21@gowander.com',
      title: 'Udaipur Artisan Quarter Walk #093',
      category: 'culture',
      description:
        'Enjoy a carefully planned culture experience in Udaipur, Rajasthan. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned culture experience in Udaipur, Rajasthan. Discover local highlights with an experienced host, explore memorable places, and enjoy a sm',
      location: {
        city: 'Udaipur',
        state: 'Rajasthan',
        country: 'India',
        address: 'Central Udaipur',
        geo: { type: 'Point', coordinates: [73.694879, 24.592905] },
      },
      price: 799,
      currency: 'INR',
      durationHours: 8,
      maxGuests: 6,
      status: 'published',
    },
    {
      providerEmail: 'provider22@gowander.com',
      title: 'Kochi Market-to-Table Food Tour #094',
      category: 'food',
      description:
        'Enjoy a carefully planned food experience in Kochi, Kerala. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned food experience in Kochi, Kerala. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-grou',
      location: {
        city: 'Kochi',
        state: 'Kerala',
        country: 'India',
        address: 'Central Kochi',
        geo: { type: 'Point', coordinates: [76.251094, 9.949519] },
      },
      price: 2999,
      currency: 'INR',
      durationHours: 12,
      maxGuests: 4,
      status: 'published',
    },
    {
      providerEmail: 'provider23@gowander.com',
      title: 'Amritsar Lakeside Experience #095',
      category: 'nature',
      description:
        'Enjoy a carefully planned nature experience in Amritsar, Punjab. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned nature experience in Amritsar, Punjab. Discover local highlights with an experienced host, explore memorable places, and enjoy a small',
      location: {
        city: 'Amritsar',
        state: 'Punjab',
        country: 'India',
        address: 'Central Amritsar',
        geo: { type: 'Point', coordinates: [74.87517, 31.650699] },
      },
      price: 799,
      currency: 'INR',
      durationHours: 12,
      maxGuests: 6,
      status: 'published',
    },
    {
      providerEmail: 'provider24@gowander.com',
      title: 'Rishikesh Sunset City Tour #096',
      category: 'sightseeing',
      description:
        'Enjoy a carefully planned sightseeing experience in Rishikesh, Uttarakhand. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned sightseeing experience in Rishikesh, Uttarakhand. Discover local highlights with an experienced host, explore memorable places, and en',
      location: {
        city: 'Rishikesh',
        state: 'Uttarakhand',
        country: 'India',
        address: 'Central Rishikesh',
        geo: { type: 'Point', coordinates: [78.282671, 30.093603] },
      },
      price: 2999,
      currency: 'INR',
      durationHours: 6,
      maxGuests: 10,
      status: 'published',
    },
    {
      providerEmail: 'provider01@gowander.com',
      title: 'New Delhi Wellness Retreat Day #097',
      category: 'wellness',
      description:
        'Enjoy a carefully planned wellness experience in New Delhi, Delhi. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned wellness experience in New Delhi, Delhi. Discover local highlights with an experienced host, explore memorable places, and enjoy a sma',
      location: {
        city: 'New Delhi',
        state: 'Delhi',
        country: 'India',
        address: 'Central New Delhi',
        geo: { type: 'Point', coordinates: [77.214633, 28.622671] },
      },
      price: 2999,
      currency: 'INR',
      durationHours: 8,
      maxGuests: 12,
      status: 'published',
    },
    {
      providerEmail: 'provider02@gowander.com',
      title: 'Gangtok Local Art Experience #098',
      category: 'workshop',
      description:
        'Enjoy a carefully planned workshop experience in Gangtok, Sikkim. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned workshop experience in Gangtok, Sikkim. Discover local highlights with an experienced host, explore memorable places, and enjoy a smal',
      location: {
        city: 'Gangtok',
        state: 'Sikkim',
        country: 'India',
        address: 'Central Gangtok',
        geo: { type: 'Point', coordinates: [88.603796, 27.325266] },
      },
      price: 2499,
      currency: 'INR',
      durationHours: 12,
      maxGuests: 8,
      status: 'published',
    },
    {
      providerEmail: 'provider03@gowander.com',
      title: 'Manali Scenic Cycling Experience #099',
      category: 'adventure',
      description:
        'Enjoy a carefully planned adventure experience in Manali, Himachal Pradesh. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned adventure experience in Manali, Himachal Pradesh. Discover local highlights with an experienced host, explore memorable places, and en',
      location: {
        city: 'Manali',
        state: 'Himachal Pradesh',
        country: 'India',
        address: 'Central Manali',
        geo: { type: 'Point', coordinates: [77.201289, 32.253195] },
      },
      price: 1499,
      currency: 'INR',
      durationHours: 12,
      maxGuests: 6,
      status: 'published',
    },
    {
      providerEmail: 'provider04@gowander.com',
      title: 'Varanasi Old Town Heritage Walk #100',
      category: 'culture',
      description:
        'Enjoy a carefully planned culture experience in Varanasi, Uttar Pradesh. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned culture experience in Varanasi, Uttar Pradesh. Discover local highlights with an experienced host, explore memorable places, and enjoy',
      location: {
        city: 'Varanasi',
        state: 'Uttar Pradesh',
        country: 'India',
        address: 'Central Varanasi',
        geo: { type: 'Point', coordinates: [82.96263, 25.300699] },
      },
      price: 1499,
      currency: 'INR',
      durationHours: 4,
      maxGuests: 8,
      status: 'published',
    },
    {
      providerEmail: 'provider05@gowander.com',
      title: 'Bengaluru Street Food Trail #101',
      category: 'food',
      description:
        'Enjoy a carefully planned food experience in Bengaluru, Karnataka. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned food experience in Bengaluru, Karnataka. Discover local highlights with an experienced host, explore memorable places, and enjoy a sma',
      location: {
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        address: 'Central Bengaluru',
        geo: { type: 'Point', coordinates: [77.586392, 12.987321] },
      },
      price: 799,
      currency: 'INR',
      durationHours: 3,
      maxGuests: 6,
      status: 'published',
    },
    {
      providerEmail: 'provider06@gowander.com',
      title: 'Leh Waterfall and Forest Walk #102',
      category: 'nature',
      description:
        'Enjoy a carefully planned nature experience in Leh, Ladakh. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned nature experience in Leh, Ladakh. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-grou',
      location: {
        city: 'Leh',
        state: 'Ladakh',
        country: 'India',
        address: 'Central Leh',
        geo: { type: 'Point', coordinates: [77.563663, 34.160358] },
      },
      price: 4999,
      currency: 'INR',
      durationHours: 4,
      maxGuests: 4,
      status: 'published',
    },
    {
      providerEmail: 'provider07@gowander.com',
      title: 'Jaipur City Highlights Tour #103',
      category: 'sightseeing',
      description:
        'Enjoy a carefully planned sightseeing experience in Jaipur, Rajasthan. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned sightseeing experience in Jaipur, Rajasthan. Discover local highlights with an experienced host, explore memorable places, and enjoy a',
      location: {
        city: 'Jaipur',
        state: 'Rajasthan',
        country: 'India',
        address: 'Central Jaipur',
        geo: { type: 'Point', coordinates: [75.783043, 26.905635] },
      },
      price: 2499,
      currency: 'INR',
      durationHours: 8,
      maxGuests: 4,
      status: 'published',
    },
    {
      providerEmail: 'provider08@gowander.com',
      title: 'Munnar Wellness Retreat Day #104',
      category: 'wellness',
      description:
        'Enjoy a carefully planned wellness experience in Munnar, Kerala. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned wellness experience in Munnar, Kerala. Discover local highlights with an experienced host, explore memorable places, and enjoy a small',
      location: {
        city: 'Munnar',
        state: 'Kerala',
        country: 'India',
        address: 'Central Munnar',
        geo: { type: 'Point', coordinates: [77.044842, 10.085706] },
      },
      price: 3499,
      currency: 'INR',
      durationHours: 1.5,
      maxGuests: 12,
      status: 'published',
    },
    {
      providerEmail: 'provider09@gowander.com',
      title: 'Mumbai Local Art Experience #105',
      category: 'workshop',
      description:
        'Enjoy a carefully planned workshop experience in Mumbai, Maharashtra. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned workshop experience in Mumbai, Maharashtra. Discover local highlights with an experienced host, explore memorable places, and enjoy a ',
      location: {
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        address: 'Central Mumbai',
        geo: { type: 'Point', coordinates: [72.871719, 19.056236] },
      },
      price: 1799,
      currency: 'INR',
      durationHours: 5,
      maxGuests: 10,
      status: 'published',
    },
    {
      providerEmail: 'provider10@gowander.com',
      title: 'Dharamshala Scenic Cycling Experience #106',
      category: 'adventure',
      description:
        'Enjoy a carefully planned adventure experience in Dharamshala, Himachal Pradesh. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned adventure experience in Dharamshala, Himachal Pradesh. Discover local highlights with an experienced host, explore memorable places, a',
      location: {
        city: 'Dharamshala',
        state: 'Himachal Pradesh',
        country: 'India',
        address: 'Central Dharamshala',
        geo: { type: 'Point', coordinates: [76.341072, 32.237137] },
      },
      price: 2199,
      currency: 'INR',
      durationHours: 4,
      maxGuests: 10,
      status: 'published',
    },
    {
      providerEmail: 'provider11@gowander.com',
      title: 'Agra Old Town Heritage Walk #107',
      category: 'culture',
      description:
        'Enjoy a carefully planned culture experience in Agra, Uttar Pradesh. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned culture experience in Agra, Uttar Pradesh. Discover local highlights with an experienced host, explore memorable places, and enjoy a s',
      location: {
        city: 'Agra',
        state: 'Uttar Pradesh',
        country: 'India',
        address: 'Central Agra',
        geo: { type: 'Point', coordinates: [77.994071, 27.174133] },
      },
      price: 599,
      currency: 'INR',
      durationHours: 8,
      maxGuests: 8,
      status: 'published',
    },
    {
      providerEmail: 'provider12@gowander.com',
      title: 'Darjeeling Street Food Trail #108',
      category: 'food',
      description:
        'Enjoy a carefully planned food experience in Darjeeling, West Bengal. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned food experience in Darjeeling, West Bengal. Discover local highlights with an experienced host, explore memorable places, and enjoy a ',
      location: {
        city: 'Darjeeling',
        state: 'West Bengal',
        country: 'India',
        address: 'Central Darjeeling',
        geo: { type: 'Point', coordinates: [88.274744, 27.052926] },
      },
      price: 4999,
      currency: 'INR',
      durationHours: 3,
      maxGuests: 10,
      status: 'published',
    },
    {
      providerEmail: 'provider13@gowander.com',
      title: 'Manali Waterfall and Forest Walk #109',
      category: 'nature',
      description:
        'Enjoy a carefully planned nature experience in Manali, Himachal Pradesh. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned nature experience in Manali, Himachal Pradesh. Discover local highlights with an experienced host, explore memorable places, and enjoy',
      location: {
        city: 'Manali',
        state: 'Himachal Pradesh',
        country: 'India',
        address: 'Central Manali',
        geo: { type: 'Point', coordinates: [77.209677, 32.258829] },
      },
      price: 2999,
      currency: 'INR',
      durationHours: 1.5,
      maxGuests: 10,
      status: 'published',
    },
    {
      providerEmail: 'provider14@gowander.com',
      title: 'Jaisalmer City Highlights Tour #110',
      category: 'sightseeing',
      description:
        'Enjoy a carefully planned sightseeing experience in Jaisalmer, Rajasthan. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned sightseeing experience in Jaisalmer, Rajasthan. Discover local highlights with an experienced host, explore memorable places, and enjo',
      location: {
        city: 'Jaisalmer',
        state: 'Rajasthan',
        country: 'India',
        address: 'Central Jaisalmer',
        geo: { type: 'Point', coordinates: [70.912895, 26.92222] },
      },
      price: 799,
      currency: 'INR',
      durationHours: 8,
      maxGuests: 6,
      status: 'published',
    },
    {
      providerEmail: 'provider15@gowander.com',
      title: 'Mysuru Wellness Retreat Day #111',
      category: 'wellness',
      description:
        'Enjoy a carefully planned wellness experience in Mysuru, Karnataka. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned wellness experience in Mysuru, Karnataka. Discover local highlights with an experienced host, explore memorable places, and enjoy a sm',
      location: {
        city: 'Mysuru',
        state: 'Karnataka',
        country: 'India',
        address: 'Central Mysuru',
        geo: { type: 'Point', coordinates: [76.657743, 12.283069] },
      },
      price: 1499,
      currency: 'INR',
      durationHours: 8,
      maxGuests: 8,
      status: 'published',
    },
    {
      providerEmail: 'provider16@gowander.com',
      title: 'Srinagar Local Art Experience #112',
      category: 'workshop',
      description:
        'Enjoy a carefully planned workshop experience in Srinagar, Jammu and Kashmir. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned workshop experience in Srinagar, Jammu and Kashmir. Discover local highlights with an experienced host, explore memorable places, and ',
      location: {
        city: 'Srinagar',
        state: 'Jammu and Kashmir',
        country: 'India',
        address: 'Central Srinagar',
        geo: { type: 'Point', coordinates: [74.782883, 34.076774] },
      },
      price: 2199,
      currency: 'INR',
      durationHours: 5,
      maxGuests: 10,
      status: 'published',
    },
    {
      providerEmail: 'provider17@gowander.com',
      title: 'Dehradun Scenic Cycling Experience #113',
      category: 'adventure',
      description:
        'Enjoy a carefully planned adventure experience in Dehradun, Uttarakhand. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned adventure experience in Dehradun, Uttarakhand. Discover local highlights with an experienced host, explore memorable places, and enjoy',
      location: {
        city: 'Dehradun',
        state: 'Uttarakhand',
        country: 'India',
        address: 'Central Dehradun',
        geo: { type: 'Point', coordinates: [78.019814, 30.299776] },
      },
      price: 599,
      currency: 'INR',
      durationHours: 1.5,
      maxGuests: 8,
      status: 'published',
    },
    {
      providerEmail: 'provider18@gowander.com',
      title: 'Goa Old Town Heritage Walk #114',
      category: 'culture',
      description:
        'Enjoy a carefully planned culture experience in Goa, Goa. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned culture experience in Goa, Goa. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group ',
      location: {
        city: 'Goa',
        state: 'Goa',
        country: 'India',
        address: 'Central Goa',
        geo: { type: 'Point', coordinates: [73.814011, 15.473645] },
      },
      price: 3999,
      currency: 'INR',
      durationHours: 1.5,
      maxGuests: 4,
      status: 'published',
    },
    {
      providerEmail: 'provider19@gowander.com',
      title: 'Pune Street Food Trail #115',
      category: 'food',
      description:
        'Enjoy a carefully planned food experience in Pune, Maharashtra. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned food experience in Pune, Maharashtra. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-',
      location: {
        city: 'Pune',
        state: 'Maharashtra',
        country: 'India',
        address: 'Central Pune',
        geo: { type: 'Point', coordinates: [73.879181, 18.508374] },
      },
      price: 599,
      currency: 'INR',
      durationHours: 3,
      maxGuests: 6,
      status: 'published',
    },
    {
      providerEmail: 'provider20@gowander.com',
      title: 'Shimla Waterfall and Forest Walk #116',
      category: 'nature',
      description:
        'Enjoy a carefully planned nature experience in Shimla, Himachal Pradesh. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned nature experience in Shimla, Himachal Pradesh. Discover local highlights with an experienced host, explore memorable places, and enjoy',
      location: {
        city: 'Shimla',
        state: 'Himachal Pradesh',
        country: 'India',
        address: 'Central Shimla',
        geo: { type: 'Point', coordinates: [77.154711, 31.111578] },
      },
      price: 3499,
      currency: 'INR',
      durationHours: 4,
      maxGuests: 10,
      status: 'published',
    },
    {
      providerEmail: 'provider21@gowander.com',
      title: 'Varanasi City Highlights Tour #117',
      category: 'sightseeing',
      description:
        'Enjoy a carefully planned sightseeing experience in Varanasi, Uttar Pradesh. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned sightseeing experience in Varanasi, Uttar Pradesh. Discover local highlights with an experienced host, explore memorable places, and e',
      location: {
        city: 'Varanasi',
        state: 'Uttar Pradesh',
        country: 'India',
        address: 'Central Varanasi',
        geo: { type: 'Point', coordinates: [82.983873, 25.328276] },
      },
      price: 999,
      currency: 'INR',
      durationHours: 2,
      maxGuests: 6,
      status: 'published',
    },
    {
      providerEmail: 'provider22@gowander.com',
      title: 'Darjeeling Wellness Retreat Day #118',
      category: 'wellness',
      description:
        'Enjoy a carefully planned wellness experience in Darjeeling, West Bengal. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned wellness experience in Darjeeling, West Bengal. Discover local highlights with an experienced host, explore memorable places, and enjo',
      location: {
        city: 'Darjeeling',
        state: 'West Bengal',
        country: 'India',
        address: 'Central Darjeeling',
        geo: { type: 'Point', coordinates: [88.289536, 27.025324] },
      },
      price: 599,
      currency: 'INR',
      durationHours: 5,
      maxGuests: 12,
      status: 'published',
    },
    {
      providerEmail: 'provider23@gowander.com',
      title: 'Puducherry Local Art Experience #119',
      category: 'workshop',
      description:
        'Enjoy a carefully planned workshop experience in Puducherry, Puducherry. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned workshop experience in Puducherry, Puducherry. Discover local highlights with an experienced host, explore memorable places, and enjoy',
      location: {
        city: 'Puducherry',
        state: 'Puducherry',
        country: 'India',
        address: 'Central Puducherry',
        geo: { type: 'Point', coordinates: [79.817167, 11.959927] },
      },
      price: 2199,
      currency: 'INR',
      durationHours: 4,
      maxGuests: 4,
      status: 'published',
    },
    {
      providerEmail: 'provider24@gowander.com',
      title: 'Udaipur Scenic Cycling Experience #120',
      category: 'adventure',
      description:
        'Enjoy a carefully planned adventure experience in Udaipur, Rajasthan. Discover local highlights with an experienced host, explore memorable places, and enjoy a small-group itinerary with time for photos and local recommendations.',
      shortDescription:
        'Enjoy a carefully planned adventure experience in Udaipur, Rajasthan. Discover local highlights with an experienced host, explore memorable places, and enjoy a ',
      location: {
        city: 'Udaipur',
        state: 'Rajasthan',
        country: 'India',
        address: 'Central Udaipur',
        geo: { type: 'Point', coordinates: [73.717105, 24.598623] },
      },
      price: 1299,
      currency: 'INR',
      durationHours: 2,
      maxGuests: 8,
      status: 'published',
    },
  ],
};

const hashPassword = (password) => bcrypt.hash(password, HASH_ROUNDS);

async function clearGoWanderData() {
  // Clear dependent collections first, then parent collections.
  const models = [
    AuditLog,
    Notification,
    Favorite,
    Review,
    Booking,
    Listing,
    ProviderApplication,
    User,
  ];
  for (const Model of models) {
    await Model.deleteMany({});
    console.log(`Cleared ${Model.collection.collectionName}`);
  }
}

async function seed() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing. Add it to server/.env before running the seed.');
  }

  await connectDB();
  console.log('Connected to MongoDB. Starting destructive reset...');
  await clearGoWanderData();

  // Create admin account.
  const admin = await User.create({
    name: ADMIN.name,
    email: ADMIN.email,
    passwordHash: await hashPassword(ADMIN.password),
    role: 'admin',
    providerStatus: 'approved',
    status: 'active',
    isVerified: true,
  });

  // Hash once per shared demo password, then store only passwordHash.
  const providerPasswordHash = await hashPassword('Provider@123');
  const travelerPasswordHash = await hashPassword('Traveler@123');

  const providers = await User.insertMany(
    DATA.providers.map(({ password, ...provider }) => ({
      ...provider,
      email: provider.email.toLowerCase(),
      passwordHash: providerPasswordHash,
      role: 'provider',
      providerStatus: 'approved',
      status: 'active',
      isVerified: true,
    })),
  );

  const travelers = await User.insertMany(
    DATA.travelers.map(({ password, ...traveler }) => ({
      ...traveler,
      email: traveler.email.toLowerCase(),
      passwordHash: travelerPasswordHash,
      role: 'traveler',
      providerStatus: 'not_applied',
      status: 'active',
      isVerified: true,
    })),
  );

  const providerByEmail = new Map(providers.map((provider) => [provider.email, provider]));

  // Create approved provider applications so the seeded providers are represented
  // in the provider approval workflow as well as in the public directory.
  const providerApplications = DATA.providers.map((providerData, index) => {
    const provider = providerByEmail.get(providerData.email.toLowerCase());
    const serviceAreas = [
      ...new Set(
        DATA.listings
          .filter(
            (listing) => listing.providerEmail.toLowerCase() === providerData.email.toLowerCase(),
          )
          .map((listing) => listing.location.city),
      ),
    ];
    return {
      user: provider._id,
      businessName: `${provider.name.split(' ')[0]} Travel Experiences`,
      description: provider.bio,
      experienceYears: 1 + (index % 10),
      serviceAreas,
      status: 'approved',
      reviewedBy: admin._id,
      reviewedAt: new Date(Date.now() - (index + 1) * 86400000),
    };
  });
  await ProviderApplication.insertMany(providerApplications);

  // Build listing documents and replace providerEmail with the real MongoDB ObjectId.
  const listingDocuments = DATA.listings.map(({ providerEmail, ...listing }, index) => {
    const provider = providerByEmail.get(providerEmail.toLowerCase());
    if (!provider) {
      throw new Error(`No seeded provider found for listing #${index + 1}: ${providerEmail}`);
    }
    const coordinates = listing.location?.geo?.coordinates;
    if (
      !Array.isArray(coordinates) ||
      coordinates.length !== 2 ||
      !Number.isFinite(coordinates[0]) ||
      !Number.isFinite(coordinates[1])
    ) {
      throw new Error(`Invalid GeoJSON coordinates for listing #${index + 1}`);
    }
    return {
      ...listing,
      provider: provider._id,
      slug: `gowander-${String(index + 1).padStart(3, '0')}-${listing.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')}`,
      currency: listing.currency || 'INR',
      images: listing.images?.length ? listing.images : [getRandomListingImage()],
      included: ['Local expert host', 'Small-group experience'],
      requirements: ['Follow the host instructions', 'Wear suitable clothing'],
      highlights: ['Local insights', 'Memorable experience'],
      featured: index % 10 === 0,
      averageRating: 0,
      reviewCount: 0,
      bookingCount: 0,
      status: 'published',
    };
  });

  // The Listing model in this project must define location.geo (see the required
  // schema addition below). With that field in the schema, insertMany preserves it.
  const listings = await Listing.insertMany(listingDocuments, { ordered: true });

  // A few realistic notifications for the seeded accounts.
  const notifications = [
    ...travelers.slice(0, 15).map((traveler) => ({
      recipient: traveler._id,
      title: 'Welcome to GoWander',
      message: 'Explore local experiences and discover your next trip.',
      type: 'system',
    })),
    ...providers.map((provider) => ({
      recipient: provider._id,
      title: 'Provider account approved',
      message:
        'Your provider profile is approved. Your published packages are now visible to travellers.',
      type: 'provider',
    })),
  ];
  await Notification.insertMany(notifications);

  // Ensure the geospatial index used by nearby search exists.
  await Listing.collection.createIndex({ 'location.geo': '2dsphere' });

  console.log('\n========== GOWANDER SEED COMPLETED ==========');
  console.log(`Admin: ${1}`);
  console.log(`Approved providers: ${providers.length}`);
  console.log(`Travelers: ${travelers.length}`);
  console.log(`Published listings: ${listings.length}`);
  console.log(`Provider applications: ${providerApplications.length}`);
  console.log(`Notifications: ${notifications.length}`);
  console.log('\nDEMO LOGIN CREDENTIALS');
  console.log(`Admin: ${ADMIN.email} / ${ADMIN.password}`);
  console.log('Providers: provider01@gowander.com to provider24@gowander.com / Provider@123');
  console.log('Travelers: traveler001@gowander.com to traveler030@gowander.com / Traveler@123');
  console.log('=============================================');
  console.log('WARNING: All existing GoWander collection data was deleted before seeding.');
}

seed()
  .catch((error) => {
    console.error('GoWander seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
