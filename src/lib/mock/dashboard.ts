import type { Submission, SubmissionDetail, TimelineStep } from "@/lib/submissions";

export const MOCK_STATS = {
  forms: 12,
  newSubmissions: 48,
  pending: 7,
  approved: 156,
};

/** Newest first. */
export const MOCK_SUBMISSIONS: Submission[] = [
  { id: "REQ-0156", form: "TFAC 68-001-1", applicant: "บริษัท ตัวอย่าง จำกัด", submittedAt: "09/10/2569 10:24", status: "new" },
  { id: "REQ-0155", form: "TFAC 68-001-2", applicant: "ห้างหุ้นส่วน สมมติ", submittedAt: "09/10/2569 09:12", status: "pending" },
  { id: "REQ-0154", form: "TFAC 68-001-3", applicant: "บริษัท ทดสอบ จำกัด (มหาชน)", submittedAt: "08/10/2569 16:40", status: "approved" },
  { id: "REQ-0153", form: "TFAC 68-001-1", applicant: "บริษัท เดโม่ จำกัด", submittedAt: "08/10/2569 14:05", status: "rejected" },
  { id: "REQ-0152", form: "TFAC 68-001-5", applicant: "บริษัท ม็อกอัพ จำกัด", submittedAt: "08/10/2569 11:30", status: "approved" },
  { id: "REQ-0151", form: "TFAC 68-001-3", applicant: "บริษัท สำนักงานบัญชีตัวอย่าง จำกัด", submittedAt: "07/10/2569 15:52", status: "pending" },
  { id: "REQ-0150", form: "TFAC 68-001-4", applicant: "ห้างหุ้นส่วนจำกัด ทดลองระบบ", submittedAt: "07/10/2569 13:18", status: "new" },
  { id: "REQ-0149", form: "TFAC 68-001-3", applicant: "บริษัท สอบบัญชีสาธิต จำกัด", submittedAt: "07/10/2569 10:02", status: "approved" },
  { id: "REQ-0148", form: "TFAC 68-001-2", applicant: "บริษัท ข้อมูลจำลอง จำกัด", submittedAt: "06/10/2569 16:27", status: "approved" },
  { id: "REQ-0147", form: "TFAC 68-001-1", applicant: "บริษัท ต้นแบบดิจิทัล จำกัด", submittedAt: "06/10/2569 11:45", status: "pending" },
  { id: "REQ-0146", form: "TFAC 68-001-5", applicant: "ห้างหุ้นส่วน ตัวอย่างการบัญชี", submittedAt: "05/10/2569 14:33", status: "rejected" },
  { id: "REQ-0145", form: "TFAC 68-001-3", applicant: "บริษัท บัญชีทดสอบ (ประเทศไทย) จำกัด", submittedAt: "05/10/2569 09:20", status: "new" },
  { id: "REQ-0144", form: "TFAC 68-001-4", applicant: "บริษัท สมมติการเงิน จำกัด", submittedAt: "04/10/2569 15:08", status: "approved" },
  { id: "REQ-0143", form: "TFAC 68-001-1", applicant: "บริษัท ทดลองใช้งาน จำกัด", submittedAt: "04/10/2569 10:41", status: "approved" },
];

export const MOCK_RECENT_SUBMISSIONS = MOCK_SUBMISSIONS.slice(0, 5);

const SERVICE_TYPES = ["ทำบัญชี", "สอบบัญชี", "ทำบัญชีและสอบบัญชี"];

type Decision = { status: "approved" | "rejected"; remark: string; decidedAt: string };

/** Decisions made in this server process (in-memory; reset on restart or when this file reloads). */
const decisions = new Map<string, Decision>();

const dateTime = new Intl.DateTimeFormat("th-TH-u-ca-buddhist", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** Mock of the "approve/reject request" API. Returns false when the request is missing or already decided. */
export function decideMockSubmission(id: string, status: Decision["status"], remark: string): boolean {
  const submission = MOCK_SUBMISSIONS.find((s) => s.id === id);
  if (!submission || submission.status === "approved" || submission.status === "rejected") return false;
  submission.status = status;
  decisions.set(id, { status, remark, decidedAt: dateTime.format(new Date()).replace(",", "") });
  return true;
}

/** Builds a believable detail record for a mock request (deterministic per id). */
export function getMockSubmissionDetail(id: string): SubmissionDetail | null {
  const base = MOCK_SUBMISSIONS.find((s) => s.id === id);
  if (!base) return null;

  const n = Number(base.id.replace(/\D/g, ""));
  const [date] = base.submittedAt.split(" ");
  const decided = base.status === "approved" || base.status === "rejected";
  const decision = decisions.get(base.id);

  const timeline: TimelineStep[] = [
    { label: "ยื่นคำขอ", state: "done", at: base.submittedAt, note: "ส่งผ่านระบบ Biz Portal" },
    {
      label: "รับเรื่องและตรวจสอบเอกสาร",
      state: base.status === "new" ? "current" : "done",
      at: base.status === "new" ? undefined : `${date} 16:30`,
    },
    {
      label: "พิจารณาคำขอ",
      state: base.status === "pending" ? "current" : decided ? "done" : "upcoming",
      at: decision?.decidedAt ?? (decided ? `${date} 17:45` : undefined),
    },
    {
      label: base.status === "rejected" ? "ไม่อนุมัติ" : base.status === "approved" ? "อนุมัติแล้ว" : "แจ้งผลการพิจารณา",
      state: base.status === "rejected" ? "rejected" : base.status === "approved" ? "done" : "upcoming",
      at: decision?.decidedAt ?? (decided ? `${date} 18:00` : undefined),
    },
  ];

  return {
    ...base,
    juristicId: `0105${String(560000000 + n * 7919).slice(0, 9)}`,
    serviceType: SERVICE_TYPES[n % SERVICE_TYPES.length],
    email: `contact${n}@example.com`,
    phone: `08${String(10000000 + n * 1234).slice(0, 8)}`,
    channel: "Biz Portal",
    attachments: [
      { name: "หนังสือรับรองการจดทะเบียนนิติบุคคล.pdf", size: "1.2 MB" },
      { name: "สำเนาบัตรประชาชนกรรมการ.pdf", size: "640 KB" },
      ...(n % 2 ? [{ name: "เอกสารอื่น ๆ.zip", size: "3.4 MB" }] : []),
    ],
    timeline,
    remark: decision
      ? decision.remark || undefined
      : base.status === "rejected"
        ? "หนังสือรับรองการจดทะเบียนนิติบุคคลมีอายุเกิน 3 เดือน กรุณายื่นคำขอใหม่พร้อมเอกสารฉบับปัจจุบัน"
        : base.status === "approved"
          ? "เอกสารครบถ้วน อนุมัติตามคำขอ"
          : undefined,
  };
}
