import assert from 'node:assert/strict';
import test from 'node:test';
import { paginationMeta, paginationRequested, parsePagination } from '../src/utils/pagination.js';

test('pagination remains opt-in for backwards-compatible list responses', () => {
  assert.equal(paginationRequested({}), false);
  assert.equal(paginationRequested({ page: '1' }), true);
  assert.equal(paginationRequested({ limit: '20' }), true);
});

test('pagination parses positive values and caps page size', () => {
  assert.deepEqual(parsePagination({ page: '3', limit: '1000' }), {
    page: 3,
    limit: 100,
    skip: 200,
  });
  assert.deepEqual(parsePagination({ page: '-2', limit: 'invalid' }), {
    page: 1,
    limit: 24,
    skip: 0,
  });
});

test('pagination metadata reports navigation state', () => {
  assert.deepEqual(paginationMeta({ page: 2, limit: 10 }, 25), {
    page: 2,
    limit: 10,
    total: 25,
    totalPages: 3,
    hasNextPage: true,
    hasPreviousPage: true,
  });
});

