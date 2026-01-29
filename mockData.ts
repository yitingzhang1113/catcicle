
import { PostType, Post, Product, OwnerProfile, CatChallenge, Community } from './types';

export const MOCK_OWNER_ME: OwnerProfile = {
  id: 'owner_me',
  accountName: 'Ragdoll_Official',
  avatar: 'https://i.pravatar.cc/150?u=sarah',
  bio: 'Professional cat lover. Managing a household of fluffy clouds. ☕🐾',
  coinBalance: 1250,
  followersCount: 840,
  followingCount: 230,
  cats: [
    {
      id: 'cat_mochi',
      ownerId: 'owner_me',
      name: 'Mochi',
      breed: 'Ragdoll',
      age: 2,
      gender: 'Male',
      neutered: true,
      personality: ['Cuddly', 'Vocal'],
      healthTags: ['Sensitive Stomach'],
      avatar: 'https://images.unsplash.com/photo-1548247416-ec66f4900b2e?q=80&w=400',
      bio: 'The namesake of this account. A true gentleman.'
    }
  ],
  interests: ['Ragdoll Care', 'Photography', 'Organic Food', 'Interior Design']
};

export const MOCK_OWNER_LUNA: OwnerProfile = {
  id: 'owner_luna',
  accountName: 'Kevin_BSH',
  avatar: 'https://i.pravatar.cc/150?u=kevin',
  bio: 'British Shorthair enthusiast and amateur photographer.',
  coinBalance: 300,
  followersCount: 2100,
  followingCount: 560,
  cats: [
    {
      id: 'cat_luna',
      ownerId: 'owner_luna',
      name: 'Luna',
      breed: 'British Shorthair',
      age: 4,
      gender: 'Female',
      neutered: true,
      personality: ['Independent', 'Lazy'],
      healthTags: [],
      avatar: 'https://images.unsplash.com/photo-1513245533132-31f507417b26?q=80&w=400',
      bio: 'Ruling from the top of the bookshelf.'
    }
  ],
  interests: ['British Shorthair', 'Cat Furniture', 'Indoor Play', 'Photography']
};

export const MOCK_OWNER_BENGAL: OwnerProfile = {
  id: 'owner_bengal',
  accountName: 'WildHeart_Leo',
  avatar: 'https://i.pravatar.cc/150?u=leo',
  bio: 'Adventure cat owner. Training Leo to hike with me!',
  coinBalance: 800,
  followersCount: 1500,
  followingCount: 400,
  cats: [
    {
      id: 'cat_leo',
      ownerId: 'owner_bengal',
      name: 'Leo',
      breed: 'Bengal',
      age: 3,
      gender: 'Male',
      neutered: true,
      personality: ['High Energy', 'Adventurous'],
      healthTags: [],
      avatar: 'https://images.unsplash.com/photo-1511044568932-338cba0ad803?q=80&w=400',
      bio: 'Leash trained and ready for the wild.'
    }
  ],
  interests: ['Adventure Cats', 'Training', 'Active Play', 'Photography']
};

export const MOCK_OWNER_SPHYNX: OwnerProfile = {
  id: 'owner_sphynx',
  accountName: 'Velvet_Shadow',
  avatar: 'https://i.pravatar.cc/150?u=shadow',
  bio: 'Living life without a single hair! 🧥 Skin care is my passion.',
  coinBalance: 2400,
  followersCount: 4500,
  followingCount: 120,
  cats: [
    {
      id: 'cat_shadow',
      ownerId: 'owner_sphynx',
      name: 'Shadow',
      breed: 'Sphynx',
      age: 3,
      gender: 'Male',
      neutered: true,
      personality: ['Gentle', 'Vocal'],
      healthTags: ['Special Diet'],
      avatar: 'https://images.unsplash.com/photo-1520315342629-6ea920342047?q=80&w=400',
      bio: 'Just a warm peach living in a fuzzy world.'
    }
  ],
  interests: ['Sphynx Care', 'Cat Fashion', 'Skincare']
};

export const MOCK_OWNER_MAINECOON: OwnerProfile = {
  id: 'owner_titan',
  accountName: 'GentleGiant_Titan',
  avatar: 'https://i.pravatar.cc/150?u=titan',
  bio: 'Everything is bigger in this house. Even the purrs. 🦁',
  coinBalance: 150,
  followersCount: 12000,
  followingCount: 800,
  cats: [
    {
      id: 'cat_titan',
      ownerId: 'owner_titan',
      name: 'Titan',
      breed: 'Maine Coon',
      age: 5,
      gender: 'Male',
      neutered: true,
      personality: ['Gentle', 'Lazy'],
      healthTags: [],
      avatar: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?q=80&w=400',
      bio: 'Half cat, half lion, all love.'
    }
  ],
  interests: ['Maine Coon', 'Grooming', 'Giant Cats']
};

export const MOCK_OWNERS = [
  MOCK_OWNER_ME, 
  MOCK_OWNER_LUNA, 
  MOCK_OWNER_BENGAL, 
  MOCK_OWNER_SPHYNX, 
  MOCK_OWNER_MAINECOON
];

export const MOCK_COMMUNITIES: Community[] = [
  {
    id: 'comm_bsh',
    name: 'British Shorthair Club',
    description: 'A place for the thick-coated, chunky-cheeked royalty.',
    avatar: 'https://images.unsplash.com/photo-1513245533132-31f507417b26?q=80&w=200',
    memberIds: ['owner_luna', 'owner_me'],
    creatorId: 'owner_luna',
    breedTag: 'British Shorthair'
  },
  {
    id: 'comm_wild',
    name: 'Outdoor Adventurers',
    description: 'Leash training, hiking, and exploring with our wilder felines.',
    avatar: 'https://images.unsplash.com/photo-1533738699159-d0c68059bbd1?q=80&w=200',
    memberIds: ['owner_bengal', 'owner_me'],
    creatorId: 'owner_bengal'
  }
];

export const MOCK_POSTS: Post[] = [
  {
    id: 'p1',
    catId: 'cat_luna',
    ownerId: 'owner_luna',
    type: PostType.DAILY,
    content: "Just staring at a wall for 3 hours. It's an art form, really. You wouldn't understand the depth of this gray texture. #LifeOfLuna #CatArt",
    mediaUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=800',
    timestamp: Date.now() - 3600000,
    likes: 124,
    tips: 45,
    comments: [],
    tags: ['Daily', 'LazyCat', 'Art']
  },
  {
    id: 'p2',
    catId: 'cat_leo',
    ownerId: 'owner_bengal',
    type: PostType.CARE_TIPS,
    content: "Pro Tip: If you're leash training your Bengal, start with the harness at dinner time. Positive reinforcement is key! Leo now associates the harness with his favorite treats. 🧗‍♂️🐾",
    mediaUrl: 'https://images.unsplash.com/photo-1513360371669-4adaaee41413?q=80&w=800',
    timestamp: Date.now() - 7200000,
    likes: 89,
    tips: 200,
    comments: [],
    tags: ['CareTips', 'Training', 'Bengal']
  },
  {
    id: 'p3',
    catId: 'cat_shadow',
    ownerId: 'owner_sphynx',
    type: PostType.DAILY,
    content: "Found a sunbeam. It's the highest honor a Sphynx can achieve. Who needs fur when you have 100% efficient heat absorption? ☀️🛋️",
    mediaUrl: 'https://images.unsplash.com/photo-1520315342629-6ea920342047?q=80&w=800',
    timestamp: Date.now() - 10800000,
    likes: 256,
    tips: 150,
    comments: [],
    tags: ['Daily', 'SleepingCat', 'Sunlight']
  },
  {
    id: 'p4',
    catId: 'cat_mochi',
    ownerId: 'owner_me',
    type: PostType.PROBLEM,
    content: "Mochi has been refusing his favorite wet food lately. He just looks at it and walks away... anyone else experiencing a 'hunger strike' this week? Could it be the new bowl? 🥣🤔",
    mediaUrl: 'https://images.unsplash.com/photo-1548247416-ec66f4900b2e?q=80&w=800',
    timestamp: Date.now() - 14400000,
    likes: 32,
    tips: 10,
    comments: [],
    tags: ['Problem', 'Feeding', 'AdviceWanted']
  },
  {
    id: 'p5',
    catId: 'cat_titan',
    ownerId: 'owner_titan',
    type: PostType.DAILY,
    content: "Perspective: Titan is 5 years old and still doesn't realize he's longer than the dining table. Big cats = big problems (but also big cuddles). 🦁❤️",
    mediaUrl: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?q=80&w=800',
    timestamp: Date.now() - 86400000,
    likes: 540,
    tips: 800,
    comments: [],
    tags: ['MaineCoon', 'GiantCat', 'Funny']
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'pr1',
    name: 'Organic Salmon Bites',
    usdPrice: 12.99,
    catCoinPrice: 500,
    category: 'Food',
    description: 'Grain-free wild salmon treats for sensitive stomachs. Rich in Omega-3.',
    imageUrl: 'https://images.unsplash.com/photo-1589924691106-07c263544129?q=80&w=400',
    reviews: []
  },
  {
    id: 'pr2',
    name: 'Velvet Winter Cape',
    usdPrice: 24.50,
    catCoinPrice: 1200,
    category: 'Clothes',
    description: 'Ultra-soft lining for hairless cats or chilly kittens. Stylish and functional.',
    imageUrl: 'https://images.unsplash.com/photo-1548546738-8509cb246ed3?q=80&w=400',
    reviews: []
  },
  {
    id: 'pr3',
    name: 'Smart Laser Tower',
    usdPrice: 35.00,
    catCoinPrice: 2000,
    category: 'Gear',
    description: 'Automated 360-degree laser play. Keep your indoor cat active and happy.',
    imageUrl: 'https://images.unsplash.com/photo-1608501078713-8e445a709b39?q=80&w=400',
    reviews: []
  }
];

export const MOCK_CHALLENGES: CatChallenge[] = [
  {
    id: 'ch1',
    title: 'Sleeping Beauty 😴',
    description: 'Post a photo of your cat sleeping to win a big bonus!',
    reward: 50,
    tag: '#SleepingCat',
    isActive: true,
    endDate: Date.now() + (2 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'ch2',
    title: 'Outdoor Explorer 🧭',
    description: 'Show us your cat on a leash or exploring the garden!',
    reward: 100,
    tag: '#AdventureCat',
    isActive: true,
    endDate: Date.now() + (5 * 24 * 60 * 60 * 1000)
  }
];
