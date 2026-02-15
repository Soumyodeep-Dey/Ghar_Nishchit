import dns from 'dns';

console.log('Starting DNS Diagnostics...');

// 1. Test standard DNS resolution (Google)
console.log('1. Testing Google.com resolution...');
dns.lookup('google.com', (err, address, family) => {
    if (err) {
        console.error('❌ Google Lookup Failed:', err.code);
    } else {
        console.log(`✅ Google IP: ${address} (Family: IPv${family})`);
    }
});

// 2. Test MongoDB SRV resolution
const srvRecord = '_mongodb._tcp.cluster0.pwapvro.mongodb.net';
console.log(`2. Testing SRV resolution for: ${srvRecord}`);
dns.resolveSrv(srvRecord, (err, addresses) => {
    if (err) {
        console.error('❌ SRV Lookup Failed:', err.code, err.message);
        console.error('\nPOSSIBLE CAUSES:');
        console.error(' - Your network/ISP is blocking "SRV" DNS queries.');
        console.error(' - Your DNS server is misconfigured.');
        console.error(' - You are on a restricted network (Corporate/College VPN).');
    } else {
        console.log('✅ SRV Records found:', JSON.stringify(addresses, null, 2));
    }
});
