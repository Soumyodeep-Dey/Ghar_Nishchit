// Backwards-compatible entrypoint. The versioned migration runner is now the
// only Neon schema source of truth.
console.warn('[Schema] initNeonSchema.js is deprecated; use `npm run migrate:neon`.');
await import('./runNeonMigrations.js');
