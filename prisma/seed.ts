import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const adminEmail = 'admin@admin.com';

    const existing = await prisma.user.findUnique({
        where: { email: adminEmail },
    });

    if (!existing) {
        const hashed = await bcrypt.hash('changeme123', 10); // Senha inicial padrão

        await prisma.user.create({
            data: {
                firstName: 'Admin',
                lastName: 'Master',
                email: adminEmail,
                password: hashed,
                role: 'ADMIN',
                mustChangePassword: true,
                jobRole: ''
            },
        });

        console.log(`✅ Admin user created with email: ${adminEmail}`);
    } else {
        console.log(`⚠️ Admin user already exists.`);
    }
}

main()
    .then(() => prisma.$disconnect())
    .catch((e) => {
        console.error(e);
        prisma.$disconnect();
        process.exit(1);
    });