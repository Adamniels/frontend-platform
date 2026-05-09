"use client";

import { useRouter } from "next/navigation";
import { useId, useLayoutEffect, useState } from "react";
import type { UserSettings } from "@/lib/api/adapters/settings";
import { JarvisButton } from "@/components/jarvis/JarvisButton";
import { JarvisCard } from "@/components/jarvis/JarvisCard";
import { PLATFORM_LIGHT_ACCENT, applyAccentToDocument, readStoredAccent, writeStoredAccent } from "@/lib/theme/accent";
import {
  applyBrightnessToDocument,
  readStoredBrightness,
  writeStoredBrightness,
} from "@/lib/theme/brightness";
import {
  applyHexGridToDocument,
  applyScanlinesToDocument,
  readStoredHexGrid,
  readStoredScanlines,
  writeStoredHexGrid,
  writeStoredScanlines,
} from "@/lib/theme/display";
import { SettingsToggle } from "./SettingsToggle";
import styles from "./settings-experience.module.css";

const ACCENTS = [{ label: "Default teal", value: PLATFORM_LIGHT_ACCENT }];

type SettingsClientProps = { settings: UserSettings };

export function SettingsClient({ settings }: SettingsClientProps) {
  const router = useRouter();
  const brightnessRangeId = useId();
  const [curAccent, setCurAccent] = useState(() => readStoredAccent() ?? PLATFORM_LIGHT_ACCENT);
  const [brightness, setBrightness] = useState(() => readStoredBrightness() ?? 60);
  const [scanLines, setScanLines] = useState(() => readStoredScanlines());
  const [hexGrid, setHexGrid] = useState(() => readStoredHexGrid());

  useLayoutEffect(() => {
    applyAccentToDocument(curAccent);
    applyBrightnessToDocument(brightness);
    applyScanlinesToDocument(scanLines);
    applyHexGridToDocument(hexGrid);
  }, [curAccent, brightness, scanLines, hexGrid]);

  const applyAccent = (color: string) => {
    setCurAccent(color);
    applyAccentToDocument(color);
    writeStoredAccent(color);
  };

  const applyBrightness = (v: number) => {
    setBrightness(v);
    applyBrightnessToDocument(v);
    writeStoredBrightness(v);
  };

  const applyScanLines = (enabled: boolean) => {
    setScanLines(enabled);
    applyScanlinesToDocument(enabled);
    writeStoredScanlines(enabled);
  };

  const applyHexGrid = (enabled: boolean) => {
    setHexGrid(enabled);
    applyHexGridToDocument(enabled);
    writeStoredHexGrid(enabled);
  };

  return (
    <div className={`${styles.layout} screenEnter`}>
      <div className={styles.main}>
        <h2 className={styles.h2}>Settings</h2>
        <JarvisCard hover={false} className={styles.card}>
          <div className={styles.sectionTitle}>Account (from server)</div>
          <p className={styles.sectionLead}>
            Values from <code className={styles.inlineCode}>GET /api/v1/settings</code>. Updating them in the UI is
            not wired yet—use your account tools or a future settings API.
          </p>
          <div className={styles.serverKv}>
            <span className={styles.serverKvLabel}>Theme</span>
            <span className={styles.serverKvVal}>{settings.theme}</span>
          </div>
          <div className={styles.serverKv}>
            <span className={styles.serverKvLabel}>Digest email</span>
            <span className={styles.serverKvVal}>{settings.digestEmail ? "On" : "Off"}</span>
          </div>
        </JarvisCard>
        <JarvisCard hover={false} className={styles.card}>
          <div className={styles.sectionTitle}>On this device</div>
          <p className={styles.sectionLead}>
            Accent, scan lines, grid, and brightness are stored in <strong>localStorage</strong> only—they are not
            sent to the server.
          </p>
          <div className={styles.subSectionTitle}>Accent color</div>
          <div className={styles.accentRow}>
            {ACCENTS.map((a) => (
              <button
                key={a.value}
                type="button"
                className={styles.accentBtn}
                onClick={() => applyAccent(a.value)}
                aria-label={a.label}
              >
                <span
                  className={styles.swatch}
                  style={{
                    background: a.value,
                    outline: curAccent === a.value ? "2px solid var(--color-text)" : "2px solid transparent",
                    boxShadow:
                      curAccent === a.value ? `0 8px 18px color-mix(in srgb, ${a.value} 30%, transparent)` : "none",
                  }}
                />
                <span className={styles.accentLabel}>{a.label}</span>
              </button>
            ))}
          </div>
          <div className={styles.subSectionTitle}>Display effects</div>
          <div className={styles.row}>
            <span>Scan lines overlay</span>
            <SettingsToggle on={scanLines} onChange={applyScanLines} />
          </div>
          <div className={styles.row}>
            <span>Background grid</span>
            <SettingsToggle on={hexGrid} onChange={applyHexGrid} />
          </div>
          <div className={styles.row}>
            <label htmlFor={brightnessRangeId}>Content brightness</label>
            <div className={styles.brightness}>
              <input
                id={brightnessRangeId}
                type="range"
                min={20}
                max={100}
                value={brightness}
                onChange={(e) => applyBrightness(Number(e.target.value))}
                className={styles.range}
                aria-valuemin={20}
                aria-valuemax={100}
                aria-valuenow={brightness}
                aria-valuetext={`${brightness}%`}
              />
              <span className={styles.brightnessVal} aria-hidden>
                {brightness}%
              </span>
            </div>
          </div>
        </JarvisCard>
        <JarvisCard hover={false} className={styles.cardMuted}>
          <div className={styles.sectionTitle}>Notifications</div>
          <p className={styles.placeholderBody}>
            There is no notifications or push-preferences API on <code className={styles.inlineCode}>/api/v1</code>{" "}
            yet. Email digest is the only server-backed preference today (see Account above). In-app alerts will
            appear here when the backend supports them.
          </p>
        </JarvisCard>
      </div>
      <div className={styles.side}>
        <JarvisCard hover={false} className={styles.card}>
          <div className={styles.accountRow}>
            <div className={styles.avatar}>OP</div>
            <div>
              <div className={styles.accountName}>Operator</div>
              <div className={styles.accountPlan}>Session</div>
            </div>
          </div>
          <JarvisButton
            label="Open profile"
            variant="ghost"
            className={styles.fullBtn}
            onClick={() => router.push("/profile")}
          />
        </JarvisCard>
        <JarvisCard hover={false} className={styles.card}>
          <div className={styles.sectionTitle}>Data and privacy</div>
          <p className={styles.sectionLead}>These actions are not connected to an API yet.</p>
          {["Export my data", "Reset preferences", "Clear memory"].map((l) => (
            <div key={l} className={styles.privacyRow}>
              <span>{l}</span>
              <span className={styles.unavailablePill} title="Not implemented">
                Unavailable
              </span>
            </div>
          ))}
        </JarvisCard>
        <JarvisCard hover={false} className={styles.card}>
          <div className={styles.metaGrid}>
            {[
              ["Build", "2026.04.23"],
              ["Version", "v0.1.0"],
              ["Status", "Nominal"],
            ].map(([k, v]) => (
              <div key={k} className={styles.metaRow}>
                <span>{k}</span>
                <span className={k === "Status" ? styles.ok : styles.metaVal}>{v}</span>
              </div>
            ))}
          </div>
        </JarvisCard>
      </div>
    </div>
  );
}
