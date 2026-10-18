/* =====================================================
   MOBILE MENU
===================================================== */

const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");

menuBtn.addEventListener("click", () => {

    mobileMenu.classList.toggle("open");

    const icon = menuBtn.querySelector("i");

    if (mobileMenu.classList.contains("open")) {

        icon.classList.remove("fa-bars");
        icon.classList.add("fa-xmark");

    } else {

        icon.classList.remove("fa-xmark");
        icon.classList.add("fa-bars");

    }

});


/* Close mobile menu after clicking a link */

const mobileLinks =
    document.querySelectorAll(".mobile-menu a");

mobileLinks.forEach(link => {

    link.addEventListener("click", () => {

        mobileMenu.classList.remove("open");

        const icon = menuBtn.querySelector("i");

        icon.classList.remove("fa-xmark");
        icon.classList.add("fa-bars");

    });

});


/* =====================================================
   IELTS MODAL
===================================================== */

const testModal =
    document.getElementById("testModal");

const testBtn =
    document.getElementById("testBtn");

const ctaBtn =
    document.getElementById("ctaBtn");

const closeModal =
    document.getElementById("closeModal");

const modalStart =
    document.getElementById("modalStart");


function openModal() {

    testModal.classList.add("show");

    document.body.style.overflow = "hidden";

}


function closeTestModal() {

    testModal.classList.remove("show");

    document.body.style.overflow = "";

}


testBtn.addEventListener("click", openModal);

ctaBtn.addEventListener("click", openModal);

closeModal.addEventListener("click", closeTestModal);


/* Close when clicking outside */

testModal.addEventListener("click", (event) => {

    if (event.target === testModal) {

        closeTestModal();

    }

});


/* ESC key */

document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {

        closeTestModal();

    }

});


/* =====================================================
   START TEST
===================================================== */

modalStart.addEventListener("click", () => {

    window.location.href = "listening.html";

});


/* =====================================================
   SMOOTH SCROLL
===================================================== */

document.querySelectorAll('a[href^="#"]')
    .forEach(anchor => {

        anchor.addEventListener("click", function(event) {

            const targetId =
                this.getAttribute("href");

            if (targetId === "#") {

                event.preventDefault();

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

                return;

            }

            const target =
                document.querySelector(targetId);

            if (target) {

                event.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        });

    });


/* =====================================================
   NAVBAR ACTIVE LINK
===================================================== */

const sections =
    document.querySelectorAll("section[id]");

const navLinks =
    document.querySelectorAll(".nav-links a");


window.addEventListener("scroll", () => {

    let current = "";

    sections.forEach(section => {

        const sectionTop =
            section.offsetTop - 120;

        const sectionHeight =
            section.clientHeight;

        if (
            window.scrollY >= sectionTop &&
            window.scrollY < sectionTop + sectionHeight
        ) {

            current = section.getAttribute("id");

        }

    });


    navLinks.forEach(link => {

        link.classList.remove("active");

        if (
            link.getAttribute("href") ===
            "#" + current
        ) {

            link.classList.add("active");

        }

    });

});


/* =====================================================
   SCROLL REVEAL ANIMATION
===================================================== */

const animatedElements =
    document.querySelectorAll(
        ".skill-card, .feature, .engineering-content, .engineering-visual"
    );


const observer =
    new IntersectionObserver(
        (entries) => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add("visible");

                    observer.unobserve(entry.target);

                }

            });

        },
        {
            threshold: 0.15
        }
    );


animatedElements.forEach(element => {

    observer.observe(element);

});


/* =====================================================
   HERO BUTTON RIPPLE EFFECT
===================================================== */

const buttons =
    document.querySelectorAll(
        ".primary-btn, .secondary-btn, .white-btn, .cta-btn"
    );


buttons.forEach(button => {

    button.addEventListener("click", function() {

        this.style.transform = "scale(0.98)";

        setTimeout(() => {

            this.style.transform = "";

        }, 120);

    });

});


/* =====================================================
   SUPABASE AUTHENTICATION & NAVBAR SYNC
===================================================== */

async function syncNavbarAuthState() {
    const navActions = document.getElementById("navActions");
    const mobileLoginBtn = document.getElementById("mobileLoginBtn");

    if (!window.supabaseAuth || !window.isSupabaseConfigured || !window.isSupabaseConfigured()) {
        // Supabase not configured yet - fallback navigation
        document.querySelectorAll(".login-btn, .mobile-login").forEach(btn => {
            btn.onclick = () => { window.location.href = "login.html"; };
        });
        document.querySelectorAll(".signup-btn").forEach(btn => {
            btn.onclick = () => { window.location.href = "login.html?mode=signup"; };
        });
        return;
    }

    try {
        const session = await window.supabaseAuth.getSession();
        const user = session ? session.user : null;

        if (user && navActions) {
            const rawName = (user.user_metadata && user.user_metadata.full_name) || user.email.split("@")[0];
            const initial = rawName.charAt(0).toUpperCase();

            // Render desktop user chip with Dashboard link
            navActions.innerHTML = `
                <div class="user-nav-chip" title="Signed in as ${user.email}">
                    <a href="dashboard.html" class="user-dashboard-link" style="display:flex; align-items:center; gap:8px; text-decoration:none; color:inherit;">
                        <div class="user-avatar-circle">${initial}</div>
                        <span class="user-nav-name">${rawName}</span>
                        <span class="dash-pill-tag" style="background:#f3f2ff; color:#635bff; font-size:11.5px; font-weight:700; padding:3px 9px; border-radius:100px;">Dashboard</span>
                    </a>
                    <button class="nav-logout-btn" id="navLogoutBtn" aria-label="Sign out" title="Sign out">
                        <i class="fa-solid fa-arrow-right-from-bracket"></i>
                    </button>
                </div>
            `;

            const navLogoutBtn = document.getElementById("navLogoutBtn");
            if (navLogoutBtn) {
                navLogoutBtn.addEventListener("click", async () => {
                    navLogoutBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i>`;
                    await window.supabaseAuth.signOut();
                    window.location.reload();
                });
            }

            // Render mobile user state
            if (mobileLoginBtn) {
                mobileLoginBtn.innerHTML = `<i class="fa-solid fa-graduation-cap"></i> Student Dashboard`;
                mobileLoginBtn.onclick = () => {
                    window.location.href = "dashboard.html";
                };
            }
        } else {
            // Not logged in - ensure buttons route correctly
            document.querySelectorAll(".login-btn, .mobile-login").forEach(btn => {
                btn.onclick = () => { window.location.href = "login.html"; };
            });
            document.querySelectorAll(".signup-btn").forEach(btn => {
                btn.onclick = () => { window.location.href = "login.html?mode=signup"; };
            });
        }
    } catch (err) {
        console.error("Auth navbar sync error:", err);
    }
}

// Run on page load
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", syncNavbarAuthState);
} else {
    syncNavbarAuthState();
}

// React to session change events
if (window.supabaseAuth && typeof window.supabaseAuth.onAuthStateChange === "function") {
    window.supabaseAuth.onAuthStateChange(() => {
        syncNavbarAuthState();
    });
}
