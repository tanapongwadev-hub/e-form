import type { SubmissionStatus } from "@/lib/submissions";

export type MonthlyReport = {
  /** Short Thai month label, e.g. "ต.ค. 69". */
  month: string;
  /** Full label for tooltips and the table, e.g. "ตุลาคม 2569". */
  monthFull: string;
  byStatus: Record<SubmissionStatus, number>;
  /** Average days from submission to decision for requests decided this month. */
  avgDays: number;
};

const MONTHS: [short: string, full: string][] = [
  ["พ.ย. 68", "พฤศจิกายน 2568"],
  ["ธ.ค. 68", "ธันวาคม 2568"],
  ["ม.ค. 69", "มกราคม 2569"],
  ["ก.พ. 69", "กุมภาพันธ์ 2569"],
  ["มี.ค. 69", "มีนาคม 2569"],
  ["เม.ย. 69", "เมษายน 2569"],
  ["พ.ค. 69", "พฤษภาคม 2569"],
  ["มิ.ย. 69", "มิถุนายน 2569"],
  ["ก.ค. 69", "กรกฎาคม 2569"],
  ["ส.ค. 69", "สิงหาคม 2569"],
  ["ก.ย. 69", "กันยายน 2569"],
  ["ต.ค. 69", "ตุลาคม 2569"],
];

// [approved, rejected, pending, new, avgDays] per month — older months are fully decided.
const RAW: [number, number, number, number, number][] = [
  [38, 6, 0, 0, 4.8],
  [42, 5, 0, 0, 4.5],
  [55, 9, 0, 0, 5.2],
  [61, 7, 0, 0, 4.9],
  [74, 10, 0, 0, 5.6],
  [58, 6, 0, 0, 4.4],
  [63, 8, 0, 0, 4.1],
  [70, 7, 1, 0, 3.9],
  [66, 9, 2, 0, 3.7],
  [72, 6, 3, 1, 3.5],
  [68, 8, 5, 6, 3.4],
  [41, 4, 7, 48, 3.2],
];

/** Last 12 months, oldest first. TODO: replace with the reports API. */
export const MOCK_MONTHLY: MonthlyReport[] = MONTHS.map(([month, monthFull], i) => {
  const [approved, rejected, pending, fresh, avgDays] = RAW[i];
  return { month, monthFull, byStatus: { approved, rejected, pending, new: fresh }, avgDays };
});

/** Share of requests per form over the last 12 months (applied to any period by ratio). */
export const MOCK_FORM_SHARE: { code: string; share: number }[] = [
  { code: "TFAC 68-001-3", share: 0.41 },
  { code: "TFAC 68-001-1", share: 0.27 },
  { code: "TFAC 68-001-2", share: 0.14 },
  { code: "TFAC 68-001-5", share: 0.11 },
  { code: "TFAC 68-001-4", share: 0.07 },
];
