"use client";

import { useEffect, useState } from "react";
import { get, post, uploadFile } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { useRouter } from "next/navigation";

type Student = {
  id: string;
  student_number: string;
  grade_level: string;
  section: string;
  user?: { full_name: string };
};

type Payment = {
  id: string;
  student_id: string;
  student_name: string;
  student_number: string;
  expected_amount: string | number;
  amount: string | number | null;
  provider: string | null;
  receipt_url: string | null;
  receipt_reference: string | null;
  payer_name: string | null;
  transaction_status: string | null;
  payment_date: string | null;
  verification_status: "PENDING" | "VERIFYING" | "VERIFIED" | "REJECTED" | "MANUAL_REVIEW";
  verification_message: string | null;
  verified_at: string | null;
  created_at: string;
};

const statusClass: Record<Payment["verification_status"], string> = {
  VERIFIED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PENDING: "bg-slate-50 text-slate-600 border-slate-200",
  VERIFYING: "bg-blue-50 text-blue-700 border-blue-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
  MANUAL_REVIEW: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function PaymentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [studentId, setStudentId] = useState("");
  const [amount, setAmount] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    const [studentData, paymentData] = await Promise.all([
      get<Student[]>("/students"),
      get<Payment[]>("/payments"),
    ]);
    setStudents(Array.isArray(studentData) ? studentData : []);
    setPayments(Array.isArray(paymentData) ? paymentData : []);
    if (!studentId && studentData?.[0]) setStudentId(studentData[0].id);
  }

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== ROLES.ADMIN) {
      router.replace("/dashboard/admin");
      return;
    }
    load().catch((error) => setMessage(error.message || "Unable to load payments."));
  }, []);

  async function createPayment(event: React.FormEvent) {
    event.preventDefault();
    if (!studentId || !amount) return;
    setBusy(true);
    setMessage("");
    try {
      const payment = await post<Payment>("/payments", {
        student_id: studentId,
        expected_amount: Number(amount),
        ...(receiptUrl ? { receipt_url: receiptUrl } : {}),
      });
      setSelectedPayment(payment.id);
      setPayments((current) => [payment, ...current]);
      setAmount("");
      setReceiptUrl("");
      setMessage(payment.verification_message || "Payment record created.");
      await load();
    } catch (error: any) {
      setMessage(error.message || "Payment creation failed.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyImage(file: File) {
    if (!selectedPayment) {
      setMessage("Select a pending payment first.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const payment = await uploadFile<Payment>(
        `/payments/${selectedPayment}/verify-image`,
        file
      );
      setPayments((current) =>
        current.map((item) => (item.id === payment.id ? payment : item))
      );
      setMessage(payment.verification_message || "Receipt processed.");
      await load();
    } catch (error: any) {
      setMessage(error.message || "Screenshot verification failed.");
    } finally {
      setBusy(false);
    }
  }

  const verified = payments.filter((p) => p.verification_status === "VERIFIED");
  const pending = payments.filter((p) => p.verification_status === "PENDING" || p.verification_status === "VERIFYING");

  return (
    <main className="space-y-6 p-5 sm:p-7 lg:p-9">
      <section className="rounded-2xl border border-[#dbe5f0] bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#1267e8]">Finance</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-[#0b1f3a]">Payment Verification</h1>
            <p className="mt-1 text-sm text-[#64748b]">
              Verify school fee receipts against the provider record before marking a payment as verified.
            </p>
          </div>
          <div className="flex gap-2 text-xs">
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 font-bold text-emerald-700">{verified.length} verified</span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 font-bold text-slate-600">{pending.length} pending</span>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <form onSubmit={createPayment} className="rounded-2xl border border-[#dbe5f0] bg-white p-6 shadow-sm">
          <h2 className="text-base font-black text-[#0b1f3a]">Register payment</h2>
          <p className="mt-1 text-xs text-[#71849a]">A receipt URL is verified immediately. You can also create the record and verify a screenshot below.</p>

          <label className="mt-5 block text-xs font-bold text-[#475569]">Student</label>
          <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className="mt-2 w-full rounded-xl border border-[#cbd5e1] bg-white px-3 py-3 text-sm outline-none focus:border-[#1267e8]">
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.user?.full_name || student.student_number} — {student.student_number}
              </option>
            ))}
          </select>

          <label className="mt-4 block text-xs font-bold text-[#475569]">Expected amount (ETB)</label>
          <input required min="0.01" step="0.01" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="2500.00" className="mt-2 w-full rounded-xl border border-[#cbd5e1] px-3 py-3 text-sm outline-none focus:border-[#1267e8]" />

          <label className="mt-4 block text-xs font-bold text-[#475569]">Receipt URL <span className="font-normal text-[#94a3b8]">(optional)</span></label>
          <input type="url" value={receiptUrl} onChange={(e) => setReceiptUrl(e.target.value)} placeholder="https://transactioninfo..." className="mt-2 w-full rounded-xl border border-[#cbd5e1] px-3 py-3 text-sm outline-none focus:border-[#1267e8]" />

          <button disabled={busy || !studentId || !amount} className="mt-5 w-full rounded-xl bg-[#1267e8] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#0d5ccf] disabled:cursor-not-allowed disabled:opacity-50">
            {busy ? "Processing..." : "Register & verify"}
          </button>

          <div className="mt-5 rounded-xl border border-[#dbe5f0] bg-[#f8fbff] p-4">
            <p className="text-xs font-bold text-[#0b1f3a]">Screenshot verification</p>
            <p className="mt-1 text-[11px] leading-5 text-[#71849a]">Select a payment from the table, then upload its receipt screenshot. The bank/provider-confirmed result is used as the source of truth.</p>
            <select value={selectedPayment} onChange={(e) => setSelectedPayment(e.target.value)} className="mt-3 w-full rounded-lg border border-[#cbd5e1] bg-white px-2.5 py-2 text-xs">
              <option value="">Select payment</option>
              {payments.map((payment) => (
                <option key={payment.id} value={payment.id}>
                  {payment.student_name} — {payment.expected_amount} ETB
                </option>
              ))}
            </select>
            <input
              className="mt-3 block w-full text-xs text-[#64748b]"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={busy || !selectedPayment}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void verifyImage(file);
                e.currentTarget.value = "";
              }}
            />
          </div>

          {message && <div className="mt-4 rounded-xl border border-[#dbe5f0] bg-[#f8fbff] p-3 text-xs leading-5 text-[#475569]">{message}</div>}
        </form>

        <section className="overflow-hidden rounded-2xl border border-[#dbe5f0] bg-white shadow-sm">
          <div className="border-b border-[#e4ebf3] px-5 py-4">
            <h2 className="text-base font-black text-[#0b1f3a]">Payment history</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-xs">
              <thead className="bg-[#f8fbff] text-[10px] uppercase tracking-[0.12em] text-[#8294a8]">
                <tr>
                  <th className="px-5 py-3">Student</th>
                  <th className="px-5 py-3">Expected</th>
                  <th className="px-5 py-3">Verified</th>
                  <th className="px-5 py-3">Provider</th>
                  <th className="px-5 py-3">Reference</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-t border-[#edf2f7]">
                    <td className="px-5 py-4">
                      <p className="font-bold text-[#183651]">{payment.student_name}</p>
                      <p className="mt-0.5 text-[10px] text-[#8a9bad]">{payment.student_number}</p>
                    </td>
                    <td className="px-5 py-4 font-semibold text-[#334155]">{payment.expected_amount} ETB</td>
                    <td className="px-5 py-4 font-semibold text-[#334155]">{payment.amount ?? "—"} ETB</td>
                    <td className="px-5 py-4 text-[#475569]">{payment.provider ?? "—"}</td>
                    <td className="px-5 py-4 font-mono text-[10px] text-[#64748b]">{payment.receipt_reference ?? "—"}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusClass[payment.verification_status]}`}>
                        {payment.verification_status.replace("_", " ")}
                      </span>
                      {payment.verification_message && (
                        <p className="mt-1 max-w-[230px] text-[10px] leading-4 text-[#94a3b8]">{payment.verification_message}</p>
                      )}
                    </td>
                  </tr>
                ))}
                {!payments.length && (
                  <tr><td colSpan={6} className="px-5 py-14 text-center text-sm text-[#94a3b8]">No payments registered yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}
