
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedTickets() {
  console.log('Seeding ticket categories...');
  
  const categories = [
    { name: 'Hardware', description: 'Issues with laptops, monitors, or peripherals' },
    { name: 'Software', description: 'Application errors or installation requests' },
    { name: 'Network', description: 'Wi-Fi, VPN, or internet connectivity issues' },
    { name: 'Access & Security', description: 'Password resets, account access, or security concerns' },
    { name: 'Plumbing', description: 'Leaks, clogs, or water supply issues' },
    { name: 'Electrical', description: 'Power outages, lighting, or wiring issues' },
    { name: 'HVAC', description: 'Heating, ventilation, or air conditioning issues' },
    { name: 'Furniture', description: 'Broken chairs, desks, or office arrangement' },
    { name: 'Janitorial', description: 'Cleaning requests or spill reports' },
    { name: 'Other', description: 'General inquiries and other issues' },
  ];

  for (const cat of categories) {
    await prisma.ticketCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }

  console.log('✅ Ticket categories seeded.');
}
