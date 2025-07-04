// src/pages/index.tsx
import Head from "next/head";
import PaymentButton from "../PaymentButton";

export default function Home() {
  return (
    <>
      <Head>
        <title>Razorpay × Next.js Demo</title>
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center gap-6">
        <h1 className="text-3xl font-semibold">Buy Premium</h1>
        <PaymentButton />
      </main>
    </>
  );
}
