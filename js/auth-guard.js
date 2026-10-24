/* Client-side page gate. Protected pages stay hidden until Supabase confirms a session. */
(async function requireAuthenticatedUser() {
    // The landing page is public and must remain reachable from every protected page.
    if (window.location.pathname.endsWith("/index.html") || window.location.pathname === "/") return;
    document.documentElement.classList.add("auth-pending");
    const pendingStyle = document.createElement("style");
    pendingStyle.textContent = "html.auth-pending body { visibility: hidden !important; }";
    document.head.appendChild(pendingStyle);

    const loginUrl = new URL("login.html", window.location.href);
    const requestedPage = window.location.pathname + window.location.search + window.location.hash;

    function redirectToLogin() {
        loginUrl.searchParams.set("next", requestedPage);
        window.location.replace(loginUrl.href);
    }

    function revealPageWithMessage(message) {
        document.documentElement.classList.remove("auth-pending");
        const notice = document.createElement("div");
        notice.setAttribute("role", "alert");
        notice.style.cssText = "position:fixed;z-index:99999;top:12px;left:50%;transform:translateX(-50%);max-width:calc(100% - 24px);padding:12px 18px;border-radius:10px;background:#fff4ed;color:#7a271a;font:600 14px/1.5 Arial,sans-serif;box-shadow:0 4px 18px rgba(16,24,40,.12);";
        notice.textContent = message;
        document.body.appendChild(notice);
    }

    try {
        if (!window.supabaseAuth || !window.isSupabaseConfigured?.()) {
            console.error("Authentication is unavailable; redirecting to sign in.");
            revealPageWithMessage("Sign-in is unavailable right now. Please try again shortly.");
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
        revealPageWithMessage("We couldn't verify your sign-in. Please reload or sign in again.");
    }
})();
