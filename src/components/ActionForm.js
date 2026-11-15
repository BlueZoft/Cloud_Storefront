"use client";
import { useActionState } from "react";
export default function ActionForm({ action, children, submitLabel = "Submit", ...props }) {
  const [state, formAction, pending] = useActionState(action, {});
  return <form {...props} action={formAction}>
    {children}
    {state?.error && <p role="alert">{state.error}</p>}
    {state?.success && <p role="status">{state.success}</p>}
    <button type="submit" disabled={pending}>{pending ? "Working…" : submitLabel}</button>
  </form>;
}
