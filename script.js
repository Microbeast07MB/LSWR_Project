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

            // Render desktop user chip
            navActions.innerHTML = `
                <div class="user-nav-chip" title="Signed in as ${user.email}">
                    <div class="user-avatar-circle">${initial}</div>
                    <span class="user-nav-name">${rawName}</span>
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
                mobileLoginBtn.innerHTML = `<i class="fa-solid fa-arrow-right-from-bracket"></i> Logout (${rawName})`;
                mobileLoginBtn.onclick = async () => {
                    await window.supabaseAuth.signOut();
                    window.location.reload();
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

/* =====================================================
   LEARNING DASHBOARD
   ===================================================== */

async function loadLearningDashboard() {
    const percentageNodes = {
        listening: ["listening-perc", "listening-bar"],
        speaking: ["speaking-perc", "speaking-bar"],
        reading: ["reading-perc", "reading-bar"],
        writing: ["writing-perc", "writing-bar"]
    };
    const updatePercent = (skill, value) => {
        const [labelId, barId] = percentageNodes[skill];
        const label = document.getElementById(labelId);
        const bar = document.getElementById(barId);
        if (label) label.textContent = `${value}%`;
        if (bar) bar.style.width = `${value}%`;
    };

    if (!window.supabaseClient || !window.supabaseAuth) return;
    const session = await window.supabaseAuth.getSession();
    const user = session?.user;
    if (!user) return;

    const { data: rows, error } = await window.supabaseClient
        .from("practice_results")
        .select("skill, score, max_score, completed_at")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: true });

    if (error) {
        console.error("Could not load learning progress:", error.message);
        return;
    }

    const { data: speakingParts, error: speakingError } = await window.supabaseClient
        .from("speaking_completions")
        .select("part, completed, completed_at")
        .eq("user_id", user.id)
        .eq("completed", true);
    if (speakingError) console.error("Could not load Speaking checklist progress:", speakingError.message);

    const totals = Object.fromEntries(Object.keys(percentageNodes).map(skill => [skill, { score: 0, max: 0 }]));
    const activeDays = new Set();
    (rows || []).forEach(row => {
        const skill = String(row.skill || "").toLowerCase();
        const score = Number(row.score);
        const max = Number(row.max_score);
        if (totals[skill] && Number.isFinite(score) && Number.isFinite(max) && max > 0) {
            totals[skill].score += score;
            totals[skill].max += max;
        }
        if (row.completed_at) activeDays.add(new Date(row.completed_at).toLocaleDateString("en-CA"));
    });

    // Checklist completion counts toward Speaking progress even before a mock test is taken.
    const completedSpeakingParts = speakingParts || [];
    if (completedSpeakingParts.length) {
        totals.speaking.score += completedSpeakingParts.length;
        totals.speaking.max += 3;
        completedSpeakingParts.forEach(row => {
            if (row.completed_at) activeDays.add(new Date(row.completed_at).toLocaleDateString("en-CA"));
        });
    }

    let overallScore = 0;
    let overallMax = 0;
    Object.entries(totals).forEach(([skill, total]) => {
        const pct = total.max ? Math.round((total.score / total.max) * 100) : 0;
        updatePercent(skill, pct);
        overallScore += total.score;
        overallMax += total.max;
    });
    const overall = overallMax ? Math.round((overallScore / overallMax) * 100) : 0;
    const overallNode = document.getElementById("overall-percentage");
    if (overallNode) overallNode.textContent = `${overall}%`;
    const circle = document.querySelector(".progress-circle");
    if (circle) circle.style.background = `conic-gradient(#655bff ${overall * 3.6}deg, #e9e8ff 0deg)`;

    const headline = document.getElementById("progress-headline");
    const description = document.getElementById("progress-description");
    if (headline) headline.textContent = overall ? (overall >= 80 ? "Excellent progress!" : overall >= 50 ? "Good progress!" : "Keep it up!") : "Start practicing!";
    if (description) description.textContent = overall ? "Your progress is based on completed practice results." : "Complete a practice task to see your progress here.";

    const goal = user.user_metadata?.ielts_goal;
    const goalNode = document.getElementById("ielts-goal-value");
    if (goalNode && Number.isFinite(Number(goal)) && Number(goal) >= 0 && Number(goal) <= 9) goalNode.textContent = `Band ${Number(goal).toFixed(1)}`;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cursor = new Date(today);
    const todayKey = today.toLocaleDateString("en-CA");
    if (!activeDays.has(todayKey)) cursor.setDate(cursor.getDate() - 1);
    while (activeDays.has(cursor.toLocaleDateString("en-CA"))) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
    }
    const streakNode = document.getElementById("streak-value");
    if (streakNode) streakNode.textContent = `${streak} ${streak === 1 ? "Day" : "Days"}`;
}

loadLearningDashboard();
