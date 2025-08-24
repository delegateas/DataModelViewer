type UpdateMode = "push" | "replace";

interface URLParts {
  /** e.g. "/inbox/42" (must be same-origin; you can't change domain/protocol/port) */
  path?: string;
  /** set value to null/undefined to remove a param */
  query?: Record<string, string | number | boolean | null | undefined>;
  /** e.g. "section-2" or "#section-2"; pass "" to clear; omit to leave unchanged */
  hash?: string;
  /** optional state object you want back on popstate */
  state?: unknown;
  /** optional document title (mostly ignored by browsers) */
  title?: string;
}

export function updateURL(
  { path, query, hash, state, title }: URLParts,
  mode: UpdateMode = "push"
): void {
  const url = new URL(window.location.href);

  if (typeof path === "string") {
    url.pathname = path.startsWith("/") ? path : `/${path}`;
  }

  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === null || v === undefined) url.searchParams.delete(k);
      else url.searchParams.set(k, String(v));
    }
  }

  if (hash !== undefined) {
    url.hash = hash ? (hash.startsWith("#") ? hash : `#${hash}`) : "";
  }

  const method = mode === "push" ? "pushState" : "replaceState";
  window.history[method](state ?? {}, title ?? "", url);
  if (title) document.title = title; // cross-browser title update
}
