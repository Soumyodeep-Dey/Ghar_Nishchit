const parseDohAnswers = (payload) => payload?.Answer?.map((answer) => answer.data).filter(Boolean) || [];

const resolveOverHttps = async (name, type) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${type}`,
      { signal: controller.signal }
    );
    if (!response.ok) throw new Error(`DNS-over-HTTPS returned HTTP ${response.status}`);
    const payload = await response.json();
    if (payload.Status !== 0) throw new Error(`DNS-over-HTTPS status ${payload.Status}`);
    return parseDohAnswers(payload);
  } finally {
    clearTimeout(timeout);
  }
};

/**
 * MongoDB Atlas normally uses DNS SRV records. Some Windows/network setups block
 * direct SRV lookups while allowing ordinary A lookups and HTTPS. In that case,
 * resolve only the SRV/TXT discovery records over HTTPS and return an equivalent
 * standard mongodb:// seed-list URI. Credentials never leave the original URI.
 */
export const resolveMongoConnectionString = async (connectionString) => {
  if (!connectionString?.startsWith('mongodb+srv://')) return connectionString;

  const parsed = new URL(connectionString);
  const srvAnswers = await resolveOverHttps(`_mongodb._tcp.${parsed.hostname}`, 'SRV');
  if (!srvAnswers.length) throw new Error('Atlas SRV record returned no hosts');

  const hosts = srvAnswers.map((answer) => {
    const parts = answer.trim().split(/\s+/);
    return `${parts[3].replace(/\.$/, '')}:${parts[2]}`;
  });

  const txtAnswers = await resolveOverHttps(parsed.hostname, 'TXT');
  const params = new URLSearchParams();
  for (const answer of txtAnswers) {
    const cleaned = answer.replace(/^"|"$/g, '').replace(/"\s+"/g, '');
    for (const [key, value] of new URLSearchParams(cleaned)) params.set(key, value);
  }
  for (const [key, value] of parsed.searchParams) params.set(key, value);
  params.set('tls', 'true');

  const credentials = parsed.username
    ? `${parsed.username}${parsed.password ? `:${parsed.password}` : ''}@`
    : '';
  return `mongodb://${credentials}${hosts.join(',')}${parsed.pathname || '/'}?${params.toString()}`;
};
