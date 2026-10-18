import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import { createLocalStorageProvider } from "../src/storage/providers/local.provider";
import { createSupabaseStorageProvider } from "../src/storage/providers/supabase.provider";

test("local image and audio namespaces preserve bytes independently", async () => {
  const name = `storage-check-${randomUUID()}.bin`;
  const audio = createLocalStorageProvider("audio");
  const images = createLocalStorageProvider("images");
  try {
    await audio.save(new File(["audio fixture"], name), name);
    await images.save(new File(["image fixture"], name), name);
    assert.equal((await audio.getBuffer(name)).toString(), "audio fixture");
    assert.equal((await images.getBuffer(name)).toString(), "image fixture");
    assert.match(await audio.getUrl(name), /^\/api\/audio\/file\?/);
    assert.match(await images.getUrl(name), /^\/api\/upload\/image\?/);
  } finally {
    await audio.delete(name);
    await images.delete(name);
  }
});

test("local storage cannot read outside its namespace", async () => {
  const storage = createLocalStorageProvider();
  for (const path of ["../../dev.db", "/tmp/outside.bin", ""]) {
    await assert.rejects(storage.getBuffer(path), /Invalid storage path/);
  }
});

test("cloud storage uses protected application URLs", async () => {
  assert.equal(await createSupabaseStorageProvider("images").getUrl("example.png"), "/api/upload/image?file=example.png");
  assert.equal(await createSupabaseStorageProvider("audio").getUrl("interview/file.webm"), "/api/audio/file?path=interview%2Ffile.webm");
});

test("cloud storage rejects traversal before sending a request", async () => {
  const originalUrl = process.env.SUPABASE_URL;
  const originalKey = process.env.SUPABASE_SECRET_KEY;
  process.env.SUPABASE_URL = "http://127.0.0.1:1";
  process.env.SUPABASE_SECRET_KEY = "storage-path-test-only";
  try {
    const storage = createSupabaseStorageProvider("audio");
    for (const path of ["../outside.bin", "/outside.bin", "folder\\outside.bin"]) {
      await assert.rejects(storage.getBuffer(path), /Invalid storage path/);
    }
  } finally {
    if (originalUrl === undefined) delete process.env.SUPABASE_URL;
    else process.env.SUPABASE_URL = originalUrl;
    if (originalKey === undefined) delete process.env.SUPABASE_SECRET_KEY;
    else process.env.SUPABASE_SECRET_KEY = originalKey;
  }
});
