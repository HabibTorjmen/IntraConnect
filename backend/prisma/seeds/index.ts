
import { seed } from './users.seed';
import { seedTickets } from './tickets.seed';

async function main() {
  try {
    await seed();
    await seedTickets();
  } catch (e) {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  }
}

main();