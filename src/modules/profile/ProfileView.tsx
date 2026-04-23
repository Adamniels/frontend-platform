import type { UserProfile } from "@/lib/api/adapters/profile";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ErrorState } from "@/components/ui/ErrorState";
import styles from "./profile.module.css";

type ProfileViewProps = { profile: UserProfile } | { error: unknown };

export function ProfileView(props: ProfileViewProps) {
  if ("error" in props) {
    return (
      <>
        <SectionHeader title="Profile" description="User-facing profile (placeholder)." />
        <ErrorState error={props.error} />
      </>
    );
  }

  const { profile } = props;

  return (
    <>
      <SectionHeader title="Profile" description="User-facing profile (placeholder)." />
      <Card className={styles.card}>
        <CardHeader>Account</CardHeader>
        <CardBody>
          <dl className={styles.dl}>
            <dt>Display name</dt>
            <dd>{profile.displayName}</dd>
            <dt>Email</dt>
            <dd>{profile.email}</dd>
          </dl>
        </CardBody>
      </Card>
    </>
  );
}
