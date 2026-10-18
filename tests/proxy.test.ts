import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { NextRequest } from "next/server";
import { proxy } from "../src/proxy";

const original = {
  NODE_ENV: process.env.NODE_ENV,
  APP_USERNAME: process.env.APP_USERNAME,
  APP_PASSWORD: process.env.APP_PASSWORD,
};

beforeEach(() => {
  Object.assign(process.env, { NODE_ENV: "production", APP_PASSWORD: "test-only-password" });
  delete process.env.APP_USERNAME;
});

afterEach(() => {
  for (const [key, value] of Object.entries(original)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

function request(path = "/questions", credentials?: string) {
  return new NextRequest(`https://example.com${path}`, {
    headers: credentials
      ? { authorization: `Basic ${Buffer.from(credentials).toString("base64")}` }
      : {},
  });
}

test("production rejects missing credentials with a browser login challenge", () => {
  const response = proxy(request());
  assert.equal(response.status, 401);
  assert.match(response.headers.get("www-authenticate") || "", /^Basic /);
});

test("valid credentials permit pages without shared caching", () => {
  const response = proxy(request("/questions", "coach:test-only-password"));
  assert.equal(response.headers.get("x-middleware-next"), "1");
  assert.equal(response.headers.get("cache-control"), "private, no-store");
});

test("incorrect passwords and usernames are rejected", () => {
  assert.equal(proxy(request("/api/questions", "coach:wrong")).status, 401);
  assert.equal(proxy(request("/api/questions", "wrong:test-only-password")).status, 401);
});

test("custom usernames and UTF-8 passwords work", () => {
  process.env.APP_USERNAME = "owner";
  process.env.APP_PASSWORD = "p\u00e4ssword";
  assert.equal(proxy(request("/questions", "owner:p\u00e4ssword")).headers.get("x-middleware-next"), "1");
});

test("malformed authorization is rejected", () => {
  const req = request();
  req.headers.set("authorization", "Basic !!!");
  assert.equal(proxy(req).status, 401);
});

test("production fails closed when the password is not configured", () => {
  delete process.env.APP_PASSWORD;
  assert.equal(proxy(request()).status, 503);
  assert.equal(proxy(request("/api/seed")).status, 503);
});

test("only the exact health endpoint is exempt", () => {
  delete process.env.APP_PASSWORD;
  assert.equal(proxy(request("/api/health")).headers.get("x-middleware-next"), "1");
  assert.equal(proxy(request("/api/health/other")).status, 503);
});

test("local development can run without a password", () => {
  Object.assign(process.env, { NODE_ENV: "development" });
  delete process.env.APP_PASSWORD;
  assert.equal(proxy(request()).headers.get("x-middleware-next"), "1");
});

test("authenticated cross-origin writes are rejected", () => {
  const authorization = `Basic ${Buffer.from("coach:test-only-password").toString("base64")}`;
  for (const origin of ["https://other.example", "null"]) {
    const req = new NextRequest("https://example.com/api/seed", {
      method: "POST",
      headers: { authorization, origin },
    });
    assert.equal(proxy(req).status, 403);
  }
});

test("authenticated same-origin writes are allowed", () => {
  const req = new NextRequest("https://example.com/api/questions", {
    method: "POST",
    headers: {
      authorization: `Basic ${Buffer.from("coach:test-only-password").toString("base64")}`,
      origin: "https://example.com",
    },
  });
  assert.equal(proxy(req).headers.get("x-middleware-next"), "1");
});
