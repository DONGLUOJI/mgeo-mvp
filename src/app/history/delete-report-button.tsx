"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteReportButton({ taskId }: { taskId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm("确认删除这条检测记录吗？删除后不可恢复。");
    if (!confirmed) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/report/${taskId}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "删除失败");
      }

      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "删除失败");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        height: 48,
        padding: "0 20px",
        borderRadius: 14,
        border: "1px solid #ead6d6",
        background: "#ffffff",
        color: "#b42318",
        fontWeight: 700,
        cursor: deleting ? "not-allowed" : "pointer",
        opacity: deleting ? 0.6 : 1,
      }}
    >
      {deleting ? "删除中..." : "删除记录"}
    </button>
  );
}
