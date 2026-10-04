/* =====================================================
   LOGIN PAGE LOGIC - EngLish Platform
   Frontend-only interactive behaviors:
   - Password Show/Hide toggle
   - Basic empty-field validation
   - Live validation clearing on input
   - Frontend notice on submission
   - Forgot password toast handler
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
    // Elements
    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("emailInput");
    const passwordInput = document.getElementById("passwordInput");
    const emailGroup = document.getElementById("emailGroup");
    const passwordGroup = document.getElementById("passwordGroup");
    const passwordToggle = document.getElementById("passwordToggle");
    const toggleIcon = document.getElementById("toggleIcon");
    const loginBtn = document.getElementById("loginBtn");
    const noticeBanner = document.getElementById("noticeBanner");
    const forgotPasswordLink = document.getElementById("forgotPasswordLink");
    const loginToast = document.getElementById("loginToast");
    let toastTimeout = null;

    /* =====================================================
       1. PASSWORD SHOW / HIDE TOGGLE
    ===================================================== */
    if (passwordToggle && passwordInput && toggleIcon) {
        passwordToggle.addEventListener("click", () => {
            const isPassword = passwordInput.getAttribute("type") === "password";
            
            if (isPassword) {
                passwordInput.setAttribute("type", "text");
                toggleIcon.classList.remove("fa-eye");
                toggleIcon.classList.add("fa-eye-slash");
                passwordToggle.setAttribute("aria-label", "Hide password");
                passwordToggle.setAttribute("title", "Hide password");
            } else {
                passwordInput.setAttribute("type", "password");
                toggleIcon.classList.remove("fa-eye-slash");
                toggleIcon.classList.add("fa-eye");
                passwordToggle.setAttribute("aria-label", "Show password");
                passwordToggle.setAttribute("title", "Show password");
            }
        });
    }

    /* =====================================================
       2. REAL-TIME ERROR CLEARING ON TYPING
    ===================================================== */
    if (emailInput && emailGroup) {
        emailInput.addEventListener("input", () => {
            if (emailInput.value.trim() !== "") {
                emailGroup.classList.remove("has-error");
            }
        });
    }

    if (passwordInput && passwordGroup) {
        passwordInput.addEventListener("input", () => {
            if (passwordInput.value !== "") {
                passwordGroup.classList.remove("has-error");
            }
        });
    }

    /* =====================================================
       3. FORM SUBMISSION & EMPTY-FIELD VALIDATION
    ===================================================== */
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();

            let isValid = true;
            const emailVal = emailInput ? emailInput.value.trim() : "";
            const passwordVal = passwordInput ? passwordInput.value : "";

            // Reset initial state
            if (emailGroup) emailGroup.classList.remove("has-error");
            if (passwordGroup) passwordGroup.classList.remove("has-error");
            if (noticeBanner) noticeBanner.classList.remove("show");

            // Validate Email or Username
            if (!emailVal) {
                if (emailGroup) emailGroup.classList.add("has-error");
                isValid = false;
            }

            // Validate Password
            if (!passwordVal) {
                if (passwordGroup) passwordGroup.classList.add("has-error");
                isValid = false;
            }

            if (!isValid) {
                // Focus first invalid input
                if (!emailVal && emailInput) {
                    emailInput.focus();
                } else if (!passwordVal && passwordInput) {
                    passwordInput.focus();
                }
                return;
            }

            // Valid Inputs -> Frontend Feedback (No backend authentication)
            if (noticeBanner) {
                noticeBanner.classList.add("show");
                
                // Add subtle button animation feedback
                if (loginBtn) {
                    const originalHTML = loginBtn.innerHTML;
                    loginBtn.disabled = true;
                    loginBtn.innerHTML = `<span>Signing in...</span> <i class="fa-solid fa-spinner fa-spin"></i>`;
                    
                    setTimeout(() => {
                        loginBtn.disabled = false;
                        loginBtn.innerHTML = originalHTML;
                    }, 800);
                }

                // Scroll notice into view smoothly if on small mobile screen
                if (window.innerWidth < 480) {
                    noticeBanner.scrollIntoView({ behavior: "smooth", block: "nearest" });
                }
            }
        });
    }

    /* =====================================================
       4. FORGOT PASSWORD TOAST NOTIFICATION
    ===================================================== */
    if (forgotPasswordLink && loginToast) {
        forgotPasswordLink.addEventListener("click", (e) => {
            e.preventDefault();
            showToast("Password reset functionality will be available soon.");
        });
    }

    function showToast(message) {
        if (!loginToast) return;

        const toastMsgSpan = loginToast.querySelector(".toast-message");
        if (toastMsgSpan) {
            toastMsgSpan.textContent = message;
        }

        loginToast.classList.add("show");

        if (toastTimeout) {
            clearTimeout(toastTimeout);
        }

        toastTimeout = setTimeout(() => {
            loginToast.classList.remove("show");
        }, 3200);
    }
});
