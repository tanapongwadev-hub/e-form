const COPYRIGHT_YEAR = 2026;
const APP_VERSION = "0.1.0";

export function Footer() {
  return (
    <footer className="flex flex-col gap-1 px-4 py-4 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <p>© {COPYRIGHT_YEAR} สภาวิชาชีพบัญชี ในพระบรมราชูปถัมภ์</p>
      <p>E-Form TFAC v{APP_VERSION}</p>
    </footer>
  );
}
