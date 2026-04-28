"use client";

import { useCallback, useId, useState } from "react";
import { JarvisButton } from "@/components/jarvis/JarvisButton";
import { JarvisCard } from "@/components/jarvis/JarvisCard";
import { JarvisInlineError } from "@/components/jarvis/JarvisInlineError";
import { formatLoadError } from "@/lib/utils/error-message";
import { useAsyncResource } from "@/lib/hooks/use-async-resource";
import {
  CURRENT_USER_ID,
  type ProfileMemoryV1,
  type UpdateProfileMemoryV1,
  fetchExplicitProfile,
  putExplicitProfile,
} from "@/lib/api/adapters/memory-center";
import styles from "./memory-center.module.css";

function lines(s: string): string[] {
  return s
    .split(/\r?\n/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function joinLines(arr: string[]): string {
  return arr.join("\n");
}

function toUpdate(from: ProfileMemoryV1): UpdateProfileMemoryV1 {
  return {
    coreInterests: [...from.coreInterests],
    secondaryInterests: [...from.secondaryInterests],
    goals: [...from.goals],
    preferences: from.preferences.map((p) => ({ ...p })),
    activeProjects: from.activeProjects.map((p) => ({ name: p.name, externalId: p.externalId ?? null })),
    skillLevels: from.skillLevels.map((s) => ({ name: s.name, level: s.level })),
  };
}

export function ProfileMemoryPanel() {
  const load = useCallback(() => fetchExplicitProfile(CURRENT_USER_ID), []);
  const res = useAsyncResource(load, "profile-memory");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [draft, setDraft] = useState<UpdateProfileMemoryV1 | null>(null);
  const [committed, setCommitted] = useState<UpdateProfileMemoryV1 | null>(null);

  const gId = useId();
  const cId = useId();
  const sId = useId();

  if (res.status === "loading") {
    return <p className={styles.muted}>Loading your profile memory…</p>;
  }
  if (res.status === "error") {
    return <JarvisInlineError title="Profile memory" message={formatLoadError(res.error)} />;
  }

  // Use the last committed save if available, otherwise fall back to the initial fetch
  const base = committed ?? toUpdate(res.data);
  const d = draft ?? base;

  const update = (next: UpdateProfileMemoryV1) => {
    setDraft(next);
    setSaved(false);
  };

  const onSave = async () => {
    setErr(null);
    setSaving(true);
    try {
      const updated = await putExplicitProfile(CURRENT_USER_ID, d);
      setCommitted(toUpdate(updated));
      setDraft(null);
      setSaved(true);
    } catch (e: unknown) {
      setErr(formatLoadError(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {err ? <JarvisInlineError title="Save failed" message={err} /> : null}
      <JarvisCard hover={false}>
        <h3 className={styles.h3}>You told us</h3>
        <p className={styles.lead}>
          This is what you&apos;ve said directly to the platform. It carries the most weight when personalizing
          your experience.
        </p>
        <div className={styles.field}>
          <label className={styles.label} htmlFor={gId}>
            Goals
          </label>
          <textarea
            id={gId}
            className={styles.textarea}
            value={joinLines(d.goals)}
            onChange={(e) => update({ ...d, goals: lines(e.target.value) })}
            rows={4}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor={cId}>
            Core interests
          </label>
          <textarea
            id={cId}
            className={styles.textarea}
            value={joinLines(d.coreInterests)}
            onChange={(e) => update({ ...d, coreInterests: lines(e.target.value) })}
            rows={3}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor={sId}>
            Secondary interests
          </label>
          <textarea
            id={sId}
            className={styles.textarea}
            value={joinLines(d.secondaryInterests)}
            onChange={(e) => update({ ...d, secondaryInterests: lines(e.target.value) })}
            rows={3}
          />
        </div>
        <JarvisButton
          type="button"
          variant="primary"
          label={saving ? "Saving…" : saved ? "Saved ✓" : "Save profile"}
          onClick={() => void onSave()}
        />
      </JarvisCard>
    </div>
  );
}
