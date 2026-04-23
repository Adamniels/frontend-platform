import type { UserSettings } from "@/lib/api/adapters/settings";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ErrorState } from "@/components/ui/ErrorState";
import styles from "./settings.module.css";

type SettingsViewProps = { settings: UserSettings } | { error: unknown };

export function SettingsView(props: SettingsViewProps) {
  if ("error" in props) {
    return (
      <>
        <SectionHeader title="Settings" description="Explicit preferences and product toggles." />
        <ErrorState error={props.error} />
      </>
    );
  }

  const { settings } = props;

  return (
    <>
      <SectionHeader title="Settings" description="Explicit preferences and product toggles." />
      <div className={styles.stack}>
        <Card>
          <CardHeader>Appearance</CardHeader>
          <CardBody>
            <dl className={styles.dl}>
              <dt>Theme</dt>
              <dd>{settings.theme}</dd>
            </dl>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>Notifications</CardHeader>
          <CardBody>
            <dl className={styles.dl}>
              <dt>Digest email</dt>
              <dd>{settings.digestEmail ? "On" : "Off"}</dd>
            </dl>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
