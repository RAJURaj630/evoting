const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Candidate = require('../models/Candidate');
const Election = require('../models/Election');
const Voter = require('../models/Voter');

// Load environment variables
dotenv.config();

// Maharashtra candidates data
const maharashtraCandidates = [
  // Mumbai South
  {
    name: 'Arvind Sawant',
    party: 'Shiv Sena (Uddhav Balasaheb Thackeray)',
    constituency: 'Mumbai South',
    symbol: 'Flaming Torch',
    description: 'Sitting MP, former Union Minister'
  },
  {
    name: 'Milind Deora',
    party: 'Bharatiya Janata Party (BJP)',
    constituency: 'Mumbai South',
    symbol: 'Lotus',
    description: 'Former Union Minister, business leader'
  },
  {
    name: 'Yamini Jadhav',
    party: 'Shiv Sena (Eknath Shinde)',
    constituency: 'Mumbai South',
    symbol: 'Two Swords and Shield',
    description: 'Former corporator, social worker'
  },

  // Mumbai North
  {
    name: 'Piyush Goyal',
    party: 'Bharatiya Janata Party (BJP)',
    constituency: 'Mumbai North',
    symbol: 'Lotus',
    description: 'Union Minister, former Railway Minister'
  },
  {
    name: 'Bhushan Patil',
    party: 'Indian National Congress (INC)',
    constituency: 'Mumbai North',
    symbol: 'Hand',
    description: 'Youth leader, social activist'
  },
  {
    name: 'Sandeep Deshpande',
    party: 'Maharashtra Navnirman Sena (MNS)',
    constituency: 'Mumbai North',
    symbol: 'Railway Engine',
    description: 'Party spokesperson, lawyer'
  },

  // Pune
  {
    name: 'Murlidhar Mohol',
    party: 'Bharatiya Janata Party (BJP)',
    constituency: 'Pune',
    symbol: 'Lotus',
    description: 'Former Mayor of Pune, corporator'
  },
  {
    name: 'Ravindra Dhangekar',
    party: 'Indian National Congress (INC)',
    constituency: 'Pune',
    symbol: 'Hand',
    description: 'Former corporator, social worker'
  },
  {
    name: 'Jagdish Mulik',
    party: 'Shiv Sena (Uddhav Balasaheb Thackeray)',
    constituency: 'Pune',
    symbol: 'Flaming Torch',
    description: 'Former MLA, party veteran'
  },

  // Baramati
  {
    name: 'Supriya Sule',
    party: 'Nationalist Congress Party (NCP)',
    constituency: 'Baramati',
    symbol: 'Clock',
    description: 'Sitting MP, daughter of Sharad Pawar'
  },
  {
    name: 'Ajit Pawar',
    party: 'Nationalist Congress Party (NCP)',
    constituency: 'Baramati',
    symbol: 'Trumpet',
    description: 'Deputy CM, senior leader'
  },
  {
    name: 'Yogesh Tilekar',
    party: 'Bharatiya Janata Party (BJP)',
    constituency: 'Baramati',
    symbol: 'Lotus',
    description: 'Former corporator, businessman'
  },

  // Nagpur
  {
    name: 'Nitin Gadkari',
    party: 'Bharatiya Janata Party (BJP)',
    constituency: 'Nagpur',
    symbol: 'Lotus',
    description: 'Union Minister for Road Transport'
  },
  {
    name: 'Vikas Thakre',
    party: 'Indian National Congress (INC)',
    constituency: 'Nagpur',
    symbol: 'Hand',
    description: 'Former MP, Congress leader'
  },
  {
    name: 'Praful Gudadhe',
    party: 'Bahujan Samaj Party (BSP)',
    constituency: 'Nagpur',
    symbol: 'Elephant',
    description: 'Social activist, party leader'
  },

  // Nashik
  {
    name: 'Hemant Godse',
    party: 'Bharatiya Janata Party (BJP)',
    constituency: 'Nashik',
    symbol: 'Lotus',
    description: 'Former MLA, party veteran'
  },
  {
    name: 'Rajabhau Waje',
    party: 'Shiv Sena (Uddhav Balasaheb Thackeray)',
    constituency: 'Nashik',
    symbol: 'Flaming Torch',
    description: 'Former MP, senior leader'
  },
  {
    name: 'Sameer Bhujbal',
    party: 'Nationalist Congress Party (NCP)',
    constituency: 'Nashik',
    symbol: 'Clock',
    description: 'Former MLA, youth leader'
  },

  // Thane
  {
    name: 'Rajan Vichare',
    party: 'Shiv Sena (Eknath Shinde)',
    constituency: 'Thane',
    symbol: 'Two Swords and Shield',
    description: 'Sitting MP, party leader'
  },
  {
    name: 'Sanjeev Naik',
    party: 'Bharatiya Janata Party (BJP)',
    constituency: 'Thane',
    symbol: 'Lotus',
    description: 'Former corporator, businessman'
  },
  {
    name: 'Anand Paranjpe',
    party: 'Maharashtra Navnirman Sena (MNS)',
    constituency: 'Thane',
    symbol: 'Railway Engine',
    description: 'Former corporator, social activist'
  },

  // Aurangabad
  {
    name: 'Sandipan Bhumre',
    party: 'Shiv Sena (Eknath Shinde)',
    constituency: 'Aurangabad',
    symbol: 'Two Swords and Shield',
    description: 'Sitting MP, party leader'
  },
  {
    name: 'Harshvardhan Jadhav',
    party: 'Shiv Sena (Uddhav Balasaheb Thackeray)',
    constituency: 'Aurangabad',
    symbol: 'Flaming Torch',
    description: 'Former MP, senior leader'
  },
  {
    name: 'Imtiaz Jaleel',
    party: 'All India Majlis-e-Ittehadul Muslimeen (AIMIM)',
    constituency: 'Aurangabad',
    symbol: 'Kite',
    description: 'Sitting MP, party spokesperson'
  },

  // Solapur
  {
    name: 'Ram Satpute',
    party: 'Bharatiya Janata Party (BJP)',
    constituency: 'Solapur',
    symbol: 'Lotus',
    description: 'Former MLA, party leader'
  },
  {
    name: 'Praniti Shinde',
    party: 'Indian National Congress (INC)',
    constituency: 'Solapur',
    symbol: 'Hand',
    description: 'Former MLA, women leader'
  },
  {
    name: 'Abhijeet Adsul',
    party: 'Shiv Sena (Eknath Shinde)',
    constituency: 'Solapur',
    symbol: 'Two Swords and Shield',
    description: 'Former MP, party veteran'
  },

  // Kolhapur
  {
    name: 'Shahu Chhatrapati',
    party: 'Indian National Congress (INC)',
    constituency: 'Kolhapur',
    symbol: 'Hand',
    description: 'Royal family member, sitting MP'
  },
  {
    name: 'Sanjay Mandlik',
    party: 'Bharatiya Janata Party (BJP)',
    constituency: 'Kolhapur',
    symbol: 'Lotus',
    description: 'Former MLA, party leader'
  },
  {
    name: 'Dhananjay Mahadik',
    party: 'Shiv Sena (Uddhav Balasaheb Thackeray)',
    constituency: 'Kolhapur',
    symbol: 'Flaming Torch',
    description: 'Former MP, senior leader'
  },

  // Add some independent candidates
  {
    name: 'Dr. Prakash Ambedkar',
    party: 'Independent',
    constituency: 'Mumbai North-East',
    symbol: 'Book',
    description: 'Social activist, grandson of Dr. B.R. Ambedkar'
  },
  {
    name: 'Ravi Rana',
    party: 'Independent',
    constituency: 'Amravati',
    symbol: 'Truck',
    description: 'Former MP, independent leader'
  }
];

// Sample admin user
const adminUser = {
  voterId: 'VOTER000001',
  name: 'Election Administrator',
  email: 'admin@maharashtra-elections.gov.in',
  phone: '9876543210',
  constituency: 'Mumbai South',
  role: 'admin',
  passwordHash: '', // Will be set during creation
  otpVerified: true,
  isEligible: true,
  isActive: true,
  verificationStatus: 'verified'
};

// Sample election
const maharashtraElection = {
  name: 'Maharashtra Legislative Assembly Elections 2024',
  description: 'General Elections for the Maharashtra Legislative Assembly',
  startDate: new Date('2024-11-15T07:00:00.000Z'),
  endDate: new Date('2024-11-15T18:00:00.000Z'),
  status: 'upcoming',
  isActive: true,
  constituencies: [
    'Mumbai South', 'Mumbai North', 'Mumbai North-East', 'Mumbai North-West',
    'Mumbai North-Central', 'Mumbai South-Central', 'Pune', 'Baramati',
    'Nagpur', 'Wardha', 'Nashik', 'Maval', 'Thane', 'Kalyan',
    'Aurangabad', 'Jalna', 'Solapur', 'Madha', 'Kolhapur', 'Hatkanangle',
    'Sangli', 'Satara', 'Ratnagiri-Sindhudurg', 'Raigad', 'Ahmednagar',
    'Shirdi', 'Beed', 'Osmanabad', 'Latur', 'Nanded', 'Hingoli',
    'Parbhani', 'Jalgaon', 'Raver', 'Buldhana', 'Akola', 'Amravati',
    'Yavatmal-Washim', 'Chandrapur', 'Gadchiroli-Chimur', 'Bhandara-Gondiya',
    'Gondia', 'Dhule', 'Nandurbar'
  ]
};

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/evoting');
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await Candidate.deleteMany({});
    await Election.deleteMany({});
    
    // Clear all voters to avoid duplicate key errors
    await Voter.deleteMany({});

    // Create admin user
    console.log('Creating admin user...');
    adminUser.passwordHash = await Voter.hashPassword('admin123');
    const admin = await Voter.create(adminUser);
    console.log('Admin user created:', admin.email);

    // Create election
    console.log('Creating Maharashtra election...');
    maharashtraElection.createdBy = admin._id;
    const election = await Election.create(maharashtraElection);
    console.log('Election created:', election.name);

    // Create candidates
    console.log('Creating candidates...');
    const candidates = await Candidate.insertMany(maharashtraCandidates);
    console.log(`Created ${candidates.length} candidates`);

    // Display summary
    console.log('\n=== SEED DATA SUMMARY ===');
    console.log(`Election: ${election.name}`);
    console.log(`Total Candidates: ${candidates.length}`);
    console.log(`Admin User: ${admin.email} (Password: admin123)`);
    
    console.log('\nCandidates by Constituency:');
    const constituencyCount = {};
    candidates.forEach(candidate => {
      constituencyCount[candidate.constituency] = (constituencyCount[candidate.constituency] || 0) + 1;
    });
    
    Object.entries(constituencyCount).forEach(([constituency, count]) => {
      console.log(`  ${constituency}: ${count} candidates`);
    });

    console.log('\nCandidates by Party:');
    const partyCount = {};
    candidates.forEach(candidate => {
      partyCount[candidate.party] = (partyCount[candidate.party] || 0) + 1;
    });
    
    Object.entries(partyCount).forEach(([party, count]) => {
      console.log(`  ${party}: ${count} candidates`);
    });

    console.log('\n✅ Database seeded successfully!');
    console.log('\nTo start the application:');
    console.log('1. Backend: npm run dev (from backend directory)');
    console.log('2. Frontend: npm run dev (from frontend directory)');
    console.log('3. Login as admin: admin@maharashtra-elections.gov.in / admin123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, maharashtraCandidates, maharashtraElection };
