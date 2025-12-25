import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { PrismaClient } from "@prisma/client";
import { notFound, redirect } from "next/navigation";

const prisma = new PrismaClient();
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ReceiptPage({ params }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?next=/receipt/" + params.id);

  const tx = await prisma.tx.findUnique({
    where: { id: params.id },
    include: { wallet: { include: { user: true } } },
  });
  if (!tx || tx.wallet.userId !== session.user.id) notFound();

  return (
    <main className="min-h-[100dvh] bg-[#10141c] text-white">
      <div className="max-w-xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Deposit Receipt</h1>
        <div className="bg-[#151a28] rounded-2xl border border-blue-900/30 p-5 space-y-2">
          <Row k="User" v={`${tx.wallet.user.name || tx.wallet.user.email}`} />
          <Row k="Transaction ID" v={tx.id} />
          <Row k="Title" v={tx.title} />
          <Row k="Asset / Network" v={`${tx.asset || "-"} / ${tx.network || "-"}`} />
          <Row k="Amount" v={`${tx.currency} ${Number(tx.amount).toLocaleString()}`} />
          <Row k="Status" v={tx.status} />
          <Row k="Created" v={new Date(tx.createdAt).toLocaleString()} />
          <Row k="Address" v={tx.meta?.address || "-"} mono />
          {tx.meta?.memo && <Row k="Memo/Tag" v={tx.meta.memo} mono />}
          {tx.receiptUrl && (
            <div className="mt-3">
              <div className="text-sm text-gray-300 mb-1">Uploaded receipt</div>
              <a className="underline text-blue-300" href={tx.receiptUrl} target="_blank">Open</a>
            </div>
          )}
        </div>

        <button onClick={() => window.print()} className="mt-4 w-full rounded-xl bg-sky-500 text-slate-900 font-semibold py-3">
          Print / Save PDF
        </button>
      </div>
    </main>
  );
}

function Row({ k, v, mono }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-40 text-gray-400">{k}</div>
      <div className={`flex-1 ${mono ? "font-mono break-all" : ""}`}>{v}</div>
    </div>
  );
}
