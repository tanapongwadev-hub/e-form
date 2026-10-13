/**
 * Data sources shared by the TFAC e-forms. Everything here is MOCKED for now.
 *
 * In the original e-form (eform-standalone-main) the data comes from:
 * - BizPortal profile: juristic person details + committee list (bootstrapData.profile)
 * - TFAC corporate API: GET https://api(-sandbox).tfac.or.th/v1/corporate/corporate/{jurId},
 *   proxied by the NestJS route /api/jurid/:value (window.jsonApiSAPA)
 *
 * TODO: replace the mock bodies with real calls; keep the return types.
 */
import { MOCK_JURISTIC_PROFILE, MOCK_TFAC_CORPORATE } from "./mock-data";
import type { ServiceType } from "./constants";

export type Committee = { title: string; firstName: string; lastName: string };

export type JuristicProfile = {
  juristicId: string;
  nameTh: string;
  nameEn: string;
  juristicType: string;
  registerCapital: string;
  registerDate: string; // ISO date
  email: string;
  committees: Committee[];
  registeredAddress: TfacAddress;
};

/** Shapes follow the TFAC corporate API response keys. */
export type TfacAddress = {
  Address_Type_ID: number; // 4 = address used for receipts
  Branch_Code: string;
  Address_Number: string;
  Moo: string;
  Village: string;
  Soi: string;
  Building_Name: string;
  Floor: string;
  Room?: string;
  Street: string;
  Sub_District: string;
  District: string;
  Province: string;
  Post_Code: string;
  Phone: string;
  Mobile_Phone: string;
  E_Mail: string;
};

export type TfacPerson = {
  /** 1 = committee, 2 = head of office, 3 = accountant, 5 = auditor */
  Person_Type_ID: number;
  Title_TH: string;
  First_Name_TH: string;
  Last_Name_TH: string;
  ID_No: string;
  CPA_No: string;
  Accounting_No: string;
  Is_FullTime: 0 | 1;
};

export type TfacEmployee = {
  /** 6 partner, 7 senior manager, 8 manager, 9 senior, 10 junior, 11 other specialist */
  Person_Type_ID: number;
  Position: string;
  Expert: string;
  Total: number;
};

/** Current collateral (res.guarantee in the original forms). Type IDs: 1 deposit, 2 card, 3 gov bond, 4 corp bond, 5 policy. */
export type TfacGuarantee = {
  Guarantee_Type_ID: number;
  Bank_Year?: string;
  Bank_Name?: string;
  Bank_Branch?: string;
  Bank_Account_Name?: string;
  Bank_Account_ID?: string;
  Bank_Due_Date?: string;
  Bond_Of?: string;
  Bond_No?: string;
  Bond_Date?: string;
  Bond_Due_Date?: string;
  Amount: string;
};

export type TfacCorporate = {
  data: {
    Registration_No: string;
    Name_TH: string;
    Name_EN: string;
    Business_Name: string;
    Capital: string;
    Corporate_Service_Name: ServiceType;
    Fiscal_Year_End_Date: string;
    Expired_Date: string;
    Accounting_Customer_Amount: string;
    Accounting_Customer_Income: string;
    Accounting_Customer_None_Amount: string;
    Accounting_Customer_None_Income: string;
    Auditoring_Customer_Amount: string;
    Auditoring_Customer_Income: string;
    Auditoring_Customer_None_Amount: string;
    Auditoring_Customer_None_Income: string;
  };
  address: TfacAddress[];
  person: TfacPerson[];
  guarantee: TfacGuarantee[];
  employee: TfacEmployee[];
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getJuristicProfile(): Promise<JuristicProfile> {
  await delay(300);
  return structuredClone(MOCK_JURISTIC_PROFILE);
}

/** `serviceType` overrides the mock's service type so every form variant can be demoed. */
export async function getTfacCorporate(juristicId: string, serviceType?: ServiceType): Promise<TfacCorporate> {
  await delay(400);
  const result = structuredClone(MOCK_TFAC_CORPORATE);
  result.data.Registration_No = juristicId;
  if (serviceType) result.data.Corporate_Service_Name = serviceType;
  return result;
}

export type SubmitResult = { referenceNo: string };

export async function submitApplication(formCode: string, payload: unknown): Promise<SubmitResult> {
  await delay(800);
  console.info(`[mock] submit ${formCode}`, payload);
  return { referenceNo: `TFAC-${Date.now().toString().slice(-8)}` };
}
