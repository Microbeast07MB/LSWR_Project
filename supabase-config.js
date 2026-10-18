/* =====================================================
   SUPABASE CONFIGURATION - Grammarium Platform
   ===================================================== */

// Supabase Project URL
const SUPABASE_URL = "https://yiwjiwesniwbddhvgmth.supabase.co";

// Supabase Publishable Key
const SUPABASE_ANON_KEY =
    "sb_publishable_2LvtraRCi5W3JrN-4dQ2FQ_Ikgdst57";


/**
 * Check whether Supabase credentials are configured
 */
function isSupabaseConfigured() {
    return (
        typeof SUPABASE_URL === "string" &&
        SUPABASE_URL.trim() !== "" &&
        SUPABASE_URL !== "YOUR_SUPABASE_URL" &&

        typeof SUPABASE_ANON_KEY === "string" &&
        SUPABASE_ANON_KEY.trim() !== "" &&
        SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY"
    );
}


/**
 * Global Supabase Client
 */
let supabaseClient = null;


/**
 * Initialize Supabase
 */
function initializeSupabase() {

    // Check if Supabase JS library is loaded
    if (typeof window.supabase === "undefined") {
        console.error(
            "[Supabase] Supabase JavaScript library is not loaded."
        );

        return false;
    }

    // Check credentials
    if (!isSupabaseConfigured()) {
        console.error(
            "[Supabase] Project URL or Publishable Key is missing."
        );

        return false;
    }

    try {

        supabaseClient = window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY,
            {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true,
                    storage: window.localStorage
                }
            }
        );

        console.log(
            "%c[Supabase] Connected successfully!",
            "color: #12b76a; font-weight: bold;"
        );

        return true;

    } catch (error) {

        console.error(
            "[Supabase] Initialization failed:",
            error
        );

        supabaseClient = null;

        return false;
    }
}


/**
 * Initialize Supabase immediately
 */
initializeSupabase();


/**
 * Authentication helper
 */
const supabaseAuth = {

    /**
     * Check if Supabase is ready
     */
    isReady() {
        return (
            supabaseClient !== null &&
            isSupabaseConfigured()
        );
    },


    /**
     * Sign In
     */
    async signIn(email, password) {

        if (!this.isReady()) {

            return {
                data: null,
                error: {
                    message:
                        "Supabase is not connected. Please check supabase-config.js."
                }
            };
        }

        try {

            const { data, error } =
                await supabaseClient.auth.signInWithPassword({
                    email: email.trim(),
                    password: password
                });

            return { data, error };

        } catch (error) {

            return {
                data: null,
                error: error
            };
        }
    },


    /**
     * Sign Up
     */
    async signUp(email, password, fullName = "") {

        if (!this.isReady()) {

            return {
                data: null,
                error: {
                    message:
                        "Supabase is not connected. Please check supabase-config.js."
                }
            };
        }

        try {

            const { data, error } =
                await supabaseClient.auth.signUp({

                    email: email.trim(),

                    password: password,

                    options: {
                        data: {
                            full_name: fullName.trim()
                        }
                    }
                });

            return { data, error };

        } catch (error) {

            return {
                data: null,
                error: error
            };
        }
    },


    /**
     * Reset Password
     */
    async resetPassword(
        email,
        redirectTo = window.location.href
    ) {

        if (!this.isReady()) {

            return {
                data: null,
                error: {
                    message:
                        "Supabase is not connected."
                }
            };
        }

        try {

            const { data, error } =
                await supabaseClient.auth
                    .resetPasswordForEmail(
                        email.trim(),
                        {
                            redirectTo: redirectTo
                        }
                    );

            return { data, error };

        } catch (error) {

            return {
                data: null,
                error: error
            };
        }
    },


    /**
     * Sign Out
     */
    async signOut() {

        if (!this.isReady()) {
            return { error: null };
        }

        return await supabaseClient.auth.signOut();
    },


    /**
     * Get Current Session
     */
    async getSession() {

        if (!this.isReady()) {
            return null;
        }

        const {
            data,
            error
        } = await supabaseClient.auth.getSession();

        if (error) {

            console.error(
                "[Supabase] Session error:",
                error
            );

            return null;
        }

        return data.session;
    },


    /**
     * Get Current User
     */
    async getUser() {

        if (!this.isReady()) {
            return null;
        }

        const {
            data,
            error
        } = await supabaseClient.auth.getUser();

        if (error) {

            console.error(
                "[Supabase] User error:",
                error
            );

            return null;
        }

        return data.user;
    },

    /**
     * Listen for Authentication Changes
     */
    onAuthStateChange(callback) {

        if (!this.isReady()) {
            return null;
        }

        return supabaseClient.auth.onAuthStateChange(
            (event, session) => {

                if (typeof callback === "function") {

                    callback(
                        event,
                        session
                    );
                }
            }
        );
    }
};


/**
 * Make everything available globally
 */
window.SUPABASE_URL = SUPABASE_URL;

window.SUPABASE_ANON_KEY =
    SUPABASE_ANON_KEY;

window.isSupabaseConfigured =
    isSupabaseConfigured;

window.supabaseClient =
    supabaseClient;

window.supabaseAuth =
    supabaseAuth;


/**
 * Final status check
 */
if (supabaseClient) {

    console.log(
        "%c✓ Supabase is READY",
        "color: green; font-weight: bold;"
    );

} else {

    console.error(
        "✗ Supabase is NOT READY"
    );
}
