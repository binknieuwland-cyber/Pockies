// Eenmalig lokaal draaien om het Comm Pockies-account aan te maken/bij te werken:
//   npx tsx scripts/bootstrap-comm-pockies.ts
//
// Zet eerst COMM_EMAIL en COMM_CODE in je lokale .env (die staat in .gitignore,
// komt dus nooit in git terecht).
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.COMM_EMAIL?.trim().toLowerCase()
  const code = process.env.COMM_CODE?.trim()

  if (!email || !code) {
    console.error('Zet COMM_EMAIL en COMM_CODE in je .env voordat je dit script draait.')
    process.exit(1)
  }

  const codeHash = await bcrypt.hash(code, 10)

  const user = await prisma.user.upsert({
    where: { email },
    update: { codeHash, role: 'COMM_POCKIES' },
    create: { email, codeHash, role: 'COMM_POCKIES' },
  })

  console.log(`Comm Pockies-account klaar voor ${user.email} (id ${user.id}).`)
  console.log('Je kunt nu inloggen op /login met dit e-mailadres en de code uit .env.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
