import assert from "node:assert/strict";
import { test } from "node:test";
import { requireRole } from "../src/middlewares/auth.middleware.js";

const createResponse = () => ({
  statusCode: 200,
  body: undefined,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
});

test("role guard allows an explicitly permitted role", () => {
  const request = { user: { userId: "user-1", role: "admin" } };
  const response = createResponse();
  let nextCalled = false;

  requireRole("admin")(request, response, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(response.statusCode, 200);
});

test("role guard rejects a signed-in user with the wrong role", () => {
  const request = { user: { userId: "user-1", role: "tenant" } };
  const response = createResponse();

  requireRole("admin", "landlord")(request, response, () => {
    assert.fail("next must not be called for a forbidden role");
  });

  assert.equal(response.statusCode, 403);
  assert.deepEqual(response.body, { error: "Insufficient permissions" });
});

test("role guard rejects a request without an authenticated user", () => {
  const request = {};
  const response = createResponse();

  requireRole("admin")(request, response, () => {
    assert.fail("next must not be called without an authenticated user");
  });

  assert.equal(response.statusCode, 403);
  assert.deepEqual(response.body, { error: "Insufficient permissions" });
});
