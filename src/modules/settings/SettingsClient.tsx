"use client";

import { useId, useLayoutEffect, useState } from "react";
import type { UserSettings } from "@/lib/api/adapters/settings";
import { JarvisButton } from "@/components/jarvis/JarvisButton";
import { JarvisCard } from "@/components/jarvis/JarvisCard";
import { applyAccentToDocument, readStoredAccent, writeStoredAccent } from "@/lib/theme/accent";
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

const ACCENTS = [
  { label: "Cyan", value: "#00d4ff" },
  { label: "Violet", value: "#a78bfa" },
  { label: "Green", value: "#34d399" },
  { label: "Red", value: "#ff6b6b" },
  { label: "Amber", value: "#fbbf24" },
  { label: "Pink", value: "#f472b6" },
];

type SettingsClientProps = { settings: UserSettings };

export function SettingsClient({ settings }: SettingsClientProps) {
  const brightnessRangeId = useId();
  const [curAccent, setCurAccent] = useState(() => readStoredAccent() ?? "#00d4ff");
  const [brightness, setBrightness] = useState(() => readStoredBrightness() ?? 60);
  const [scanLines, setScanLines] = useState(() => readStoredScanlines());
  const [hexGrid, setHexGrid] = useState(() => readStoredHexGrid());
  const [notifs, setNotifs] = useState({
    brief: true,
    sessions: true,
    input: true,
    memory: false,
  });

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
          <div className={styles.sectionTitle}>Accent color</div>
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
                    outline: curAccent === a.value ? "2px solid #fff" : "2px solid transparent",
                    boxShadow: curAccent === a.value ? `0 0 16px ${a.value}` : "none",
                  }}
                />
                <span className={styles.accentLabel}>{a.label}</span>
              </button>
            ))}
          </div>
        </JarvisCard>
        <JarvisCard hover={false} className={styles.card}>
          <div className={styles.sectionTitle}>Display</div>
          <div className={styles.row}>
            <span>Scan lines</span>
            <SettingsToggle on={scanLines} onChange={applyScanLines} />
          </div>
          <div className={styles.row}>
            <span>Hex grid background</span>
            <SettingsToggle on={hexGrid} onChange={applyHexGrid} />
          </div>
          <div className={styles.row}>
            <label htmlFor={brightnessRangeId}>HUD brightness</label>
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
        <JarvisCard hover={false} className={styles.card}>
          <div className={styles.sectionTitle}>Notifications</div>
          <div className={styles.row}>
            <span>Daily brief ready</span>
            <SettingsToggle on={notifs.brief} onChange={(v) => setNotifs((n) => ({ ...n, brief: v }))} />
          </div>
          <div className={styles.row}>
            <span>New sessions available</span>
            <SettingsToggle on={notifs.sessions} onChange={(v) => setNotifs((n) => ({ ...n, sessions: v }))} />
          </div>
          <div className={styles.row}>
            <span>Workflow needs input</span>
            <SettingsToggle on={notifs.input} onChange={(v) => setNotifs((n) => ({ ...n, input: v }))} />
          </div>
          <div className={styles.row}>
            <span>Memory updates</span>
            <SettingsToggle on={notifs.memory} onChange={(v) => setNotifs((n) => ({ ...n, memory: v }))} />
          </div>
        </JarvisCard>
        <JarvisCard hover={false} className={styles.cardMuted}>
          <p className={styles.serverNote}>
            Theme preference from server: <strong>{settings.theme}</strong>. Digest email:{" "}
            <strong>{settings.digestEmail ? "on" : "off"}</strong>.
          </p>
        </JarvisCard>
      </div>
      <div className={styles.side}>
        <JarvisCard hover={false} className={styles.card}>
          <div className={styles.accountRow}>
            <div className={styles.avatar}>OP</div>
            <div>
              <div className={styles.accountName}>Operator</div>
              <div className={styles.accountPlan}>Pro Plan</div>
            </div>
          </div>
          <JarvisButton label="Edit account" variant="ghost" className={styles.fullBtn} />
        </JarvisCard>
        <JarvisCard hover={false} className={styles.card}>
          <div className={styles.sectionTitle}>Data and privacy</div>
          {["Export my data", "Reset preferences", "Clear memory"].map((l) => (
            <div key={l} className={styles.privacyRow}>
              <span>{l}</span>
              <JarvisButton label="Open" variant="ghost" className={styles.miniBtn} />
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
