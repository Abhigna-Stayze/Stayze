/**
 * Seed media — downloads source images and uploads them to Supabase Storage.
 *
 * Postgres never stores the image, only the reference (bucket + path). This
 * module puts the actual objects in the buckets so those references resolve.
 *
 * Sources are all freely licensed:
 *   - Wikimedia Commons — real photographs of Chikmagalur and the Western Ghats
 *     (CC0 / CC BY / CC BY-SA). Used for landscapes and nearby places.
 *   - Unsplash — interiors, portraits and food, which Commons does not cover.
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. These are
 * read here and NOT in src/lib/env.ts, because CI supplies only the two
 * database URLs and would fail at import if the app required them.
 */
import { createClient } from "@supabase/supabase-js";

export type Source =
  | { kind: "commons"; title: string }
  | { kind: "unsplash"; id: string; w?: number; h?: number };

/** Logical name -> where the pixels come from. Downloaded once, reused across paths. */
export const SOURCES: Record<string, Source> = {
  // --- Wikimedia Commons: genuinely Chikmagalur / Western Ghats -------------
  "estate-shade-1": {
    kind: "commons",
    title: "Traditional shade coffee plantation Chikmagalur 1.jpg",
  },
  "estate-shade-2": {
    kind: "commons",
    title: "Shade coffee plantation landscape Chikmagalur.jpg",
  },
  "estate-canara": {
    kind: "commons",
    title: "Coffee plantation, South Canara.jpg",
  },
  "mullayanagiri-1": {
    kind: "commons",
    title: "Mullayanagiri, Chikmagalur district of Karnataka.jpg",
  },
  "mullayanagiri-2": { kind: "commons", title: "Peaks of Mullayanagiri.jpg" },
  "hebbe-1": {
    kind: "commons",
    title: "Hebbe Falls in Kemmangundi coffee estate India.jpg",
  },
  "hebbe-2": {
    kind: "commons",
    title: "Hebbe falls in Kemmangundi Karnataka India.jpg",
  },
  "bababudangiri-1": {
    kind: "commons",
    title: "Baba Budangiri, Chikmagalur (2024) 29.jpg",
  },
  "bababudangiri-2": {
    kind: "commons",
    title: "Baba Budangiri, Chikmagalur (2024) 37.jpg",
  },
  "ghats-1": { kind: "commons", title: "Western Ghats- Karnataka 01.jpg" },
  "ghats-2": { kind: "commons", title: "Western Ghats- Karnataka 04.jpg" },
  "kudremukh-1": { kind: "commons", title: "Kudremukh 1.jpg" },
  "kudremukh-2": { kind: "commons", title: "Kudremukh views.jpg" },
  kemmanagundi: { kind: "commons", title: "Kemmanagundi View.jpg" },
  "chikmagalur-town": {
    kind: "commons",
    title: "Chikmagalur, India. (7793316622).jpg",
  },

  // --- Unsplash: interiors, portraits, food --------------------------------
  "room-1": { kind: "unsplash", id: "photo-1522708323590-d24dbb6b0267" },
  "room-2": { kind: "unsplash", id: "photo-1616594039964-ae9021a400a0" },
  "room-3": { kind: "unsplash", id: "photo-1560448204-e02f11c3d0e2" },
  "room-4": { kind: "unsplash", id: "photo-1505693416388-ac5ce068fe85" },
  "room-5": { kind: "unsplash", id: "photo-1540518614846-7eded433c457" },
  "room-6": { kind: "unsplash", id: "photo-1566665797739-1674de7a421a" },
  verandah: { kind: "unsplash", id: "photo-1449158743715-0a90ebb6d2d8" },
  "interior-1": { kind: "unsplash", id: "photo-1502005229762-cf1b2da7c5d6" },
  breakfast: { kind: "unsplash", id: "photo-1533089860892-a7c6f0a88666" },
  bonfire: { kind: "unsplash", id: "photo-1475483768296-6163e08872a1" },
  "coffee-cup": { kind: "unsplash", id: "photo-1447933601403-0c6688de566e" },
  dining: { kind: "unsplash", id: "photo-1414235077428-338989a2e8c0" },
  hammock: { kind: "unsplash", id: "photo-1521401830884-6c03c1c87ebb" },
  "book-nook": { kind: "unsplash", id: "photo-1507842217343-583bb7270b66" },
  yoga: { kind: "unsplash", id: "photo-1544367567-0f2fcb009e0b" },
  trek: { kind: "unsplash", id: "photo-1551632811-561732d1e306" },
  stars: { kind: "unsplash", id: "photo-1470071459604-3b5ec3a7fe05" },
  rain: { kind: "unsplash", id: "photo-1519692933481-e162a57d6721" },
  desk: { kind: "unsplash", id: "photo-1497366754035-f200968a6e72" },
  pool: { kind: "unsplash", id: "photo-1571896349842-33c89424de2d" },
  "review-1": { kind: "unsplash", id: "photo-1476514525535-07fb3b4ae5f1" },
  "review-2": { kind: "unsplash", id: "photo-1533105079780-92b9be482077" },
  "review-3": { kind: "unsplash", id: "photo-1504280390367-361c6d9f38f4" },
  "review-4": { kind: "unsplash", id: "photo-1517824806704-9040b037703b" },
  "portrait-1": {
    kind: "unsplash",
    id: "photo-1507003211169-0a1dd7228f2d",
    w: 1200,
    h: 1200,
  },
  "portrait-2": {
    kind: "unsplash",
    id: "photo-1494790108377-be9c29b29330",
    w: 1200,
    h: 1200,
  },
  "portrait-3": {
    kind: "unsplash",
    id: "photo-1500648767791-00dcc994a43e",
    w: 1200,
    h: 1200,
  },
};

/** One object to place in Storage. */
export type MediaRef = { bucket: string; path: string; source: string };

/** What Postgres records about that object once it is uploaded. */
export type MediaMeta = {
  bucket: string;
  path: string;
  width: number;
  height: number;
  fileSize: number;
  mimeType: string;
};

type Downloaded = {
  bytes: Buffer;
  width: number;
  height: number;
  mimeType: string;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Wikimedia rate-limits anonymous clients and expects an identifying User-Agent.
// Without backoff, downloading ~15 sources in a row reliably trips a 429.
const UA = "stayze-seed/1.0 (development seed; contact hello@stayze.in)";

async function fetchRetry(url: string, attempts = 5): Promise<Response> {
  let wait = 1000;
  for (let i = 1; i <= attempts; i++) {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (res.ok) return res;
    if (res.status !== 429 && res.status < 500) {
      throw new Error(`${url} -> ${res.status}`);
    }
    if (i === attempts)
      throw new Error(`${url} -> ${res.status} after ${attempts} attempts`);
    const retryAfter = Number(res.headers.get("retry-after"));
    const delay =
      Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : wait;
    console.log(
      `    ${res.status} — retrying in ${Math.round(delay / 1000)}s (${i}/${attempts})`,
    );
    await sleep(delay);
    wait *= 2;
  }
  throw new Error("unreachable");
}

async function download(source: Source): Promise<Downloaded> {
  if (source.kind === "unsplash") {
    const w = source.w ?? 1600;
    const h = source.h ?? 1067;
    const url = `https://images.unsplash.com/${source.id}?w=${w}&h=${h}&fit=crop&q=80&fm=jpg`;
    const res = await fetchRetry(url);
    // Dimensions are forced by the query, so no image parsing is needed.
    return {
      bytes: Buffer.from(await res.arrayBuffer()),
      width: w,
      height: h,
      mimeType: "image/jpeg",
    };
  }

  // Commons: resolve the File: title to a 1600px-wide thumbnail. The API hands
  // back the thumbnail's real dimensions, so again no parsing is needed.
  const api =
    `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo` +
    `&iiprop=url|size|mime&iiurlwidth=1600&titles=${encodeURIComponent("File:" + source.title)}`;
  const meta = (await (await fetchRetry(api)).json()) as {
    query?: {
      pages?: Record<string, { imageinfo?: Array<Record<string, unknown>> }>;
    };
  };
  const page = Object.values(meta.query?.pages ?? {})[0];
  const info = page?.imageinfo?.[0];
  if (!info) throw new Error(`commons: no imageinfo for "${source.title}"`);

  const thumbUrl = String(info["thumburl"] ?? info["url"]);
  const width = Number(info["thumbwidth"] ?? info["width"]);
  const height = Number(info["thumbheight"] ?? info["height"]);

  const res = await fetchRetry(thumbUrl);

  return {
    bytes: Buffer.from(await res.arrayBuffer()),
    width,
    height,
    mimeType: "image/jpeg",
  };
}

/**
 * Uploads every ref to Supabase Storage and returns metadata keyed by
 * `bucket/path`. Each distinct source is downloaded once and reused.
 */
export async function uploadAll(
  refs: MediaRef[],
): Promise<Map<string, MediaMeta>> {
  // The project URL is safe to expose to the browser (the app needs it to build
  // public image URLs), so it carries the NEXT_PUBLIC_ prefix. The service-role
  // key must NOT: NEXT_PUBLIC_* is inlined into the client bundle at build time,
  // and this key bypasses RLS.
  const url =
    process.env["NEXT_PUBLIC_SUPABASE_URL"] ?? process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_SERVICE_ROLE_KEY"];
  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env to upload seed media.\n" +
        "Get the service_role key from Supabase Dashboard -> Project Settings -> API.\n" +
        "Do not prefix the service-role key with NEXT_PUBLIC_ — that would ship it to the browser.",
    );
  }
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  // Fail loudly and early if a bucket is missing, rather than 400ing per file.
  const buckets = [...new Set(refs.map((r) => r.bucket))];
  for (const b of buckets) {
    const { error } = await supabase.storage.getBucket(b);
    if (error)
      throw new Error(
        `Storage bucket "${b}" is not reachable: ${error.message}`,
      );
  }

  const cache = new Map<string, Downloaded>();
  const out = new Map<string, MediaMeta>();
  let done = 0;

  for (const ref of refs) {
    const spec = SOURCES[ref.source];
    if (!spec)
      throw new Error(
        `Unknown media source "${ref.source}" for ${ref.bucket}/${ref.path}`,
      );

    let img = cache.get(ref.source);
    if (!img) {
      // Only distinct sources hit the network; pace those so Wikimedia does not
      // rate-limit us. Repeat uses of the same source come from the cache.
      if (cache.size > 0) await sleep(500);
      img = await download(spec);
      cache.set(ref.source, img);
    }

    const { error } = await supabase.storage
      .from(ref.bucket)
      .upload(ref.path, img.bytes, { contentType: img.mimeType, upsert: true });
    if (error)
      throw new Error(`upload ${ref.bucket}/${ref.path}: ${error.message}`);

    out.set(`${ref.bucket}/${ref.path}`, {
      bucket: ref.bucket,
      path: ref.path,
      width: img.width,
      height: img.height,
      fileSize: img.bytes.byteLength,
      mimeType: img.mimeType,
    });

    done += 1;
    if (done % 10 === 0 || done === refs.length) {
      console.log(`  uploaded ${done}/${refs.length}`);
    }
  }

  return out;
}
