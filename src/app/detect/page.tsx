import { getServerSession } from "next-auth";

import { DetectForm } from "@/components/detect/DetectForm";
import { authOptions } from "@/lib/auth/auth-options";
import { getDetectQuotaStatus } from "@/lib/db/repository";

export default async function DetectPage() {
  const session = await getServerSession(authOptions);
  const quota = session?.user?.id ? await getDetectQuotaStatus(session.user.id) : null;

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <DetectForm quota={quota} />
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f6f8fb",
    padding: "44px 20px 80px",
  },
  container: {
    maxWidth: 1040,
    margin: "0 auto",
  },
};
