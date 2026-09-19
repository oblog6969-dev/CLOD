"use client";
import { useSyncExternalStore } from "react";
import { decode, freshState, localDate, type State } from "./domain";
const KEY = "lifeos_v2";
const LEGACY = "life_os_state_v1";
let snapshot: {
  state: State;
  date: string;
  error: string;
  blocked: boolean;
} | null = null;
const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((fn) => fn());
}
function initialize() {
  if (snapshot) return;
  try {
    const raw = localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY);
    snapshot = {
      state: raw ? decode(JSON.parse(raw)) : freshState(),
      date: localDate(),
      error: "",
      blocked: false,
    };
  } catch {
    snapshot = {
      state: freshState(),
      date: localDate(),
      error:
        "Your saved data could not be opened. Export the original data below before restoring a backup or starting fresh.",
      blocked: true,
    };
  }
}
function refresh() {
  initialize();
  if (snapshot && snapshot.date !== localDate()) {
    snapshot = { ...snapshot, date: localDate() };
    emit();
  }
}
function subscribe(fn: () => void) {
  listeners.add(fn);
  initialize();
  fn();
  const sync = (event: StorageEvent) => {
    if (event.key === KEY || event.key === null) {
      snapshot = null;
      initialize();
      emit();
    }
  };
  window.addEventListener("storage", sync);
  window.addEventListener("focus", refresh);
  const timer = window.setInterval(refresh, 30000);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", sync);
    window.removeEventListener("focus", refresh);
    clearInterval(timer);
  };
}
export function useLifeOS() {
  return useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => null,
  );
}
export function update(transform: (state: State) => State): boolean {
  initialize();
  if (!snapshot || snapshot.blocked) return false;
  try {
    const raw = localStorage.getItem(KEY);
    const state = decode(
      transform(raw ? decode(JSON.parse(raw)) : snapshot.state),
    );
    localStorage.setItem(KEY, JSON.stringify(state));
    snapshot = { state, date: localDate(), error: "", blocked: false };
    emit();
    return true;
  } catch {
    snapshot = {
      ...snapshot,
      error:
        "Changes could not be saved. Your last saved data is intact. Export a backup or free browser storage before trying again.",
    };
    emit();
    return false;
  }
}
export function restore(state: State): boolean {
  initialize();
  try {
    const checked = decode(state);
    const old = localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY);
    if (old) localStorage.setItem("lifeos_backup_before_replace", old);
    localStorage.setItem(KEY, JSON.stringify(checked));
    snapshot = { state: checked, date: localDate(), error: "", blocked: false };
    emit();
    return true;
  } catch {
    if (snapshot)
      snapshot = {
        ...snapshot,
        error: "Replacement could not be saved. Existing data has been kept.",
      };
    emit();
    return false;
  }
}
export function download(
  content: string,
  filename: string,
  type = "application/json",
) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function exportOriginal() {
  download(
    localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY) ?? "{}",
    "lifeos-original.json",
  );
}
export function exportLegacy() {
  const raw = localStorage.getItem(LEGACY);
  if (!raw) throw new Error("There is no legacy workspace on this device.");
  download(raw, "lifeos-legacy-v1.json");
}
export function recoverBackup() {
  const raw = localStorage.getItem("lifeos_backup_before_replace");
  if (!raw) throw new Error("No previous backup is available yet.");
  return restore(decode(JSON.parse(raw)));
}
