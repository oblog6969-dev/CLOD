"use client";
import { useSyncExternalStore } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { getSupabase } from "./supabase-client";
import { getLocalState, onLocalEdit, restore } from "./store";
import { decode, freshState, localDate, type State } from "./domain";
import { createSyncEngine, type SyncApi } from "./sync-engine";

const POLL_MS = 30_000;
const PUSH_DEBOUNCE_MS = 1_500;

export type SyncStatus =
  | "disabled"
  | "signed-out"
  | "sending-link"
  | "syncing"
  | "synced"
  | "pending"
  | "offline"
  | "blocked"
  | "error";

export type SyncSnapshot = {
  status: SyncStatus;
  email: string | null;
  error: string;
  lastSyncedAt: string | null;
  /** True after a pass that combined changes from this device and another one. */
  merged: boolean;
};

export type SnapshotEntry = { day: string; revision: number; savedAt: string };

const SERVER_SNAPSHOT: SyncSnapshot = {
  status: "disabled",
  email: null,
  error: "",
  lastSyncedAt: null,
  merged: false,
};

let snapshot: SyncSnapshot = SERVER_SNAPSHOT;
const listeners = new Set<() => void>();
function setSnapshot(patch: Partial<SyncSnapshot>) {
  snapshot = { ...snapshot, ...patch };
  listeners.forEach((fn) => fn());
}

function supabaseApi(client: SupabaseClient, userId: string): SyncApi {
  return {
    async fetchRevision() {
      const { data, error } = await client
        .from("workspaces")
        .select("revision")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return data ? Number(data.revision) : null;
    },
    async fetchWorkspace() {
      const { data, error } = await client
        .from("workspaces")
        .select("revision, state, client_edited_at")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        revision: Number(data.revision),
        state: decode(data.state),
        clientEditedAt: data.client_edited_at,
      };
    },
    async push(state, baseRevision, clientEditedAt) {
      const { data, error } = await client.rpc("sync_push", {
        p_state: state,
        p_base_revision: baseRevision,
        p_local_day: localDate(),
        p_client_edited_at: clientEditedAt,
      });
      if (error) throw error;
      const row = (Array.isArray(data) ? data[0] : data) as {
        status: "ok" | "conflict";
        revision: number;
        state: unknown;
        client_edited_at: string | null;
      };
      if (row.status === "ok") return { status: "ok", revision: Number(row.revision) };
      return {
        status: "conflict",
        revision: Number(row.revision),
        state: row.state ? decode(row.state) : null,
        clientEditedAt: row.client_edited_at,
      };
    },
  };
}

const browserStorage = {
  get: (key: string) => localStorage.getItem(key),
  set: (key: string, value: string) => localStorage.setItem(key, value),
  remove: (key: string) => localStorage.removeItem(key),
};

type Engine = ReturnType<typeof createSyncEngine>;
let client: SupabaseClient | null = null;
let engine: Engine | null = null;
let currentUserId: string | null = null;
let pushTimer: ReturnType<typeof setTimeout> | null = null;
let stopTriggers: (() => void) | null = null;

/** Serializes sync across tabs of the same browser so they don't race each other's pushes. */
async function withTabLock<T>(fn: () => Promise<T>): Promise<T> {
  if (typeof navigator === "undefined" || !navigator.locks) return fn();
  let result!: T;
  await navigator.locks.request("lifeos-sync", async () => {
    result = await fn();
  });
  return result;
}

async function syncNow() {
  const active = engine;
  if (!active) return;
  if (!navigator.onLine) {
    setSnapshot({ status: active.isDirty() ? "offline" : "synced" });
    return;
  }
  if (active.isDirty()) setSnapshot({ status: "syncing" });
  try {
    const outcome = await withTabLock(() => active.reconcile());
    if (engine !== active) return;
    if (outcome === "blocked") {
      setSnapshot({
        status: "blocked",
        error: "This device's saved data couldn't be opened, so sync is paused to protect your cloud copy.",
      });
      return;
    }
    setSnapshot({
      status: active.isDirty() ? "pending" : "synced",
      error: "",
      lastSyncedAt: new Date().toISOString(),
      merged: outcome === "merged" ? true : snapshot.merged,
    });
  } catch (reason) {
    if (engine !== active) return;
    setSnapshot({
      status: navigator.onLine ? "error" : "offline",
      error: reason instanceof Error ? reason.message : "Sync failed. It will retry.",
    });
  }
}

function startEngine(userId: string) {
  if (!client || currentUserId === userId) return;
  stopEngine();
  currentUserId = userId;
  engine = createSyncEngine({
    userId,
    api: supabaseApi(client, userId),
    storage: browserStorage,
    getLocal: getLocalState,
    applyLocal: (state) => restore(state, { backup: false, fromSync: true }),
  });
  const offEdit = onLocalEdit(() => {
    engine?.noteLocalEdit();
    if (snapshot.status === "synced") setSnapshot({ status: "pending" });
    if (pushTimer) clearTimeout(pushTimer);
    pushTimer = setTimeout(() => void syncNow(), PUSH_DEBOUNCE_MS);
  });
  const poll = setInterval(() => void syncNow(), POLL_MS);
  const onFocus = () => void syncNow();
  window.addEventListener("focus", onFocus);
  window.addEventListener("online", onFocus);
  stopTriggers = () => {
    offEdit();
    clearInterval(poll);
    window.removeEventListener("focus", onFocus);
    window.removeEventListener("online", onFocus);
  };
  void syncNow();
}

function stopEngine() {
  stopTriggers?.();
  stopTriggers = null;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = null;
  engine = null;
  currentUserId = null;
}

function handleSession(session: Session | null) {
  if (!session) {
    stopEngine();
    // Keep a failed magic-link message visible until the person requests a new link.
    const keepError = snapshot.status === "error" && snapshot.email === null;
    setSnapshot({
      status: keepError ? "error" : "signed-out",
      email: null,
      error: keepError ? snapshot.error : "",
      merged: false,
    });
    return;
  }
  setSnapshot({ email: session.user.email ?? null });
  startEngine(session.user.id);
}

let started = false;
/** Call once on app load so magic links are handled on any page and sync runs in the background. */
export function startSync() {
  if (started) return;
  started = true;
  client = getSupabase();
  if (!client) return;
  const hash = new URLSearchParams(window.location.hash.slice(1));
  const linkError = hash.get("error_description");
  setSnapshot({
    status: linkError ? "error" : "signed-out",
    error: linkError ? `${linkError}. Request a new sign-in link.` : "",
  });
  // Fires INITIAL_SESSION once Supabase has processed any magic-link tokens in the URL.
  client.auth.onAuthStateChange((event, session) => {
    if (event === "INITIAL_SESSION" && (hash.has("access_token") || linkError))
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    handleSession(session);
  });
}

export async function signInWithEmail(email: string): Promise<void> {
  if (!client) throw new Error("Sync is not configured.");
  setSnapshot({ status: "sending-link", error: "" });
  const { error } = await client.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin },
  });
  if (error) {
    setSnapshot({ status: "error", error: error.message });
    throw error;
  }
  setSnapshot({ status: "signed-out", error: "" });
}

/** True when this device holds edits the cloud hasn't received yet. */
export function hasUnsyncedChanges() {
  return engine?.isDirty() ?? false;
}

/** Try to push pending changes now (e.g. before signing out). */
export function flushSync() {
  return syncNow();
}

export async function signOutOfSync({ removeLocalData }: { removeLocalData: boolean }) {
  if (!client) return;
  const active = engine;
  await client.auth.signOut();
  active?.reset();
  if (removeLocalData) {
    restore(freshState(), { backup: false, fromSync: true });
    localStorage.removeItem("lifeos_backup_before_replace");
  }
}

export async function listSnapshots(): Promise<SnapshotEntry[]> {
  if (!client || !currentUserId) return [];
  const { data, error } = await client
    .from("workspace_snapshots")
    .select("day, revision, saved_at")
    .order("day", { ascending: false })
    .limit(400);
  if (error) throw error;
  return (data ?? []).map((row) => ({
    day: row.day,
    revision: Number(row.revision),
    savedAt: row.saved_at,
  }));
}

export async function loadSnapshot(day: string): Promise<State> {
  if (!client || !currentUserId) throw new Error("Sign in to use your history.");
  const { data, error } = await client
    .from("workspace_snapshots")
    .select("state")
    .eq("day", day)
    .single();
  if (error) throw error;
  return decode(data.state);
}

export function dismissMergeNotice() {
  setSnapshot({ merged: false });
}

export function useSync(): SyncSnapshot {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => snapshot,
    () => SERVER_SNAPSHOT,
  );
}
