import { prisma } from '../src/lib/prisma';

async function main() {
  const users = await prisma.user.findMany();

  for (const user of users) {
    const alreadyTagged = await prisma.userTag.findFirst({
      where: {
        userId: user.id,
        label: 'Day 1',
      },
    });

    if (!alreadyTagged) {
      await prisma.userTag.create({
        data: {
          userId: user.id,
          label: 'Day 1',
        },
      });
      console.log(`✅ Tagged ${user.username} as Day 1`);
    } else {
      console.log(`⚠️  ${user.username} already has Day 1 tag`);
    }
  }
}

main()
  .then(() => {
    console.log('🎉 All users tagged.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Error tagging users:', err);
    process.exit(1);
  });
