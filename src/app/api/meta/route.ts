const GRAPH = "https://graph.facebook.com/v21.0";

type DebugData = {
  type?: string;
  application?: string;
  is_valid?: boolean;
  expires_at?: number;
  scopes?: string[];
};

type Account = {
  id: string;
  name: string;
  instagram_business_account?: {
    id: string;
    username: string;
    followers_count: number;
    media_count: number;
  };
};

const NEEDED = [
  "instagram_basic",
  "instagram_manage_insights",
  "pages_read_engagement",
  "pages_show_list",
  "read_insights",
];

export async function GET() {
  const token = process.env.META_ACCESS_TOKEN?.trim();
  if (!token) {
    return Response.json(
      { ok: false, error: "Falta META_ACCESS_TOKEN en las variables de entorno." },
      { status: 400 }
    );
  }

  const debugRes = await fetch(
    `${GRAPH}/debug_token?input_token=${token}&access_token=${token}`
  );
  const debug: DebugData = (await debugRes.json())?.data ?? {};

  const accountsRes = await fetch(
    `${GRAPH}/me/accounts?limit=50&access_token=${token}` +
      `&fields=name,id,instagram_business_account{id,username,followers_count,media_count}`
  );
  const accountsJson = await accountsRes.json();
  const accounts: Account[] = accountsJson?.data ?? [];

  return Response.json({
    ok: debug.is_valid === true && accounts.length > 0,
    token: {
      tipo: debug.type,
      app: debug.application,
      valido: debug.is_valid,
      expira: debug.expires_at ? new Date(debug.expires_at * 1000).toISOString().slice(0, 10) : "nunca",
      largo: token.length,
      permisosFaltantes: NEEDED.filter((p) => !(debug.scopes ?? []).includes(p)),
    },
    cuentas: accounts.map((a) => ({
      pagina: a.name,
      pageId: a.id,
      igId: a.instagram_business_account?.id ?? null,
      igUser: a.instagram_business_account?.username ?? null,
      seguidores: a.instagram_business_account?.followers_count ?? null,
      posts: a.instagram_business_account?.media_count ?? null,
    })),
    errorGraph: accountsJson?.error ?? null,
  });
}
