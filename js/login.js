/* =====================================================
   LOGIN & AUTHENTICATION LOGIC - Grammarium Platform
   Powered by Supabase Auth:
   - Tab switching between Sign In & Sign Up
   - Live Supabase session detection
   - Sign In with Email & Password
   - Sign Up with Name, Email & Password (min 6 chars)
   - Password reset via Supabase email link
   - Input validations and accessible real-time feedback
   - Setup reminder if credentials need configuration
===================================================== */

document.addEventListener("DOMContentLoaded", async () => {
    // =====================================================
    // 1. DOM ELEMENT REFERENCES
    // =====================================================

    // Global / Headers
    const cardHeaderTitle = document.getElementById("cardHeaderTitle");
    const cardHeaderSubtitle = document.getElementById("cardHeaderSubtitle");
    const cardHeaderIcon = document.getElementById("cardHeaderIcon");
    const supabaseSetupAlert = document.getElementById("supabaseSetupAlert");
    const authTabsNav = document.getElementById("authTabsNav");
    const tabSignIn = document.getElementById("tabSignIn");
    const tabSignUp = document.getElementById("tabSignUp");
    const authFeedbackBanner = document.getElementById("authFeedbackBanner");
    const feedbackIcon = document.getElementById("feedbackIcon");
    const feedbackText = document.getElementById("feedbackText");
    const feedbackCloseBtn = document.getElementById("feedbackCloseBtn");
    const loginToast = document.getElementById("loginToast");
    let toastTimeout = null;

    // Active Session Elements
    const alreadyLoggedInBox = document.getElementById("alreadyLoggedInBox");
    const loggedInEmailLabel = document.getElementById("loggedInEmailLabel");
    const sessionSignOutBtn = document.getElementById("sessionSignOutBtn");

    // Sign In Elements
    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("emailInput");
    const passwordInput = document.getElementById("passwordInput");
    const emailGroup = document.getElementById("emailGroup");
    const passwordGroup = document.getElementById("passwordGroup");
    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");
    const passwordToggle = document.getElementById("passwordToggle");
    const toggleIcon = document.getElementById("toggleIcon");
    const loginBtn = document.getElementById("loginBtn");
    const rememberMe = document.getElementById("rememberMe");
    const forgotPasswordLink = document.getElementById("forgotPasswordLink");

    // Sign Up Elements
    const signupForm = document.getElementById("signupForm");
    const signupNameInput = document.getElementById("signupNameInput");
    const signupEmailInput = document.getElementById("signupEmailInput");
    const signupPasswordInput = document.getElementById("signupPasswordInput");
    const signupConfirmInput = document.getElementById("signupConfirmInput");
    const signupNameGroup = document.getElementById("signupNameGroup");
    const signupEmailGroup = document.getElementById("signupEmailGroup");
    const signupPasswordGroup = document.getElementById("signupPasswordGroup");
    const signupConfirmGroup = document.getElementById("signupConfirmGroup");
    const signupNameError = document.getElementById("signupNameError");
    const signupEmailError = document.getElementById("signupEmailError");
    const signupPasswordError = document.getElementById("signupPasswordError");
    const signupConfirmError = document.getElementById("signupConfirmError");
    const signupPasswordToggle = document.getElementById("signupPasswordToggle");
    const signupToggleIcon = document.getElementById("signupToggleIcon");
    const signupConfirmToggle = document.getElementById("signupConfirmToggle");
    const signupConfirmToggleIcon = document.getElementById("signupConfirmToggleIcon");
    const signupBtn = document.getElementById("signupBtn");

    // Forgot Password Modal Elements
    const forgotModal = document.getElementById("forgotModal");
    const forgotModalClose = document.getElementById("forgotModalClose");
    const forgotForm = document.getElementById("forgotForm");
    const forgotEmailInput = document.getElementById("forgotEmailInput");
    const forgotEmailGroup = document.getElementById("forgotEmailGroup");
    const forgotFeedback = document.getElementById("forgotFeedback");
    const forgotSubmitBtn = document.getElementById("forgotSubmitBtn");

    // =====================================================
    // 2. CONFIGURATION VERIFICATION
    // =====================================================
    const isConfigured = window.isSupabaseConfigured && window.isSupabaseConfigured();
    if (!isConfigured && supabaseSetupAlert) {
        supabaseSetupAlert.style.display = "flex";
    }

    // =====================================================
    // 3. ACTIVE SESSION CHECK
    // =====================================================
    if (isConfigured && window.supabaseAuth) {
        try {
            const session = await window.supabaseAuth.getSession();
            if (session && session.user) {
                renderLoggedInState(session.user);
            }
        } catch (err) {
            console.error("Error inspecting current session:", err);
        }
    }

    function renderLoggedInState(user) {
        if (!alreadyLoggedInBox) return;
        const email = user.email || "Active User";
        if (loggedInEmailLabel) loggedInEmailLabel.textContent = email;

        alreadyLoggedInBox.style.display = "flex";
        if (loginForm) loginForm.style.display = "none";
        if (signupForm) signupForm.style.display = "none";
        if (authTabsNav) authTabsNav.style.display = "none";

        if (cardHeaderTitle) cardHeaderTitle.textContent = "Account Active";
        if (cardHeaderSubtitle) cardHeaderSubtitle.textContent = `You are authenticated as ${email}`;
        if (cardHeaderIcon) cardHeaderIcon.className = "fa-solid fa-circle-check";
    }

    if (sessionSignOutBtn) {
        sessionSignOutBtn.addEventListener("click", async () => {
            sessionSignOutBtn.disabled = true;
            sessionSignOutBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Signing Out...`;
            if (window.supabaseAuth) {
                await window.supabaseAuth.signOut();
            }
            showToast("Successfully signed out.");
            setTimeout(() => {
                window.location.reload();
            }, 600);
        });
    }

    // =====================================================
    // 4. TAB NAVIGATION (SIGN IN / SIGN UP)
    // =====================================================
    function switchTab(mode) {
        hideBanner();
        clearFormErrors();

        if (mode === "signup") {
            // Activate Sign Up Tab
            tabSignIn.classList.remove("active");
            tabSignIn.setAttribute("aria-selected", "false");
            tabSignUp.classList.add("active");
            tabSignUp.setAttribute("aria-selected", "true");

            loginForm.style.display = "none";
            signupForm.style.display = "flex";

            if (cardHeaderTitle) cardHeaderTitle.textContent = "Create an Account";
            if (cardHeaderSubtitle) cardHeaderSubtitle.textContent = "Join Grammarium to track your LSRW and IELTS progress.";
            if (cardHeaderIcon) cardHeaderIcon.className = "fa-solid fa-user-plus";

            if (signupNameInput) signupNameInput.focus();
        } else {
            // Activate Sign In Tab
            tabSignUp.classList.remove("active");
            tabSignUp.setAttribute("aria-selected", "false");
            tabSignIn.classList.add("active");
            tabSignIn.setAttribute("aria-selected", "true");

            signupForm.style.display = "none";
            loginForm.style.display = "flex";

            if (cardHeaderTitle) cardHeaderTitle.textContent = "Welcome Back";
            if (cardHeaderSubtitle) cardHeaderSubtitle.textContent = "Sign in to continue your English learning journey.";
            if (cardHeaderIcon) cardHeaderIcon.className = "fa-solid fa-user-lock";

            if (emailInput) emailInput.focus();
        }
    }

    if (tabSignIn) {
        tabSignIn.addEventListener("click", () => switchTab("signin"));
    }
    if (tabSignUp) {
        tabSignUp.addEventListener("click", () => switchTab("signup"));
    }

    // Check URL search params for ?mode=signup
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("mode") === "signup") {
        switchTab("signup");
    }

    // =====================================================
    // 5. PASSWORD VISIBILITY TOGGLES
    // =====================================================
    function setupPasswordToggle(button, input, icon) {
        if (!button || !input || !icon) return;
        button.addEventListener("click", () => {
            const isPassword = input.getAttribute("type") === "password";
            if (isPassword) {
                input.setAttribute("type", "text");
                icon.classList.remove("fa-eye");
                icon.classList.add("fa-eye-slash");
                button.setAttribute("aria-label", "Hide password");
                button.setAttribute("title", "Hide password");
            } else {
                input.setAttribute("type", "password");
                icon.classList.remove("fa-eye-slash");
                icon.classList.add("fa-eye");
                button.setAttribute("aria-label", "Show password");
                button.setAttribute("title", "Show password");
            }
        });
    }

    setupPasswordToggle(passwordToggle, passwordInput, toggleIcon);
    setupPasswordToggle(signupPasswordToggle, signupPasswordInput, signupToggleIcon);
    setupPasswordToggle(signupConfirmToggle, signupConfirmInput, signupConfirmToggleIcon);

    // =====================================================
    // 6. REAL-TIME INPUT VALIDATION CLEARING
    // =====================================================
    function attachLiveClear(input, group) {
        if (input && group) {
            input.addEventListener("input", () => {
                if (input.value.trim() !== "") {
                    group.classList.remove("has-error");
                }
            });
        }
    }

    attachLiveClear(emailInput, emailGroup);
    attachLiveClear(passwordInput, passwordGroup);
    attachLiveClear(signupNameInput, signupNameGroup);
    attachLiveClear(signupEmailInput, signupEmailGroup);
    attachLiveClear(signupPasswordInput, signupPasswordGroup);
    attachLiveClear(signupConfirmInput, signupConfirmGroup);
    if (forgotEmailInput && forgotEmailGroup) {
        attachLiveClear(forgotEmailInput, forgotEmailGroup);
    }

    function clearFormErrors() {
        document.querySelectorAll(".form-group.has-error").forEach((g) => {
            g.classList.remove("has-error");
        });
    }

    // Helper: Email format validation
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // =====================================================
    // 7. STATUS & FEEDBACK BANNER HELPER
    // =====================================================
    function showBanner(message, type = "error") {
        if (!authFeedbackBanner || !feedbackText || !feedbackIcon) return;

        authFeedbackBanner.className = `auth-feedback-banner ${type}`;
        feedbackText.textContent = message;

        if (type === "success") {
            feedbackIcon.className = "fa-solid fa-circle-check feedback-icon";
        } else if (type === "info") {
            feedbackIcon.className = "fa-solid fa-circle-info feedback-icon";
        } else {
            feedbackIcon.className = "fa-solid fa-circle-exclamation feedback-icon";
        }

        authFeedbackBanner.style.display = "flex";
        authFeedbackBanner.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    function hideBanner() {
        if (authFeedbackBanner) {
            authFeedbackBanner.style.display = "none";
        }
    }

    if (feedbackCloseBtn) {
        feedbackCloseBtn.addEventListener("click", hideBanner);
    }

    // =====================================================
    // 8. SIGN IN SUBMISSION
    // =====================================================
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            hideBanner();

            const email = emailInput ? emailInput.value.trim() : "";
            const password = passwordInput ? passwordInput.value : "";
            let isValid = true;

            // Validate Email
            if (!email) {
                if (emailGroup) emailGroup.classList.add("has-error");
                if (emailError) emailError.querySelector("span").textContent = "Please enter your email address.";
                isValid = false;
            } else if (!isValidEmail(email)) {
                if (emailGroup) emailGroup.classList.add("has-error");
                if (emailError) emailError.querySelector("span").textContent = "Please enter a valid email format.";
                isValid = false;
            } else {
                if (emailGroup) emailGroup.classList.remove("has-error");
            }

            // Validate Password
            if (!password) {
                if (passwordGroup) passwordGroup.classList.add("has-error");
                isValid = false;
            } else {
                if (passwordGroup) passwordGroup.classList.remove("has-error");
            }

            if (!isValid) {
                if (!email) emailInput?.focus();
                else passwordInput?.focus();
                return;
            }

            // Check Supabase Configuration
            if (!window.supabaseAuth || !window.isSupabaseConfigured()) {
                showBanner(
                    "Supabase credentials are not configured yet. Please open supabase-config.js and add your Project URL & Anon Key.",
                    "error"
                );
                return;
            }

            // Button Loading State
            const originalBtnHTML = loginBtn.innerHTML;
            loginBtn.disabled = true;
            loginBtn.innerHTML = `<span>Signing in...</span> <i class="fa-solid fa-spinner fa-spin"></i>`;

            try {
                const { data, error } = await window.supabaseAuth.signIn(email, password);

                if (error) {
                    let msg = error.message;
                    if (msg.toLowerCase().includes("invalid login credentials")) {
                        msg = "Incorrect email or password. Please double-check your credentials.";
                    } else if (msg.toLowerCase().includes("email not confirmed")) {
                        msg = "Your email address has not been confirmed yet. Please check your inbox for the verification link.";
                    }
                    showBanner(msg, "error");
                    loginBtn.disabled = false;
                    loginBtn.innerHTML = originalBtnHTML;
                    return;
                }

                // Success
                showBanner("Signed in successfully! Redirecting to dashboard...", "success");
                loginBtn.innerHTML = `<span>Success!</span> <i class="fa-solid fa-check"></i>`;

                setTimeout(() => {
                    window.location.href = getPostLoginDestination();
                }, 800);
            } catch (err) {
                console.error("Sign in unexpected error:", err);
                showBanner("An unexpected error occurred. Please check your internet connection and try again.", "error");
                loginBtn.disabled = false;
                loginBtn.innerHTML = originalBtnHTML;
            }
        });
    }

    // =====================================================
    // 9. SIGN UP SUBMISSION
    // =====================================================
    if (signupForm) {
        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            hideBanner();

            const fullName = signupNameInput ? signupNameInput.value.trim() : "";
            const email = signupEmailInput ? signupEmailInput.value.trim() : "";
            const password = signupPasswordInput ? signupPasswordInput.value : "";
            const confirmPassword = signupConfirmInput ? signupConfirmInput.value : "";
            let isValid = true;

            // Full Name validation
            if (!fullName) {
                if (signupNameGroup) signupNameGroup.classList.add("has-error");
                isValid = false;
            } else {
                if (signupNameGroup) signupNameGroup.classList.remove("has-error");
            }

            // Email validation
            if (!email) {
                if (signupEmailGroup) signupEmailGroup.classList.add("has-error");
                if (signupEmailError) signupEmailError.querySelector("span").textContent = "Please enter your email address.";
                isValid = false;
            } else if (!isValidEmail(email)) {
                if (signupEmailGroup) signupEmailGroup.classList.add("has-error");
                if (signupEmailError) signupEmailError.querySelector("span").textContent = "Please enter a valid email format.";
                isValid = false;
            } else {
                if (signupEmailGroup) signupEmailGroup.classList.remove("has-error");
            }

            // Password validation (Supabase requires min 6 chars)
            if (!password || password.length < 6) {
                if (signupPasswordGroup) signupPasswordGroup.classList.add("has-error");
                isValid = false;
            } else {
                if (signupPasswordGroup) signupPasswordGroup.classList.remove("has-error");
            }

            // Password Match validation
            if (!confirmPassword || confirmPassword !== password) {
                if (signupConfirmGroup) signupConfirmGroup.classList.add("has-error");
                isValid = false;
            } else {
                if (signupConfirmGroup) signupConfirmGroup.classList.remove("has-error");
            }

            if (!isValid) {
                if (!fullName) signupNameInput?.focus();
                else if (!email) signupEmailInput?.focus();
                else if (!password) signupPasswordInput?.focus();
                else signupConfirmInput?.focus();
                return;
            }

            // Check Supabase Configuration
            if (!window.supabaseAuth || !window.isSupabaseConfigured()) {
                showBanner(
                    "Supabase credentials are not configured yet. Please open supabase-config.js and add your Project URL & Anon Key.",
                    "error"
                );
                return;
            }

            // Button Loading State
            const originalBtnHTML = signupBtn.innerHTML;
            signupBtn.disabled = true;
            signupBtn.innerHTML = `<span>Creating account...</span> <i class="fa-solid fa-spinner fa-spin"></i>`;

            try {
                const { data, error } = await window.supabaseAuth.signUp(email, password, fullName);

                if (error) {
                    let msg = error.message;
                    if (msg.toLowerCase().includes("user already registered")) {
                        msg = "An account with this email address already exists. Please sign in instead.";
                    }
                    showBanner(msg, "error");
                    signupBtn.disabled = false;
                    signupBtn.innerHTML = originalBtnHTML;
                    return;
                }

                // Check whether confirmation email is required
                if (data && data.user && (!data.session || (data.user.identities && data.user.identities.length === 0))) {
                    showBanner(
                        "Registration successful! Please check your email inbox to verify your account before signing in.",
                        "info"
                    );
                    signupBtn.disabled = false;
                    signupBtn.innerHTML = originalBtnHTML;
                    signupForm.reset();

                    // Switch back to Sign In after brief pause
                    setTimeout(() => {
                        switchTab("signin");
                        if (emailInput) emailInput.value = email;
                    }, 2800);
                } else {
                    // Session established immediately
                    showBanner("Account created and signed in successfully! Redirecting...", "success");
                    signupBtn.innerHTML = `<span>Welcome!</span> <i class="fa-solid fa-check"></i>`;
                    setTimeout(() => {
                        window.location.href = getPostLoginDestination();
                    }, 900);
                }
            } catch (err) {
                console.error("Sign up unexpected error:", err);
                showBanner("An unexpected error occurred during account creation. Please try again.", "error");
                signupBtn.disabled = false;
                signupBtn.innerHTML = originalBtnHTML;
            }
        });
    }

    // =====================================================
    // 10. FORGOT PASSWORD MODAL & SUBMISSION
    // =====================================================
    function openForgotModal() {
        if (!forgotModal) return;
        forgotModal.style.display = "flex";
        if (forgotEmailInput) {
            // Pre-fill with login email if user typed one
            if (emailInput && emailInput.value.trim() !== "") {
                forgotEmailInput.value = emailInput.value.trim();
            }
            setTimeout(() => forgotEmailInput.focus(), 50);
        }
        if (forgotFeedback) {
            forgotFeedback.style.display = "none";
        }
    }

    function closeForgotModal() {
        if (!forgotModal) return;
        forgotModal.style.display = "none";
        if (forgotEmailGroup) forgotEmailGroup.classList.remove("has-error");
    }

    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener("click", (e) => {
            e.preventDefault();
            openForgotModal();
        });
    }

    if (forgotModalClose) {
        forgotModalClose.addEventListener("click", closeForgotModal);
    }

    if (forgotModal) {
        forgotModal.addEventListener("click", (e) => {
            if (e.target === forgotModal) {
                closeForgotModal();
            }
        });
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && forgotModal && forgotModal.style.display === "flex") {
            closeForgotModal();
        }
    });

    if (forgotForm) {
        forgotForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = forgotEmailInput ? forgotEmailInput.value.trim() : "";

            if (!email || !isValidEmail(email)) {
                if (forgotEmailGroup) forgotEmailGroup.classList.add("has-error");
                return;
            }
            if (forgotEmailGroup) forgotEmailGroup.classList.remove("has-error");

            if (!window.supabaseAuth || !window.isSupabaseConfigured()) {
                if (forgotFeedback) {
                    forgotFeedback.className = "forgot-feedback error";
                    forgotFeedback.textContent = "Supabase is not configured yet in supabase-config.js.";
                    forgotFeedback.style.display = "block";
                }
                return;
            }

            const originalBtnHTML = forgotSubmitBtn.innerHTML;
            forgotSubmitBtn.disabled = true;
            forgotSubmitBtn.innerHTML = `<span>Sending...</span> <i class="fa-solid fa-spinner fa-spin"></i>`;

            try {
                const { error } = await window.supabaseAuth.resetPassword(
                    email,
                    window.location.origin + window.location.pathname
                );

                if (error) {
                    if (forgotFeedback) {
                        forgotFeedback.className = "forgot-feedback error";
                        forgotFeedback.textContent = error.message;
                        forgotFeedback.style.display = "block";
                    }
                    forgotSubmitBtn.disabled = false;
                    forgotSubmitBtn.innerHTML = originalBtnHTML;
                    return;
                }

                if (forgotFeedback) {
                    forgotFeedback.className = "forgot-feedback success";
                    forgotFeedback.textContent = "Password reset link sent! Check your inbox to set a new password.";
                    forgotFeedback.style.display = "block";
                }
                forgotSubmitBtn.disabled = false;
                forgotSubmitBtn.innerHTML = `<span>Link Sent!</span> <i class="fa-solid fa-check"></i>`;

                setTimeout(() => {
                    closeForgotModal();
                    showToast("Password reset link sent to " + email);
                }, 2200);
            } catch (err) {
                console.error("Forgot password error:", err);
                if (forgotFeedback) {
                    forgotFeedback.className = "forgot-feedback error";
                    forgotFeedback.textContent = "Unable to send reset link. Please check your connection and try again.";
                    forgotFeedback.style.display = "block";
                }
                forgotSubmitBtn.disabled = false;
                forgotSubmitBtn.innerHTML = originalBtnHTML;
            }
        });
    }

    // =====================================================
    // 11. TOAST NOTIFICATION HELPER
    // =====================================================
    function showToast(message) {
        if (!loginToast) return;
        const toastMsg = loginToast.querySelector(".toast-message");
        if (toastMsg) toastMsg.textContent = message;

        loginToast.classList.add("show");
        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            loginToast.classList.remove("show");
        }, 3500);
    }
});
