/**
 * Loads sample bookings into MongoDB. Run from the backend directory:
 *   npm run seed
 * Requires MONGODB_URI in .env (see .env.example).
 */
require('dotenv').config();

const mongoose = require('mongoose');
const { addDays } = require('date-fns');

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      'MONGODB_URI is not set. Copy .env.example to .env and set MONGODB_URI.',
    );
  }

  await mongoose.connect(uri);

  try {
    const collection = mongoose.connection.db.collection('bookings');

    await collection.deleteMany({});

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const now = new Date();

    const docs = [
      {
        guestName: 'Alex Rivera',
        propertyName: 'Oceanview Suite 12',
        checkIn: addDays(today, 5),
        checkOut: addDays(today, 8),
        status: 'pending',
        totalAmount: 450.0,
        createdAt: now,
        updatedAt: now,
      },
      {
        guestName: 'Jordan Lee',
        propertyName: 'Downtown Loft 4',
        checkIn: addDays(today, 10),
        checkOut: addDays(today, 13),
        status: 'confirmed',
        totalAmount: 620.5,
        createdAt: now,
        updatedAt: now,
      },
      {
        guestName: 'Sam Patel',
        propertyName: 'Garden Villa B',
        checkIn: addDays(today, -2),
        checkOut: addDays(today, 3),
        status: 'checked_in',
        totalAmount: 980.0,
        createdAt: now,
        updatedAt: now,
      },
      {
        guestName: 'Taylor Morgan',
        propertyName: 'Harbor Penthouse',
        checkIn: addDays(today, -14),
        checkOut: addDays(today, -10),
        status: 'checked_out',
        totalAmount: 2100.0,
        createdAt: now,
        updatedAt: now,
      },
      {
        guestName: 'Casey Nguyen',
        propertyName: 'Studio North 2',
        checkIn: addDays(today, 20),
        checkOut: addDays(today, 22),
        status: 'cancelled',
        totalAmount: 199.99,
        createdAt: now,
        updatedAt: now,
      },
      {
        guestName: 'Riley Brooks',
        propertyName: 'Mountain Cabin 7',
        checkIn: addDays(today, 1),
        checkOut: addDays(today, 4),
        status: 'pending',
        totalAmount: 775.25,
        createdAt: now,
        updatedAt: now,
      },
      {
        guestName: 'Morgan Chen',
        propertyName: 'City Studio 9',
        checkIn: addDays(today, -7),
        checkOut: addDays(today, -4),
        status: 'confirmed',
        totalAmount: 412.0,
        createdAt: now,
        updatedAt: now,
      },
    ];

    await collection.insertMany(docs);

    console.log(`Seeded ${docs.length} bookings (collection: bookings).`);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
