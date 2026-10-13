"use client";

import { useState } from "react";
import { useForm, type Control, type DefaultValues, type FieldValues, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InboxIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const TH = "bg-muted px-3 py-3 font-semibold whitespace-nowrap";
const TD = "border-b px-3 py-3.5 align-middle group-last/row:border-0";
const DIALOG_BUTTON = "h-11 rounded-[10px] px-4 text-xs sm:h-[42px]";

export type ListColumn<T> = {
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
};

type ListEditorProps<T extends FieldValues> = {
  /** Used for the dialog title and the empty/add texts. */
  itemLabel: string;
  rows: T[];
  onChange: (rows: T[]) => void;
  columns: ListColumn<T>[];
  schema: z.ZodType<T>;
  emptyRow: T;
  renderFields: (control: Control<T>) => React.ReactNode;
  canAdd?: boolean;
  canRemove?: boolean;
  /** Label of the per-row edit button (e.g. "เพิ่มข้อมูล" for rows still missing data). */
  editLabel?: (row: T) => string;
  /** Display only: no add / edit / remove (e.g. data that comes from the API). */
  readOnly?: boolean;
  error?: string;
  invalid?: boolean;
};

/**
 * Rows edited through a dialog — replaces the original e-form's list-field
 * (table + Bootstrap modal). The dialog validates each row with its own schema.
 * Shows a table on wide screens and one card per row below `xl`.
 */
export function ListEditor<T extends FieldValues>({
  itemLabel,
  rows,
  onChange,
  columns,
  schema,
  emptyRow,
  renderFields,
  canAdd = true,
  canRemove = true,
  editLabel = () => "แก้ไขข้อมูล",
  readOnly = false,
  error,
  invalid,
}: ListEditorProps<T>) {
  // null = closed, -1 = adding, otherwise the edited row index
  const [editing, setEditing] = useState<number | null>(null);

  function save(row: T) {
    onChange(editing === -1 ? [...rows, row] : rows.map((r, i) => (i === editing ? row : r)));
    setEditing(null);
  }

  function remove(index: number) {
    onChange(rows.filter((_, i) => i !== index));
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        invalid && "rounded-[14px] bg-[#fff7f8] p-3 ring-1 ring-destructive/60 dark:bg-destructive/10",
      )}
      data-invalid={invalid || undefined}
    >
      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-[14px] border border-dashed border-[#d5e2f3] bg-muted/50 px-4 py-7 text-center text-xs text-muted-foreground dark:border-border">
          <span className="flex size-10 items-center justify-center rounded-xl bg-card text-primary shadow-[0_3px_9px_#163b6710]">
            <InboxIcon className="size-5" strokeWidth={1.7} />
          </span>
          <p>
            ไม่มีข้อมูล{itemLabel}ในขณะนี้
            {canAdd && (
              <>
                <br />
                คุณสามารถเพิ่มข้อมูลโดยคลิกที่ปุ่ม &quot;เพิ่ม{itemLabel}&quot;
              </>
            )}
          </p>
        </div>
      ) : (
        <>
          {/* Wide screens: table. w-0 + min-w-full keeps a wide table from stretching the form. */}
          <div className="hidden w-0 min-w-full overflow-x-auto xl:block">
            <table className="w-full border-separate border-spacing-0 text-xs">
              <thead>
                <tr className="text-left text-[11px] text-[#526d95] dark:text-muted-foreground">
                  <th className={cn(TH, "w-14 rounded-l-xl text-center")}>ลำดับ</th>
                  {columns.map((c, i) => (
                    <th key={c.header} className={cn(TH, readOnly && i === columns.length - 1 && "rounded-r-xl", c.className)}>
                      {c.header}
                    </th>
                  ))}
                  {!readOnly && (
                    <th className={cn(TH, "w-px rounded-r-xl")}>
                      <span className="sr-only">จัดการ</span>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="group/row hover:bg-muted/50">
                    <td className={cn(TD, "text-center text-muted-foreground tabular-nums")}>{i + 1}</td>
                    {columns.map((c) => (
                      <td key={c.header} className={cn(TD, c.className)}>
                        {c.cell(row) || <span className="text-muted-foreground">-</span>}
                      </td>
                    ))}
                    {!readOnly && (
                      <td className={TD}>
                        <RowActions
                          index={i}
                          label={editLabel(row)}
                          canRemove={canRemove}
                          onEdit={setEditing}
                          onRemove={remove}
                        />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Narrow screens: one card per row. */}
          <ul className="grid gap-3 md:grid-cols-2 xl:hidden">
            {rows.map((row, i) => (
              <li key={i} className="flex flex-col gap-3 rounded-[14px] border bg-card p-4 shadow-[0_3px_12px_#22487e08]">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-lg bg-secondary px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                    ลำดับที่ {i + 1}
                  </span>
                  {!readOnly && (
                    <RowActions
                      index={i}
                      label={editLabel(row)}
                      canRemove={canRemove}
                      onEdit={setEditing}
                      onRemove={remove}
                    />
                  )}
                </div>
                <dl className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-x-3 gap-y-1.5 text-xs">
                  {columns.map((c) => (
                    <div key={c.header} className="contents">
                      <dt className="text-muted-foreground">{c.header}</dt>
                      {/* Column alignment is for the table only; cards keep values left-aligned. */}
                      <dd className={cn("min-w-0 [overflow-wrap:anywhere]", c.className?.includes("tabular-nums") && "tabular-nums")}>
                        {c.cell(row) || <span className="text-muted-foreground">-</span>}
                      </dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ul>
        </>
      )}

      {canAdd && !readOnly && (
        <Button
          type="button"
          variant="outline"
          className="h-10 self-start rounded-[10px] border-dashed border-primary/40 bg-secondary/60 px-4 text-xs text-primary hover:bg-secondary hover:text-primary"
          onClick={() => setEditing(-1)}
        >
          <PlusIcon />
          เพิ่ม{itemLabel}
        </Button>
      )}

      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="gap-5 rounded-[22px] p-6 sm:max-w-2xl">
          {editing !== null && (
            <RowForm
              key={editing}
              title={itemLabel}
              runningNo={editing === -1 ? rows.length + 1 : editing + 1}
              initial={editing === -1 ? emptyRow : rows[editing]}
              schema={schema}
              renderFields={renderFields}
              submitLabel={editing === -1 ? "เพิ่มข้อมูล" : "บันทึก"}
              onCancel={() => setEditing(null)}
              onSave={save}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RowActions({
  index,
  label,
  canRemove,
  onEdit,
  onRemove,
}: {
  index: number;
  label: string;
  canRemove: boolean;
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="flex shrink-0 justify-end gap-1">
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-8 rounded-lg px-2.5 text-xs text-primary hover:bg-secondary hover:text-primary"
        onClick={() => onEdit(index)}
      >
        <PencilIcon />
        {label}
      </Button>
      {canRemove && (
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          className="size-8 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
          aria-label={`ลบรายการที่ ${index + 1}`}
          onClick={() => onRemove(index)}
        >
          <Trash2Icon />
        </Button>
      )}
    </div>
  );
}

function RowForm<T extends FieldValues>({
  title,
  runningNo,
  initial,
  schema,
  renderFields,
  submitLabel,
  onCancel,
  onSave,
}: {
  title: string;
  runningNo: number;
  initial: T;
  schema: z.ZodType<T>;
  renderFields: (control: Control<T>) => React.ReactNode;
  submitLabel: string;
  onCancel: () => void;
  onSave: (row: T) => void;
}) {
  const form = useForm<T>({
    resolver: zodResolver(schema as never) as unknown as Resolver<T>,
    defaultValues: initial as DefaultValues<T>,
  });

  return (
    // Nested inside the main <form> in the DOM tree via portal, so stop the submit from bubbling.
    <form
      noValidate
      onSubmit={(e) => {
        e.stopPropagation();
        void form.handleSubmit(onSave)(e);
      }}
      className="flex flex-col gap-5"
    >
      <DialogHeader className="flex-row items-center gap-3">
        <span className="flex size-[39px] shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
          <PencilIcon className="size-[18px]" strokeWidth={1.7} />
        </span>
        <div className="flex flex-col gap-0.5">
          <DialogTitle className="text-base">{title}</DialogTitle>
          <DialogDescription className="text-[11px]">ลำดับที่ {runningNo}</DialogDescription>
        </div>
      </DialogHeader>
      <div className="-mx-1 max-h-[60vh] overflow-y-auto px-1 pb-1">{renderFields(form.control)}</div>
      <DialogFooter className="-mx-6 -mb-6 rounded-b-[22px] px-6">
        <Button type="button" variant="outline" className={DIALOG_BUTTON} onClick={onCancel}>
          ยกเลิก
        </Button>
        <Button type="submit" className={DIALOG_BUTTON}>
          {submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}
