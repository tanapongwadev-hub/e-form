"use client";

import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { login } from "@/lib/auth/actions";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

export function LoginForm() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "", remember: false },
  });

  function onSubmit(values: LoginInput) {
    startTransition(async () => {
      const result = await login(values);
      if (result?.error) {
        toast.error(result.error);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">เข้าสู่ระบบ</CardTitle>
        <CardDescription>กรอกชื่อผู้ใช้และรหัสผ่านเพื่อเข้าใช้งานระบบ E-Form</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Controller
              name="username"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="username">ชื่อผู้ใช้</FieldLabel>
                  <Input
                    {...field}
                    id="username"
                    autoComplete="username"
                    aria-invalid={fieldState.invalid}
                    disabled={isPending}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="password">รหัสผ่าน</FieldLabel>
                  <Input
                    {...field}
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    aria-invalid={fieldState.invalid}
                    disabled={isPending}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="remember"
              control={form.control}
              render={({ field }) => (
                <Field orientation="horizontal">
                  <Checkbox
                    id="remember"
                    name={field.name}
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked)}
                    disabled={isPending}
                  />
                  <FieldLabel htmlFor="remember" className="font-normal">
                    จดจำการเข้าสู่ระบบ
                  </FieldLabel>
                </Field>
              )}
            />
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2Icon className="animate-spin" />}
              เข้าสู่ระบบ
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
