/**
 * Handles GET requests to /api/vpn-data
 * @param {EventContext} context
 */
export async function onRequestGet(context) {
  try {
    // VPN_DATA is the binding to your Cloudflare KV Namespace
    const { VPN_DATA } = context.env;
    
    // Get the cached data from KV
    const vpnData = await VPN_DATA.get('latest_vpn_data', { type: 'json' });

    if (!vpnData) {
      return new Response(JSON.stringify({ error: 'No VPN data available. Please run the updater.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Return the data as a JSON response with caching headers
    return new Response(JSON.stringify(vpnData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600' // Cache on browser for 1 hour
      },
    });

  } catch (error) {
    console.error('Error fetching VPN data from KV:', error);
    return new Response(JSON.stringify({ error: 'Failed to retrieve VPN data.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}