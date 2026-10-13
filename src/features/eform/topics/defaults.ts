import type { JuristicProfile, TfacCorporate, TfacPerson } from "../api";
import { OTHER_TITLE, TITLE_OPTIONS } from "../constants";
import type { ServiceType } from "../constants";
import { deriveManagerConditions, resolveTitle, sumSpecialists, sumStaff, topicVisibility, type TopicValues } from "./schema";

/** Splits a stored title into the select value + free text (for titles not in the list). */
export function splitTitle(title: string) {
  return TITLE_OPTIONS.includes(title) ? { title, titleOther: "" } : { title: title ? OTHER_TITLE : "", titleOther: title };
}

const working = (p: TfacPerson) => (p.Is_FullTime === 1 ? "เต็มเวลา" : "บางเวลา");

/** Pre-fills the topics from the API data (port of setupAllOldAndNewValue in the original forms). */
export function topicDefaults(profile: JuristicProfile, corporate: TfacCorporate): TopicValues {
  const persons = (type: number) => corporate.person.filter((p) => p.Person_Type_ID === type);
  const staff = (type: number) => String(corporate.employee.find((e) => e.Person_Type_ID === type)?.Total ?? 0);
  const specialists = corporate.employee.filter((e) => e.Person_Type_ID === 11);
  const head = persons(2)[0];

  return {
    Manager_Check: true,
    Manager: [...new Map(profile.committees.map((c) => [`${c.title}:${c.firstName}:${c.lastName}`, c])).values()].map(
      (c) => ({
        title: c.title,
        name: c.firstName,
        lastName: c.lastName,
        nationality: "",
        citizenId: "",
        license: "",
        passport: "",
        isAuthorized: false,
      }),
    ),
    Accountant_Check: false,
    Accountant: persons(3).map((p) => ({
      ...splitTitle(p.Title_TH),
      name: p.First_Name_TH,
      lastName: p.Last_Name_TH,
      citizenId: p.ID_No,
      working: working(p),
    })),
    HeadOffice_Check: false,
    HeadOffice: {
      ...splitTitle(head?.Title_TH ?? ""),
      name: head?.First_Name_TH ?? "",
      lastName: head?.Last_Name_TH ?? "",
      numberAccount: head?.Accounting_No ?? "",
      citizenId: head?.ID_No ?? "",
      workingTime: head ? working(head) : "",
    },
    Examiner_Check: false,
    Examiner: persons(5).map((p) => ({
      ...splitTitle(p.Title_TH),
      name: p.First_Name_TH,
      lastName: p.Last_Name_TH,
      citizenId: p.ID_No,
      license: p.CPA_No,
      working: working(p),
    })),
    Beyond_Check: false,
    Beyond: {
      Lastdata: {
        AmountPartner: staff(6),
        AmountSeniorManager: staff(7),
        AmountManager: staff(8),
        AmountSenior: staff(9),
        AmountJunior: staff(10),
        AmountOther: String(specialists.reduce((sum, e) => sum + e.Total, 0)),
      },
      // The applicant enters the new numbers; starts at 0 like the original form.
      Editdata: { AmountPartner: "0", AmountSeniorManager: "0", AmountManager: "0", AmountSenior: "0", AmountJunior: "0" },
    },
    BeyondSpecialist: specialists.map((e) => ({ special: `${e.Position} ${e.Expert}`.trim(), total: String(e.Total) })),
  };
}

/** Topic part of the payload, in the original e-forms' field names (Manager[][Manager_Title] …). */
export function topicsPayload(input: TopicValues, serviceType?: ServiceType) {
  const v = serviceType ? topicVisibility(serviceType) : null;
  const values = v ? { ...input, Accountant_Check: v.accountant && input.Accountant_Check,
    HeadOffice_Check: v.headOffice && input.HeadOffice_Check, Examiner_Check: v.examiner && input.Examiner_Check,
    Beyond_Check: v.beyond && input.Beyond_Check } : input;
  const managers = deriveManagerConditions(values.Manager);
  const pass = (ok: boolean) => (ok ? "ผ่าน" : "");
  const editOther = sumSpecialists(values.BeyondSpecialist);

  return {
    Manager_Check: values.Manager_Check ? "1" : "0",
    Manager: values.Manager_Check
      ? values.Manager.map((r, i) => ({
          Manager_RunningNo: String(i + 1),
          Manager_Title: r.title,
          Manager_Name: r.name,
          Manager_LastName: r.lastName,
          Manager_Nationality: r.nationality,
          Manager_CitizenId: r.citizenId,
          Manager_License: r.license,
          Manager_Passport: r.passport,
          Manager_Manager: r.isAuthorized ? "1" : "",
        }))
      : [],
    Manager_TotalAmount: String(managers.totalAuthorized),
    conIdCardNation: pass(managers.conIdCardNation),
    conAudit: pass(managers.conAudit),
    conNumber: pass(managers.conNumber),
    Accountant_Check: values.Accountant_Check ? "1" : "0",
    Accountant: values.Accountant_Check
      ? values.Accountant.map((r, i) => ({
          Accountant_RunningNo: String(i + 1),
          Accountant_title: resolveTitle(r),
          Accountant_Name: r.name,
          Accountant_Lastname: r.lastName,
          Accountant_CitizenId: r.citizenId,
          Accountant_Working: r.working,
        }))
      : [],
    Accountant_TotalAmount: String(values.Accountant.length),
    HeadOffice_Check: values.HeadOffice_Check ? "1" : "0",
    HeadOffice: values.HeadOffice_Check
      ? {
          Title: resolveTitle(values.HeadOffice),
          Name: values.HeadOffice.name,
          Lastname: values.HeadOffice.lastName,
          NumberAccount: values.HeadOffice.numberAccount,
          CitizenId: values.HeadOffice.citizenId,
          WorkingTime: values.HeadOffice.workingTime,
          Person_Type_ID: "2",
        }
      : undefined,
    Examiner_Check: values.Examiner_Check ? "1" : "0",
    Examiner: values.Examiner_Check
      ? values.Examiner.map((r, i) => ({
          Examiner_RunningNo: String(i + 1),
          Examiner_Title: resolveTitle(r),
          Examiner_Name: r.name,
          Examiner_LastName: r.lastName,
          Examiner_CitizenId: r.citizenId,
          Examiner_License: r.license,
          Examiner_Working: r.working,
        }))
      : [],
    Examiner_TotalAmount: String(values.Examiner.length),
    Beyond_Check: values.Beyond_Check ? "1" : "0",
    Beyond: values.Beyond_Check
      ? {
          Lastdata: { ...values.Beyond.Lastdata, TotalAmount: String(sumStaff(values.Beyond.Lastdata)) },
          Editdata: {
            ...values.Beyond.Editdata,
            AmountOther: String(editOther),
            TotalAmount: String(sumStaff(values.Beyond.Editdata) + editOther),
          },
        }
      : undefined,
    BeyondSpecialist: values.Beyond_Check
      ? values.BeyondSpecialist.map((r, i) => ({
          BeyondSpecialist_RunningNo: String(i + 1),
          BeyondSpecialist_Special: r.special,
          BeyondSpecialist_Total: r.total,
        }))
      : [],
  };
}
