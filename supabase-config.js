/* =====================================================
   SUPABASE CONFIGURATION & CLIENT - EngLish Platform
   
   QUICK SETUP:
   1. Log into your Supabase Dashboard: https://supabase.com/dashboard
   2. Select your project (or create a new free project)
   3. Go to "Project Settings" (gear icon) -> "API"
   4. Copy "Project URL" and paste it into SUPABASE_URL below
   5. Copy "anon public" API Key and paste it into SUPABASE_ANON_KEY below
   6. In Supabase Dashboard -> Authentication -> Providers -> Email:
      Ensure Email provider is enabled. (Optionally disable "Confirm email"
      in Auth -> Providers -> Email if you want instant test logins without
      waiting for email verification).
===================================================== */

const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

/**
 * Checks whether valid Supabase credentials have been supplied
 * @returns {boolean}
 */
function isSupabaseConfigured() {
    return (
        typeof SUPABASE_URL === "string" &&
        SUPABASE_URL.trim() !== "" &&
        !SUPABASE_URL.includes("YOUR_SUPABASE_URL") &&
        typeof SUPABASE_ANON_KEY === "string" &&
        SUPABASE_ANON_KEY.trim() !== "" &&
        !SUPABASE_ANON_KEY.includes("YOUR_SUPABASE_ANON_KEY")
    );
}

/**
 * Global Supabase Client instance
 */
let supabaseClient = null;

if (typeof window !== "undefined" && window.supabase) {
    if (isSupabaseConfigured()) {
        try {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true,
                    storage: window.localStorage
                }
            });
            console.log("%c[Supabase]%c Initialized successfully", "color: #12b76a; font-weight: bold;", "color: inherit;");
        } catch (err) {
            console.error("[Supabase] Failed to initialize client:", err);
        }
    } else {
        console.warn(
            "%c[Supabase]%c Not configured yet. Please open supabase-config.js and add your Project URL and Anon Key.",
            "color: #f79009; font-weight: bold;",
            "color: inherit;"
        );
    }
}

/**
 * Helper object providing reusable Supabase Authentication utilities
 */
const supabaseAuth = {
    /**
     * Check if client is properly initialized
     */
    isReady() {
        return !!supabaseClient && isSupabaseConfigured();
    },

    /**
     * Sign in with Email and Password
     * @param {string} email
     * @param {string} password
     * @returns {Promise<{data: any, error: any}>}
     */
    async signIn(email, password) {
        if (!this.isReady()) {
            return {
                data: null,
                error: { message: "Supabase is not configured yet. Please update supabase-config.js." }
            };
        }
        return await supabaseClient.auth.signInWithPassword({
            email: email.trim(),
            password: password
        });
    },

    /**
     * Sign up a new user with Email, Password and optional Full Name
     * @param {string} email
     * @param {string} password
     * @param {string} [fullName]
     * @returns {Promise<{data: any, error: any}>}
     */
    async signUp(email, password, fullName = "") {
        if (!this.isReady()) {
            return {
                data: null,
                error: { message: "Supabase is not configured yet. Please update supabase-config.js." }
            };
        }
        return await supabaseClient.auth.signUp({
            email: email.trim(),
            password: password,
            options: {
                data: {
                    full_name: fullName.trim()
                }
            }
        });
    },

    /**
     * Send a password reset email
     * @param {string} email
     * @param {string} [redirectTo]
     * @returns {Promise<{data: any, error: any}>}
     */
    async resetPassword(email, redirectTo = window.location.href) {
        if (!this.isReady()) {
            return {
                data: null,
                error: { message: "Supabase is not configured yet. Please update supabase-config.js." }
            };
        }
        return await supabaseClient.auth.resetPasswordForEmail(email.trim(), {
            redirectTo: redirectTo
        });
    },

    /**
     * Sign out the current user
     * @returns {Promise<{error: any}>}
     */
    async signOut() {
        if (!this.isReady()) {
            return { error: null };
        }
        return await supabaseClient.auth.signOut();
    },

    /**
     * Get current active session
     * @returns {Promise<any>}
     */
    async getSession() {
        if (!this.isReady()) return null;
        const { data, error } = await supabaseClient.auth.getSession();
        if (error) {
            console.error("[Supabase] Error getting session:", error);
            return null;
        }
        return data.session;
    },

    /**
     * Get currently logged-in user
     * @returns {Promise<any>}
     */
    async getUser() {
        if (!this.isReady()) return null;
        const { data, error } = await supabaseClient.auth.getUser();
        if (error) {
            return null;
        }
        return data.user;
    },

    /**
     * Listen to authentication state changes
     * @param {Function} callback (event, session) => void
     * @returns {any} subscription object
     */
    onAuthStateChange(callback) {
        if (!this.isReady()) return null;
        return supabaseClient.auth.onAuthStateChange((event, session) => {
            if (typeof callback === "function") {
                callback(event, session);
            }
        });
    }
};

// Make accessible to all browser scripts
window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
window.isSupabaseConfigured = isSupabaseConfigured;
window.supabaseClient = supabaseClient;
window.supabaseAuth = supabaseAuth;
