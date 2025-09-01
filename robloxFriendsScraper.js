// NO-CSV BUILD
(async () => {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  function getUserIdFromUrl() {
    const m = location.pathname.match(/\/users\/(\d+)\//);
    if (!m) throw new Error("Could not parse userId from URL.");
    return m[1];
  }

  async function fetchJson(url, opts = {}) {
    const res = await fetch(url, {
      method: "GET",
      credentials: "include",
      ...opts,
      headers: {
        "Accept": "application/json, text/plain, */*",
        ...(opts.headers || {})
      }
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}\n${text}`);
    }
    return res.json();
  }

  async function postJson(url, body, opts = {}) {
    const res = await fetch(url, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify(body),
      ...opts,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json, text/plain, */*",
        ...(opts.headers || {})
      }
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}\n${text}`);
    }
    return res.json();
  }

  async function getAllFriendIds(userId, { limit = 50, delayMs = 100 } = {}) {
    const ids = [];
    let cursor = null;
    while (true) {
      const url = new URL(`https://friends.roblox.com/v1/users/${userId}/friends/search`);
      url.searchParams.set("limit", String(limit));
      if (cursor) url.searchParams.set("cursor", cursor);
      const data = await fetchJson(url.toString());
      const items = Array.isArray(data.PageItems) ? data.PageItems : [];
      for (const it of items) {
        if (it && typeof it.id === "number") ids.push({ id: it.id, hasVerifiedBadge: !!it.hasVerifiedBadge });
      }
      cursor = data.NextCursor ?? data.nextPageCursor ?? data.nextCursor ?? null;
      if (!cursor) break;
      if (delayMs) await sleep(delayMs);
    }
    return ids;
  }

  async function getUserDetailsBatch(userIds, { chunkSize = 100, delayMs = 120 } = {}) {
    const result = new Map();
    for (let i = 0; i < userIds.length; i += chunkSize) {
      const chunk = userIds.slice(i, i + chunkSize);
      const body = { userIds: chunk };
      const data = await postJson("https://users.roblox.com/v1/users", body);
      const list = Array.isArray(data.data) ? data.data : [];
      for (const u of list) {
        if (u && typeof u.id === "number") {
          result.set(u.id, { id: u.id, name: u.name, displayName: u.displayName });
        }
      }
      if (delayMs) await sleep(delayMs);
    }
    return result;
  }

  try {
    console.log("NO-CSV build running");
    const userId = getUserIdFromUrl();
    const friends = await getAllFriendIds(userId, { limit: 50, delayMs: 100 });
    if (friends.length === 0) {
      console.warn("No friends found (or the list is private/unavailable).");
      return;
    }
    const idList = friends.map(f => f.id);
    const detailsMap = await getUserDetailsBatch(idList, { chunkSize: 100, delayMs: 120 });

    const merged = friends.map(f => {
      const d = detailsMap.get(f.id) || { id: f.id, name: "(unknown)", displayName: "(unknown)" };
      return {
        id: f.id,
        username: d.name,
        displayName: d.displayName,
        hasVerifiedBadge: f.hasVerifiedBadge
      };
    });

    merged.sort((a, b) => {
      const an = (a.username || "").toLowerCase();
      const bn = (b.username || "").toLowerCase();
      if (an && bn && an !== bn) return an < bn ? -1 : 1;
      return a.id - b.id;
    });

    console.log(`Fetched ${merged.length} friends for user ${userId}.`);
    console.table(merged);

    const summary = {
      userId: Number(userId),
      totalFriends: merged.length,
      verifiedCount: merged.filter(x => x.hasVerifiedBadge).length,
      sample: merged.slice(0, 10),
      all: merged
    };

    console.log("Summary:", summary);
    summary;
  } catch (err) {
    console.error("Failed to fetch friends:", err);
  }
})();
