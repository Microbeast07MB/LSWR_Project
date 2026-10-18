document.addEventListener("DOMContentLoaded", async () => {
    const title = document.getElementById("title");
    const instructions = document.getElementById("instructions");
    const enrollment = document.getElementById("enrollment");
    const qr = document.getElementById("qr");
    const secret = document.getElementById("secret");
    const codeForm = document.getElementById("codeForm");
    const codeInput = document.getElementById("totpCode");
    const verifyButton = document.getElementById("verifyButton");
    const feedback = document.getElementById("feedback");
    const next = new URLSearchParams(window.location.search).get("next");
    let factorId = null;
    let mode = "challenge";

    function postMfaDestination() {
        if (next) {
            try {
                const target = new URL(next, window.location.origin);
                if (target.origin === window.location.origin && target.pathname !== new URL("mfa.html", window.location.href).pathname) return target.href;
            } catch (error) {
                console.warn("Ignoring invalid post-MFA destination.", error);
            }
        }
        return new URL("dashboard.html", window.location.href).href;
    }

    function showError(error) {
        feedback.textContent = error?.message || "Could not complete MFA. Please try again.";
    }

    try {
        if (!window.supabaseAuth || !window.isSupabaseConfigured?.()) throw new Error("Supabase authentication is not configured.");
        const session = await window.supabaseAuth.getSession();
        if (!session?.user) {
            const login = new URL("login.html", window.location.href);
            if (next) login.searchParams.set("next", next);
            window.location.replace(login.href);
            return;
        }

        const { data: assurance, error: assuranceError } = await window.supabaseAuth.getMfaAssuranceLevel();
        if (assuranceError) throw assuranceError;
        if (assurance?.currentLevel === "aal2") {
            window.location.replace(postMfaDestination());
            return;
        }

        const { data: factorData, error: factorsError } = await window.supabaseAuth.listMfaFactors();
        if (factorsError) throw factorsError;
        const verifiedTotp = (factorData?.totp || []).find(factor => factor.status === "verified");

        if (verifiedTotp) {
            mode = "challenge";
            factorId = verifiedTotp.id;
            title.textContent = "Verify it’s you";
            instructions.textContent = "Enter the current code from your authenticator app to continue.";
            verifyButton.textContent = "Verify and continue";
        } else {
            mode = "enroll";
            // Discard incomplete setup attempts so a fresh QR code can be created.
            for (const factor of (factorData?.all || []).filter(item => item.factor_type === "totp" && item.status === "unverified")) {
                const { error } = await window.supabaseAuth.unenrollMfa(factor.id);
                if (error) throw error;
            }

            const { data, error } = await window.supabaseAuth.enrollTotp(`EngLish authenticator`);
            if (error) throw error;
            factorId = data.id;
            title.textContent = "Set up two-step verification";
            instructions.textContent = "MFA is required to access the site. Add this account to an authenticator app, then enter the generated code.";
            verifyButton.textContent = "Enable MFA and continue";
            qr.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(data.totp.qr_code)}`;
            secret.textContent = data.totp.secret;
            enrollment.hidden = false;
        }

        codeForm.hidden = false;
        codeInput.focus();
    } catch (error) {
        title.textContent = "MFA setup unavailable";
        instructions.textContent = "Check the Supabase Auth MFA settings and try again.";
        showError(error);
    }

    codeForm.addEventListener("submit", async event => {
        event.preventDefault();
        feedback.textContent = "";
        verifyButton.disabled = true;
        verifyButton.textContent = "Verifying…";
        try {
            const { data: challenge, error: challengeError } = await window.supabaseAuth.challengeMfa(factorId);
            if (challengeError) throw challengeError;
            const { error: verifyError } = await window.supabaseAuth.verifyMfa(factorId, challenge.id, codeInput.value);
            if (verifyError) throw verifyError;

            const { data: assurance, error: assuranceError } = await window.supabaseAuth.getMfaAssuranceLevel();
            if (assuranceError) throw assuranceError;
            if (assurance?.currentLevel !== "aal2") throw new Error("The authenticator code was accepted, but the session is not at MFA level yet. Please retry.");
            window.location.replace(postMfaDestination());
        } catch (error) {
            showError(error);
            codeInput.value = "";
            codeInput.focus();
            verifyButton.disabled = false;
            verifyButton.textContent = mode === "enroll" ? "Enable MFA and continue" : "Verify and continue";
        }
    });

    document.getElementById("signOut").addEventListener("click", async () => {
        await window.supabaseAuth?.signOut();
        window.location.replace("login.html");
    });
});
