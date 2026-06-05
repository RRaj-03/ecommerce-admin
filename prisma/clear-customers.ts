import prismadb from "../lib/prismadb";

async function main() {
  const deleted = await prismadb.customer.deleteMany({});
  console.log(`Cleared ${deleted.count} Customer rows`);
}

main().catch(console.error).finally(() => prismadb.$disconnect());
