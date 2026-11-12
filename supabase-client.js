'use strict';

const SUPABASE_URL = '';
const SUPABASE_ANON_KEY = ''; // you can find these values under your supabase's project setting

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    experimental: { passkeys: true } 
  }
});

window.supabaseClient = supabaseClient;

window.hatchable = {
  auth: {
    async getSession() {
      const { data: { session }, error } = await supabaseClient.auth.getSession();
      if (error || !session) return { user: null };
      return {
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email.split('@')[0]
        }
      };
    },

    async startLogin({ email }) {
      const { error } = await supabaseClient.auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: true }
      });
      if (error) throw error;
      return { has_passkey: false };
    },

    async verifyCode({ email, code }) {
      // 1. Try 'email' type (for returning users)
      let { data, error } = await supabaseClient.auth.verifyOtp({
        email: email.trim(),
        token: code.trim(),
        type: 'email'
      });
      
      // 2. If that fails, try 'signup' type (for first-time users)
      if (error) {
        const signupRetry = await supabaseClient.auth.verifyOtp({
          email: email.trim(),
          token: code.trim(),
          type: 'signup'
        });
        data = signupRetry.data;
        error = signupRetry.error;
      }

      if (error) throw error;
      return {
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.full_name || data.user.email.split('@')[0]
        }
      };
    },

    supportsPasskeys() {
      return Boolean(window.PublicKeyCredential && typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function');
    },

    async registerPasskey() {
      const { data, error } = await supabaseClient.auth.registerPasskey();
      if (error) throw error;
      return data; 
    },

    async signInWithPasskey() {
      const { data, error } = await supabaseClient.auth.signInWithPasskey();
      if (error) throw error;
      return { user: data.user };
    },

    async logout() { await supabaseClient.auth.signOut(); },
    async signOut() { await supabaseClient.auth.signOut(); }
  }
};

const originalFetch = window.fetch;
window.fetch = async function (resource, options = {}) {
  const url = typeof resource === 'string' ? resource : resource.url;
  const method = (options.method || 'GET').toUpperCase();

  if (url === '/api/profile') {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    if (method === 'GET') {
      const { data, error } = await supabaseClient.from('qr_profiles').select('display_name, bio, website, accent_color, created_at, updated_at').eq('user_id', user.id).maybeSingle();
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
      return new Response(JSON.stringify({ profile: data || { display_name: user.email.split('@')[0], bio: '', website: '', accent_color: '#CAFA69' } }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    if (method === 'POST') {
      const body = JSON.parse(options.body || '{}');
      const payload = {
        user_id: user.id,
        display_name: String(body.display_name || '').trim().slice(0, 80),
        bio: String(body.bio || '').trim().slice(0, 220),
        website: String(body.website || '').trim().slice(0, 300),
        accent_color: String(body.accent_color || '#CAFA69').toUpperCase()
      };
      const { data, error } = await supabaseClient.from('qr_profiles').upsert(payload).select().single();
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
      return new Response(JSON.stringify({ profile: data }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
  }

  if (url.startsWith('/api/qr-history')) {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    if (method === 'GET') {
      const { data, error } = await supabaseClient.from('qr_history').select('id, label, target_url, platform, design, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(200);
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
      return new Response(JSON.stringify({ items: data || [] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    if (method === 'POST') {
      const body = JSON.parse(options.body || '{}');
      const record = {
        user_id: user.id,
        label: String(body.label || 'Scan to connect').trim().slice(0, 70),
        target_url: String(body.target_url || '').trim(),
        platform: String(body.platform || 'Website').trim(),
        design: body.design || {}
      };
      const { data, error } = await supabaseClient.from('qr_history').insert(record).select().single();
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
      return new Response(JSON.stringify({ item: data }), { status: 201, headers: { 'Content-Type': 'application/json' } });
    }

    if (method === 'DELETE') {
      const urlObj = new URL(url, window.location.origin);
      const id = urlObj.searchParams.get('id');
      if (!id) return new Response(JSON.stringify({ error: 'Missing ID' }), { status: 400 });
      const { error } = await supabaseClient.from('qr_history').delete().eq('id', id).eq('user_id', user.id);
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
  }

  return originalFetch.apply(this, arguments);
};