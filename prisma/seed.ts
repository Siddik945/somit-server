import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default permissions
  console.log('Creating permissions...');
  const permissions = await Promise.all([
    prisma.permission.upsert({
      where: { name: 'users.create' },
      update: {},
      create: {
        name: 'users.create',
        description: 'Create new users',
        resource: 'users',
        action: 'create',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'users.read' },
      update: {},
      create: {
        name: 'users.read',
        description: 'View users',
        resource: 'users',
        action: 'read',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'users.update' },
      update: {},
      create: {
        name: 'users.update',
        description: 'Update users',
        resource: 'users',
        action: 'update',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'users.delete' },
      update: {},
      create: {
        name: 'users.delete',
        description: 'Delete users',
        resource: 'users',
        action: 'delete',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'amounts.create' },
      update: {},
      create: {
        name: 'amounts.create',
        description: 'Create amounts',
        resource: 'amounts',
        action: 'create',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'amounts.read' },
      update: {},
      create: {
        name: 'amounts.read',
        description: 'View amounts',
        resource: 'amounts',
        action: 'read',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'amounts.update' },
      update: {},
      create: {
        name: 'amounts.update',
        description: 'Update amounts',
        resource: 'amounts',
        action: 'update',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'amounts.delete' },
      update: {},
      create: {
        name: 'amounts.delete',
        description: 'Delete amounts',
        resource: 'amounts',
        action: 'delete',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'kistis.create' },
      update: {},
      create: {
        name: 'kistis.create',
        description: 'Create kistis',
        resource: 'kistis',
        action: 'create',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'kistis.read' },
      update: {},
      create: {
        name: 'kistis.read',
        description: 'View kistis',
        resource: 'kistis',
        action: 'read',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'kistis.update' },
      update: {},
      create: {
        name: 'kistis.update',
        description: 'Update kistis',
        resource: 'kistis',
        action: 'update',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'kistis.delete' },
      update: {},
      create: {
        name: 'kistis.delete',
        description: 'Delete kistis',
        resource: 'kistis',
        action: 'delete',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'roles.create' },
      update: {},
      create: {
        name: 'roles.create',
        description: 'Create roles',
        resource: 'roles',
        action: 'create',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'roles.read' },
      update: {},
      create: {
        name: 'roles.read',
        description: 'View roles',
        resource: 'roles',
        action: 'read',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'roles.update' },
      update: {},
      create: {
        name: 'roles.update',
        description: 'Update roles',
        resource: 'roles',
        action: 'update',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'roles.delete' },
      update: {},
      create: {
        name: 'roles.delete',
        description: 'Delete roles',
        resource: 'roles',
        action: 'delete',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'permissions.create' },
      update: {},
      create: {
        name: 'permissions.create',
        description: 'Create permissions',
        resource: 'permissions',
        action: 'create',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'permissions.read' },
      update: {},
      create: {
        name: 'permissions.read',
        description: 'View permissions',
        resource: 'permissions',
        action: 'read',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'permissions.update' },
      update: {},
      create: {
        name: 'permissions.update',
        description: 'Update permissions',
        resource: 'permissions',
        action: 'update',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'permissions.delete' },
      update: {},
      create: {
        name: 'permissions.delete',
        description: 'Delete permissions',
        resource: 'permissions',
        action: 'delete',
      },
    }),
  ]);

  console.log(`✅ Created ${permissions.length} permissions`);

  // Create default roles
  console.log('Creating roles...');
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Administrator with full access',
      permissions: {
        connect: permissions.map((p: any) => ({ id: p.id })),
      },
    },
  });

  const moderatorRole = await prisma.role.upsert({
    where: { name: 'MODERATOR' },
    update: {},
    create: {
      name: 'MODERATOR',
      description: 'Moderator with limited access',
      permissions: {
        connect: permissions
          .filter(
            (p: any) => p.resource !== 'roles' && p.resource !== 'permissions',
          )
          .map((p: any) => ({ id: p.id })),
      },
    },
  });

  const memberRole = await prisma.role.upsert({
    where: { name: 'MEMBER' },
    update: {},
    create: {
      name: 'MEMBER',
      description: 'Regular member with read-only access',
      permissions: {
        connect: permissions
          .filter((p: any) => p.action === 'read')
          .map((p: any) => ({ id: p.id })),
      },
    },
  });

  console.log('✅ Created 3 roles (ADMIN, MODERATOR, MEMBER)');

  // Create admin user
  console.log('Creating admin user...');
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      roleId: adminRole.id,
    },
  });

  console.log('✅ Created admin user');
  console.log('📧 Email: admin@example.com');
  console.log('🔑 Password: admin123');

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
