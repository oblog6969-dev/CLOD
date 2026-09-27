import { decode, type State } from "./domain.ts";
import { deepEqual, mergeStates } from "./sync-logic.ts";

export type RemoteWorkspace = {
  revision: number;
  state: State;
  clientEditedAt: string | null;
};
export type PushResult =
  | { status: "ok"; revision: number }
  | { status: "conflict"; revision: number; state: State | null; clientEditedAt?: string | null };
export type SyncApi = {
  /** Current server revision, or null when the account has no workspace row yet. */
  fetchRevision(): Promise<number | null>;
  fetchWorkspace(): Promise<RemoteWorkspace | null>;
  push(state: State, baseRevision: number, clientEditedAt: string): Promise<PushResult>;
};
export type SyncStorage = {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
};
/**
 * editSeq/syncedSeq instead of a boolean so an edit made in another tab (or during an in-flight
 * push) is never cleared by a push that didn't include it.
 */
export type SyncMeta = {
  userId: string;
  baseRevision: number;
  editSeq: number;
  syncedSeq: number;
  lastEditAt: string | null;
};
export type ReconcileOutcome = "idle" | "pushed" | "pulled" | "merged" | "blocked";

export const META_KEY = "lifeos_sync_meta";
export const BASE_KEY = "lifeos_sync_base";
const MAX_CONFLICT_RETRIES = 3;

export function createSyncEngine(options: {
  userId: string;
  api: SyncApi;
  storage: SyncStorage;
  getLocal: () => State | null;
  applyLocal: (state: State) => boolean;
  now?: () => Date;
}) {
  const { userId, api, storage, getLocal, applyLocal } = options;
  const now = options.now ?? (() => new Date());

  const readMeta = (): SyncMeta => {
    try {
      const meta = JSON.parse(storage.get(META_KEY) ?? "null") as SyncMeta | null;
      if (meta && meta.userId === userId && Number.isFinite(meta.baseRevision)) return meta;
    } catch {
      // fall through to a fresh link
    }
    // First link on this device (or a different account): no common base, and whatever is
    // local counts as unsynced so it gets merged into the account rather than dropped.
    const fresh = { userId, baseRevision: 0, editSeq: 1, syncedSeq: 0, lastEditAt: null };
    storage.remove(BASE_KEY);
    storage.set(META_KEY, JSON.stringify(fresh));
    return fresh;
  };
  const writeMeta = (patch: Partial<SyncMeta>) =>
    storage.set(META_KEY, JSON.stringify({ ...readMeta(), ...patch }));
  const readBase = (): State | null => {
    try {
      const raw = storage.get(BASE_KEY);
      return raw ? decode(JSON.parse(raw)) : null;
    } catch {
      return null;
    }
  };
  const writeBase = (state: State) => storage.set(BASE_KEY, JSON.stringify(state));
  const isDirty = () => {
    const meta = readMeta();
    return meta.editSeq !== meta.syncedSeq;
  };

  readMeta();

  function noteLocalEdit() {
    const meta = readMeta();
    writeMeta({ editSeq: meta.editSeq + 1, lastEditAt: now().toISOString() });
  }

  /** Synchronous so no user edit can land between reading local and applying the merge. */
  function mergeInto(remote: State, remoteRevision: number, remoteEditedAt: string | null): boolean {
    const local = getLocal();
    if (!local) return false;
    const meta = readMeta();
    const preferLocal =
      !remoteEditedAt ||
      (meta.lastEditAt !== null && Date.parse(meta.lastEditAt) >= Date.parse(remoteEditedAt));
    const merged = mergeStates(readBase(), local, remote, preferLocal);
    if (!deepEqual(merged, local)) applyLocal(merged);
    writeBase(remote);
    const upToDate = deepEqual(merged, remote);
    writeMeta({
      baseRevision: remoteRevision,
      // A merge that differs from the server is itself an unsynced change.
      ...(upToDate ? { syncedSeq: meta.editSeq } : { editSeq: meta.editSeq + 1 }),
    });
    return true;
  }

  async function pushPending(merged: boolean): Promise<ReconcileOutcome> {
    for (let attempt = 0; attempt <= MAX_CONFLICT_RETRIES; attempt++) {
      const local = getLocal();
      if (!local) return "blocked";
      const meta = readMeta();
      if (meta.editSeq === meta.syncedSeq) return merged ? "merged" : "idle";
      const seqAtSend = meta.editSeq;
      const result = await api.push(local, meta.baseRevision, meta.lastEditAt ?? now().toISOString());
      if (result.status === "ok") {
        writeBase(local);
        writeMeta({ baseRevision: result.revision, syncedSeq: seqAtSend });
        return merged ? "merged" : "pushed";
      }
      if (!result.state) {
        // Row vanished server-side: start the account over from this device.
        storage.remove(BASE_KEY);
        writeMeta({ baseRevision: 0 });
        continue;
      }
      if (!mergeInto(result.state, result.revision, result.clientEditedAt ?? null)) return "blocked";
      merged = true;
    }
    throw new Error("Sync could not settle after repeated conflicting changes. It will retry.");
  }

  async function run(): Promise<ReconcileOutcome> {
    if (!getLocal()) return "blocked";
    const remoteRevision = (await api.fetchRevision()) ?? 0;
    if (remoteRevision === readMeta().baseRevision) return pushPending(false);
    const remote = remoteRevision === 0 ? null : await api.fetchWorkspace();
    if (!remote) {
      storage.remove(BASE_KEY);
      writeMeta({ baseRevision: 0 });
      return pushPending(false);
    }
    // Re-read after the await: an edit may have arrived while the request was in flight.
    const meta = readMeta();
    if (meta.editSeq === meta.syncedSeq && readBase()) {
      if (!applyLocal(remote.state)) return "blocked";
      writeBase(remote.state);
      writeMeta({ baseRevision: remote.revision });
      return "pulled";
    }
    if (!mergeInto(remote.state, remote.revision, remote.clientEditedAt)) return "blocked";
    return pushPending(true);
  }

  let running: Promise<ReconcileOutcome> | null = null;
  let again = false;
  /** Single-flight: overlapping calls share one pass, plus one follow-up pass if requested meanwhile. */
  function reconcile(): Promise<ReconcileOutcome> {
    if (running) {
      again = true;
      return running;
    }
    running = (async () => {
      try {
        let outcome: ReconcileOutcome;
        do {
          again = false;
          outcome = await run();
        } while (again);
        return outcome;
      } finally {
        running = null;
      }
    })();
    return running;
  }

  function reset() {
    storage.remove(META_KEY);
    storage.remove(BASE_KEY);
  }

  return { reconcile, noteLocalEdit, isDirty, reset };
}
