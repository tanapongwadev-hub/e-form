/**
 * Drafts saved in this browser only (localStorage). Values are stored without `attachments`,
 * because uploaded files must be uploaded again.
 */

export type Draft<V> = {
  version: number;
  savedAt: string;
  values: V;
};

/** One draft per form and scope (e.g. juristic ID + service type, since the schema can differ by variant). */
export function draftKey(formCode: string, scope: string) {
  return `eform-draft:${formCode}:${scope}`;
}

/** Saves to this browser only; returns null when storage is blocked or full. */
export function saveDraft<V extends object>(key: string, version: number, values: V): Draft<Partial<V>> | null {
  const stored: Partial<V> & { attachments?: unknown } = { ...values };
  delete stored.attachments;
  const draft = { version, savedAt: new Date().toISOString(), values: stored as Partial<V> };
  try {
    localStorage.setItem(key, JSON.stringify(draft));
    return draft;
  } catch {
    return null;
  }
}

/** Raw stored draft (a stable string, safe as a useSyncExternalStore snapshot). */
export function readDraftRaw(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Parses a stored draft; drafts from an older `version` of the form are ignored. */
export function parseDraft<V>(raw: string | null, version: number): Draft<Partial<V>> | null {
  if (!raw) return null;
  try {
    const draft = JSON.parse(raw) as Draft<Partial<V>>;
    return draft?.version === version && draft.values && typeof draft.values === "object" ? draft : null;
  } catch {
    return null;
  }
}

/** Re-reads drafts when another tab changes storage. */
export function subscribeDrafts(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

export function clearDraft(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Storage is optional; nothing to clean up.
  }
}

const timeFormat = new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short" });

export function formatSavedAt(iso: string) {
  return timeFormat.format(new Date(iso));
}
