import type { JuristicProfile, TfacCorporate } from "@/features/eform/api";

// Fictional data for the mockup. Citizen IDs are checksum-valid but not real people.

export const MOCK_JURISTIC_PROFILE: JuristicProfile = {
  juristicId: "0105560123456",
  nameTh: "บริษัท ทดสอบการบัญชี จำกัด",
  nameEn: "TEST ACCOUNTING CO., LTD.",
  juristicType: "บริษัทจำกัด",
  registerCapital: "5,000,000.00",
  registerDate: "2017-03-15",
  email: "contact@test-accounting.co.th",
  committees: [
    { title: "นาย", firstName: "สมชาย", lastName: "ใจดี" },
    { title: "นางสาว", firstName: "สมหญิง", lastName: "รักงาน" },
    { title: "นาย", firstName: "John", lastName: "Smith" },
  ],
  registeredAddress: {
    Address_Type_ID: 1, Branch_Code: "00000", Address_Number: "99/9", Moo: "", Village: "",
    Soi: "สุขุมวิท 21", Building_Name: "อาคารทดสอบ", Floor: "12", Room: "1201", Street: "สุขุมวิท",
    Sub_District: "คลองเตยเหนือ", District: "วัฒนา", Province: "กรุงเทพมหานคร", Post_Code: "10110",
    Phone: "021234567", Mobile_Phone: "0812345678", E_Mail: "office@test-accounting.co.th",
  },
};

export const MOCK_TFAC_CORPORATE: TfacCorporate = {
  data: {
    Registration_No: "0105560123456",
    Name_TH: "บริษัท ทดสอบการบัญชี จำกัด",
    Name_EN: "TEST ACCOUNTING CO., LTD.",
    Business_Name: "บริษัทจำกัด",
    Capital: "5000000",
    Corporate_Service_Name: "ทำบัญชีและสอบบัญชี",
    Fiscal_Year_End_Date: "2025-12-31",
    Expired_Date: "2026-12-31",
    Accounting_Customer_Amount: "2",
    Accounting_Customer_Income: "600000",
    Accounting_Customer_None_Amount: "30",
    Accounting_Customer_None_Income: "1800000",
    Auditoring_Customer_Amount: "3",
    Auditoring_Customer_Income: "900000",
    Auditoring_Customer_None_Amount: "20",
    Auditoring_Customer_None_Income: "1200000",
  },
  address: [
    {
      Address_Type_ID: 1, Branch_Code: "00000", Address_Number: "88/8", Moo: "", Village: "",
      Soi: "สุขุมวิท 21", Building_Name: "อาคารเดิม", Floor: "10", Room: "1001", Street: "สุขุมวิท",
      Sub_District: "คลองเตยเหนือ", District: "วัฒนา", Province: "กรุงเทพมหานคร", Post_Code: "10110",
      Phone: "021234567", Mobile_Phone: "0812345678", E_Mail: "office@test-accounting.co.th",
    },
    {
      Address_Type_ID: 4,
      Branch_Code: "00000",
      Address_Number: "99/9",
      Moo: "",
      Village: "",
      Soi: "สุขุมวิท 21",
      Building_Name: "อาคารทดสอบ",
      Floor: "12",
      Street: "สุขุมวิท",
      Sub_District: "คลองเตยเหนือ",
      District: "วัฒนา",
      Province: "กรุงเทพมหานคร",
      Post_Code: "10110",
      Phone: "021234567",
      Mobile_Phone: "0812345678",
      E_Mail: "office@test-accounting.co.th",
    },
  ],
  person: [
    { Person_Type_ID: 2, Title_TH: "นาย", First_Name_TH: "วิชัย", Last_Name_TH: "ตรวจสอบ", ID_No: "3100600987659", CPA_No: "", Accounting_No: "12345", Is_FullTime: 1 },
    { Person_Type_ID: 3, Title_TH: "นางสาว", First_Name_TH: "มาลี", Last_Name_TH: "บัญชีดี", ID_No: "1103700123458", CPA_No: "", Accounting_No: "", Is_FullTime: 1 },
    { Person_Type_ID: 3, Title_TH: "นาย", First_Name_TH: "ประเสริฐ", Last_Name_TH: "งานละเอียด", ID_No: "5100100456782", CPA_No: "", Accounting_No: "", Is_FullTime: 0 },
    { Person_Type_ID: 5, Title_TH: "นาย", First_Name_TH: "วิชัย", Last_Name_TH: "ตรวจสอบ", ID_No: "3100600987659", CPA_No: "12345", Accounting_No: "", Is_FullTime: 1 },
    { Person_Type_ID: 5, Title_TH: "นาง", First_Name_TH: "อรุณี", Last_Name_TH: "สอบทาน", ID_No: "3401200678908", CPA_No: "67890", Accounting_No: "", Is_FullTime: 0 },
  ],
  guarantee: [
    {
      Guarantee_Type_ID: 1,
      Bank_Year: "12",
      Bank_Name: "ธนาคารกรุงเทพ",
      Bank_Branch: "สุขุมวิท 21",
      Bank_Account_Name: "บริษัท ทดสอบการบัญชี จำกัด",
      Bank_Account_ID: "1234567890",
      Bank_Due_Date: "2027-03-31",
      Amount: "150000.00",
    },
  ],
  employee: [
    { Person_Type_ID: 6, Position: "Partner", Expert: "", Total: 2 },
    { Person_Type_ID: 7, Position: "Senior Manager", Expert: "", Total: 1 },
    { Person_Type_ID: 8, Position: "Manager", Expert: "", Total: 3 },
    { Person_Type_ID: 9, Position: "Senior", Expert: "", Total: 5 },
    { Person_Type_ID: 10, Position: "Junior", Expert: "", Total: 8 },
    { Person_Type_ID: 11, Position: "ผู้เชี่ยวชาญ", Expert: "ภาษีอากร", Total: 2 },
    { Person_Type_ID: 11, Position: "ผู้เชี่ยวชาญ", Expert: "เทคโนโลยีสารสนเทศ", Total: 1 },
  ],
};
