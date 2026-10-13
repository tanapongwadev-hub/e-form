"use client";

import { InfoIcon } from "lucide-react";
import { FormNote } from "@/components/form/form-section";
import { BeyondSection } from "./beyond-section";
import { ManagerSection } from "./manager-section";
import { AccountantSection, ExaminerSection, HeadOfficeSection } from "./people-sections";
import { topicVisibility } from "./schema";
import { TOPIC_TEXT } from "./text";
import { TopicLockContext } from "./topic-block";
import type { ServiceType } from "../constants";

export function TopicsSection({ serviceType, locked = false }: { serviceType: ServiceType; locked?: boolean }) {
  const visibility = topicVisibility(serviceType);
  return <TopicLockContext value={locked}><div className="flex min-w-0 flex-col gap-4">
    <FormNote icon={InfoIcon} tone="info">{TOPIC_TEXT.changeTopicsNote}{locked && " เมื่อเปลี่ยนประเภทบริการ ต้องกรอกหัวข้อที่เกี่ยวข้องให้ครบ"}</FormNote>
    <ManagerSection visibility={visibility} />
    {visibility.accountant && <AccountantSection />}
    {visibility.headOffice && <HeadOfficeSection />}
    {visibility.examiner && <ExaminerSection />}
    {visibility.beyond && <BeyondSection />}
  </div></TopicLockContext>;
}
