let cachedAccessToken = null;
let cachedTokenExpiresAt = 0;

async function getAccessToken(env) {
  if (cachedAccessToken && Date.now() < cachedTokenExpiresAt) {
    return cachedAccessToken;
  }

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`)}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: env.SPOTIFY_REFRESH_TOKEN,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`token_refresh_failed: ${res.status} ${body}`);
  }

  const data = await res.json();
  cachedAccessToken = data.access_token;
  cachedTokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
  return cachedAccessToken;
}

function trackPayload(item) {
  return {
    isPlaying: true,
    title: item.name,
    artist: item.artists.map((a) => a.name).join(", "),
    album: item.album?.name ?? null,
    albumArt: item.album?.images?.[0]?.url ?? null,
    songUrl: item.external_urls?.spotify ?? null,
  };
}

export async function onRequestGet(context) {
  const { env } = context;
  const jsonHeaders = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  };

  try {
    const accessToken = await getAccessToken(env);

    const nowRes = await fetch(
      "https://api.spotify.com/v1/me/player/currently-playing",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (nowRes.status === 200) {
      const nowData = await nowRes.json();
      if (nowData?.is_playing && nowData.item) {
        return new Response(JSON.stringify(trackPayload(nowData.item)), {
          headers: jsonHeaders,
        });
      }
    }

    return new Response(JSON.stringify({ isPlaying: false, title: null }), {
      headers: jsonHeaders,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ isPlaying: false, title: null, error: true }),
      { status: 200, headers: jsonHeaders },
    );
  }
}
