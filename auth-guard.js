/* Client-side page gate. Protected pages stay hidden until Supabase confirms a session. */
(async function requireAuthenticatedUser() {
    document.documentElement.classList.add("auth-pending");
    const pendingStyle = document.createElement("style");
    pendingStyle.textContent = "html.auth-pending body { visibility: hidden !important; }";
    document.head.appendChild(pendingStyle);

    const guardScriptUrl = document.currentScript?.src || window.location.href;
    const loginUrl = new URL("login.html", guardScriptUrl);
    const requestedPage = window.location.pathname + window.location.search + window.location.hash;

    function redirectToLogin() {
        loginUrl.searchParams.set("next", requestedPage);
        window.location.replace(loginUrl.href);
    }

    try {
        if (!window.supabaseAuth || !window.isSupabaseConfigured?.()) {
            console.error("Authentication is unavailable; redirecting to sign in.");
            redirectToLogin();
            return;
        }

        const session = await window.supabaseAuth.getSession();
        if (!session?.user) {
            redirectToLogin();
            return;
        }

        document.documentElement.classList.remove("auth-pending");
    } catch (error) {
        console.error("Could not verify the sign-in session.", error);
        redirectToLogin();
    }
})();
