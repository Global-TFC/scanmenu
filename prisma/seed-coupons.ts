import { PrismaClient } from '../src/generated/prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

function generateCouponCode(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function main() {
  console.log('Start seeding coupons...');

  const basicPlanCoupons = [];
  for (let i = 0; i < 6; i++) {
    basicPlanCoupons.push({
      code: 'BASIC-' + generateCouponCode(),
      plan: 'BASIC',
      durationMonths: 12,
    });
  }

  const proPlanCoupons = [];
  for (let i = 0; i < 6; i++) {
    proPlanCoupons.push({
      code: 'PRO-' + generateCouponCode(),
      plan: 'PRO',
      durationMonths: 12,
    });
  }

  const allCoupons = [...basicPlanCoupons, ...proPlanCoupons];
  const createdCoupons = [];

  for (const coupon of allCoupons) {
    // Check if exists first to avoid unique constraint errors if re-run
    const exists = await prisma.coupon.findUnique({ where: { code: coupon.code } });
    if (!exists) {
      const created = await prisma.coupon.create({
        data: coupon,
      });
      console.log(`Created coupon: ${coupon.code} (${coupon.plan})`);
      createdCoupons.push(`${created.code} (${created.plan})`);
    }
  }

  fs.writeFileSync(path.join(process.cwd(), 'coupons.txt'), createdCoupons.join('\n'));
  console.log('Seeding finished. Coupons saved to coupons.txt');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
