/* =====================================================
   MOBILE MENU
===================================================== */

const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");

if (menuBtn && mobileMenu) menuBtn.addEventListener("click", () => {

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


if (testBtn) testBtn.addEventListener("click", openModal);

if (ctaBtn) ctaBtn.addEventListener("click", openModal);

if (closeModal) closeModal.addEventListener("click", closeTestModal);


/* Close when clicking outside */

if (testModal) testModal.addEventListener("click", (event) => {

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

if (modalStart) modalStart.addEventListener("click", () => {

    window.location.href = "pages/assessment.html";

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
   SIGN-IN GATE FOR HOMEPAGE LEARNING ACTIONS
===================================================== */

function initHomepageAuthGate() {
    const gate = document.getElementById("authGateModal");
    if (!gate) return;
    const closeButton = document.getElementById("authGateClose");
    const signInLink = document.getElementById("authGateSignIn");
    const signUpLink = document.getElementById("authGateSignUp");
    let pendingDestination = "";

    const openGate = async (destination) => {
        const session = await window.supabaseAuth?.getSession();
        if (session?.user) {
            if (destination) window.location.assign(destination);
            return true;
        }
        pendingDestination = destination || "";
        const suffix = pendingDestination ? `?next=${encodeURIComponent(pendingDestination)}` : "";
        if (signInLink) signInLink.href = `pages/login.html${suffix}`;
        if (signUpLink) signUpLink.href = `pages/login.html?mode=signup${pendingDestination ? `&next=${encodeURIComponent(pendingDestination)}` : ""}`;
        gate.classList.add("show");
        gate.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        return false;
    };

    const closeGate = () => {
        gate.classList.remove("show");
        gate.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
        pendingDestination = "";
    };

    if (closeButton) closeButton.addEventListener("click", closeGate);
    gate.addEventListener("click", event => { if (event.target === gate) closeGate(); });
    document.addEventListener("keydown", event => { if (event.key === "Escape" && gate.classList.contains("show")) closeGate(); });

    const learningSelector = 'a[href$="pages/listening.html"], a[href$="pages/speaking.html"], a[href$="pages/reading.html"], a[href$="pages/writing.html"], a[href^="pages/listening.html?"], a[href^="pages/reading.html?"], .skill-card[onclick*="pages/listening.html"], .skill-card[onclick*="pages/speaking.html"], .skill-card[onclick*="pages/reading.html"], .skill-card[onclick*="pages/writing.html"], .skill-row[onclick*="pages/listening.html"], .skill-row[onclick*="pages/speaking.html"], .skill-row[onclick*="pages/reading.html"], .skill-row[onclick*="pages/writing.html"]';
    document.querySelectorAll(learningSelector).forEach(element => {
        if (element.closest(".skill-card") || element.closest(".skill-row")) return;
        element.addEventListener("click", async event => {
            const session = await window.supabaseAuth?.getSession();
            if (session?.user) return;
            event.preventDefault();
            event.stopImmediatePropagation();
            const destination = element instanceof HTMLAnchorElement ? element.getAttribute("href") : (element.getAttribute("onclick")?.match(/'([^']+\.html[^']*)'/)?.[1] || "");
            openGate(destination);
        }, true);
    });

    document.querySelectorAll(".hero-buttons a").forEach(element => {
        element.addEventListener("click", async event => {
            const session = await window.supabaseAuth?.getSession();
            if (session?.user) return;
            if (element.getAttribute("href") === "#skills" || element.getAttribute("href") === "#ielts") {
                event.preventDefault();
                event.stopImmediatePropagation();
                openGate("");
                return;
            }
            event.preventDefault();
            event.stopImmediatePropagation();
            openGate("");
        }, true);
    });

    if (testBtn) {
        testBtn.addEventListener("click", async event => {
            const session = await window.supabaseAuth?.getSession();
            if (session?.user) return;
            event.preventDefault();
            event.stopImmediatePropagation();
            openGate("pages/listening.html");
        }, true);
    }

    const navActions = document.getElementById("navActions");
    const mobileLogin = document.getElementById("mobileLoginBtn");
    if (navActions && !document.querySelector(".user-nav-chip")) {
        navActions.querySelectorAll("button").forEach(button => button.addEventListener("click", () => {
            if (button.classList.contains("signup-btn")) window.location.href = "pages/login.html?mode=signup";
            else window.location.href = "pages/login.html";
        }));
    }
    if (mobileLogin && !mobileLogin.textContent.toLowerCase().includes("logout")) {
        mobileLogin.addEventListener("click", event => { event.preventDefault(); window.location.href = "pages/login.html"; });
    }
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initHomepageAuthGate);
else initHomepageAuthGate();


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
            btn.onclick = () => { window.location.href = "pages/login.html"; };
        });
        document.querySelectorAll(".signup-btn").forEach(btn => {
            btn.onclick = () => { window.location.href = "pages/login.html?mode=signup"; };
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
                btn.onclick = () => { window.location.href = "pages/login.html"; };
            });
            document.querySelectorAll(".signup-btn").forEach(btn => {
                btn.onclick = () => { window.location.href = "pages/login.html?mode=signup"; };
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
        if (!percentageNodes[skill]) return;
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

    // Fetch practice test scores
    const { data: rows, error } = await window.supabaseClient
        .from("practice_results")
        .select("skill, score, max_score, completed_at")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: true });

    if (error) {
        console.error("Could not load learning progress:", error.message);
        return;
    }

    // Fetch checklist item completions
    const { data: completions, error: completionError } = await window.supabaseClient
        .from("learning_completions")
        .select("skill, item_key, completed, completed_at")
        .eq("user_id", user.id)
        .eq("completed", true);
    if (completionError) console.error("Could not load checklist progress:", completionError.message);

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

    const checklistRows = completions || [];
    const completedSet = new Set(checklistRows.map(row => `${row.skill}:${row.item_key}`));

    // IELTS Track Calculations
    Object.keys(totals).forEach(skill => {
        const skillCompletions = checklistRows.filter(row => row.skill === skill);
        const uniqueItems = new Set(skillCompletions.map(row => row.item_key));
        const expectedItems = { listening: 8, speaking: 3, reading: 8, writing: 4 }[skill] || 5;
        totals[skill].score += Math.min(uniqueItems.size, expectedItems);
        totals[skill].max += expectedItems;
    });
    checklistRows.forEach(row => {
        if (row.completed_at) activeDays.add(new Date(row.completed_at).toLocaleDateString("en-CA"));
    });

    let ieltsScore = 0;
    let ieltsMax = 0;
    Object.entries(totals).forEach(([skill, total]) => {
        const pct = total.max ? Math.round((total.score / total.max) * 100) : 0;
        updatePercent(skill, pct);
        ieltsScore += total.score;
        ieltsMax += total.max;
    });
    const ieltsOverallPct = ieltsMax ? Math.round((ieltsScore / ieltsMax) * 100) : 0;

    const ieltsTrackNode = document.getElementById("ielts-track-perc");
    const ieltsTrackBar = document.getElementById("ielts-track-bar");
    if (ieltsTrackNode) ieltsTrackNode.textContent = `${ieltsOverallPct}%`;
    if (ieltsTrackBar) ieltsTrackBar.style.width = `${ieltsOverallPct}%`;

    // Engineering English Track Calculations
    const engCategories = {
        projects: { items: ["eng-proj-pitch", "eng-proj-viva"], name: "Projects & Viva" },
        presentations: { items: ["eng-pres-open", "eng-pres-charts"], name: "Presentations" },
        interviews: { items: ["eng-int-intro", "eng-int-star"], name: "Interviews" },
        professional: { items: ["eng-prof-email", "eng-gd-phrases", "eng-tech-vocab", "eng-career-resume"], name: "Workplace & Career" }
    };

    let engScore = 0;
    let engMax = 0;
    Object.entries(engCategories).forEach(([catKey, catData]) => {
        const done = catData.items.filter(item => completedSet.has(`engineering:${item}`)).length;
        const total = catData.items.length;
        const pct = Math.round((done / total) * 100);

        engScore += done;
        engMax += total;

        const percEl = document.getElementById(`eng-${catKey}-perc`);
        const barEl = document.getElementById(`eng-${catKey}-bar`);
        if (percEl) percEl.textContent = `${pct}%`;
        if (barEl) barEl.style.width = `${pct}%`;
    });
    const engOverallPct = engMax ? Math.round((engScore / engMax) * 100) : 0;

    const engTrackNode = document.getElementById("engineering-track-perc");
    const engTrackBar = document.getElementById("engineering-track-bar");
    if (engTrackNode) engTrackNode.textContent = `${engOverallPct}%`;
    if (engTrackBar) engTrackBar.style.width = `${engOverallPct}%`;

    // Overall Combined English Proficiency
    const combinedTotalScore = ieltsScore + engScore;
    const combinedTotalMax = ieltsMax + engMax;
    const overall = combinedTotalMax ? Math.round((combinedTotalScore / combinedTotalMax) * 100) : 0;

    const overallNode = document.getElementById("overall-percentage");
    if (overallNode) overallNode.textContent = `${overall}%`;
    const circle = document.querySelector(".progress-circle");
    if (circle) circle.style.background = `conic-gradient(#655bff ${overall * 3.6}deg, #e9e8ff 0deg)`;

    const headline = document.getElementById("progress-headline");
    const description = document.getElementById("progress-description");
    if (headline) headline.textContent = overall ? (overall >= 80 ? "Excellent Mastery!" : overall >= 50 ? "Solid Progress!" : "Keep it up!") : "Start your learning!";
    if (description) description.textContent = overall ? "Calculated from completed IELTS tests and engineering modules." : "Complete a practice task or engineering module to see progress.";

    // IELTS Goal & Streak
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

    // Continue Learning Component (Finds next incomplete lesson)
    renderContinueLearning(completedSet);

    // Rule-Based Recommendations Component
    renderRecommendations(ieltsOverallPct, engOverallPct, totals);
}

function renderContinueLearning(completedSet) {
    const continueCard = document.getElementById("continueLearningBox");
    if (!continueCard) return;

    const curriculumSequence = [
        { skill: "engineering", item: "eng-proj-pitch", title: "Project Pitch — The 60-Second Elevator Formula", module: "Projects", url: "pages/engineering-modules.html?module=projects" },
        { skill: "engineering", item: "eng-proj-viva", title: "Project Viva — Defending Technical Choices", module: "Projects", url: "pages/engineering-modules.html?module=projects" },
        { skill: "engineering", item: "eng-pres-open", title: "Presentation Skills — Technical Opening Hooks", module: "Presentations", url: "pages/engineering-modules.html?module=presentations" },
        { skill: "engineering", item: "eng-int-intro", title: "Job Interviews — The 90-Second Tech Introduction", module: "Interviews", url: "pages/engineering-modules.html?module=interviews" },
        { skill: "engineering", item: "eng-int-star", title: "Job Interviews — STAR Method for Technical Challenges", module: "Interviews", url: "pages/engineering-modules.html?module=interviews" },
        { skill: "listening", item: "task1", title: "IELTS Listening Task 1 — Form Completion Practice", module: "IELTS Listening", url: "pages/listening.html" },
        { skill: "speaking", item: "part1", title: "IELTS Speaking Part 1 — Introduction & Fluency", module: "IELTS Speaking", url: "pages/speaking-part1.html" },
        { skill: "writing", item: "task2a", title: "IELTS Writing Task 2 — Academic Discursive Essay", module: "IELTS Writing", url: "pages/writing2.html" }
    ];

    const nextLesson = curriculumSequence.find(c => !completedSet.has(`${c.skill}:${c.item}`)) || curriculumSequence[0];

    continueCard.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">
            <div>
                <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; background: #eeedff; color: var(--primary); padding: 4px 10px; border-radius: 20px;">
                    RESUME WHERE YOU LEFT OFF
                </span>
                <h3 style="font-size: 19px; font-weight: 800; color: var(--dark); margin: 10px 0 6px 0;">
                    ${nextLesson.title}
                </h3>
                <p style="font-size: 13.5px; color: var(--muted); margin: 0;">
                    Module: <strong>${nextLesson.module}</strong>
                </p>
            </div>
            <a href="${nextLesson.url}" class="primary-btn" style="padding: 10px 22px; font-size: 14px; white-space: nowrap;">
                Continue Lesson <i class="fa-solid fa-arrow-right"></i>
            </a>
        </div>
    `;
}

function renderRecommendations(ieltsPct, engPct, skillTotals) {
    const recBox = document.getElementById("dashboardRecommendations");
    if (!recBox) return;

    const recs = [];

    if (engPct < 60) {
        recs.push({
            icon: "fa-solid fa-laptop-code",
            bg: "#ecfdf3",
            color: "#027a48",
            title: "Master Your Engineering Project Viva",
            desc: "Learn to defend design architectures and handle challenge questions from professors and external examiners.",
            url: "pages/engineering-modules.html?module=projects",
            action: "Open Project Module"
        });
    }

    if (skillTotals?.writing && (skillTotals.writing.max === 0 || skillTotals.writing.score / skillTotals.writing.max < 0.6)) {
        recs.push({
            icon: "fa-solid fa-pen-nib",
            bg: "#fffaeb",
            color: "#b54708",
            title: "Study IELTS Writing Task 2 Framework",
            desc: "Analyze Band 9 sample discursive essays to improve coherence and cohesion scores.",
            url: "pages/writing2.html",
            action: "View Model Essays"
        });
    }

    if (skillTotals?.speaking && (skillTotals.speaking.max === 0 || skillTotals.speaking.score / skillTotals.speaking.max < 0.6)) {
        recs.push({
            icon: "fa-solid fa-microphone",
            bg: "#fef3f2",
            color: "#b42318",
            title: "Practice Speaking Part 2 Cue Cards",
            desc: "Train to speak uninterrupted for 2 full minutes with native audio recordings.",
            url: "pages/speaking-part2.html",
            action: "Start Cue Card"
        });
    }

    if (recs.length === 0) {
        recs.push({
            icon: "fa-solid fa-trophy",
            bg: "#eeedff",
            color: "#635bff",
            title: "Take a Full IELTS Diagnostic Assessment",
            desc: "Validate your English proficiency with a complete 4-component mock assessment.",
            url: "pages/assessment.html",
            action: "Start Assessment"
        });
    }

    recBox.innerHTML = recs.slice(0, 3).map(r => `
        <div style="background: #ffffff; border: 1.5px solid var(--border); border-radius: 16px; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; transition: all 0.2s ease;">
            <div>
                <div style="width: 40px; height: 40px; border-radius: 10px; background: ${r.bg}; color: ${r.color}; display: flex; align-items: center; justify-content: center; font-size: 18px; margin-bottom: 12px;">
                    <i class="${r.icon}"></i>
                </div>
                <h4 style="font-size: 16px; font-weight: 800; color: var(--dark); margin-bottom: 6px;">${r.title}</h4>
                <p style="font-size: 13px; color: var(--muted); line-height: 1.5; margin-bottom: 16px;">${r.desc}</p>
            </div>
            <a href="${r.url}" style="font-size: 13.5px; font-weight: 700; color: ${r.color}; display: inline-flex; align-items: center; gap: 6px;">
                ${r.action} <i class="fa-solid fa-arrow-right"></i>
            </a>
        </div>
    `).join("");
}

loadLearningDashboard();


/* Per-item completion checklists for all four learning skills. */
document.addEventListener("DOMContentLoaded", initLearningChecklist);

async function initLearningChecklist() {
    const checks = [...document.querySelectorAll("[data-learning-skill][data-learning-item]")];
    if (!checks.length || !window.supabaseClient || !window.supabaseAuth) return;
    const session = await window.supabaseAuth.getSession();
    const user = session?.user;
    if (!user) return;

    const { data, error } = await window.supabaseClient
        .from("learning_completions")
        .select("skill, item_key, completed")
        .eq("user_id", user.id);
    if (error) {
        console.error("Could not load learning checklist:", error.message);
        return;
    }

    const completed = new Set((data || []).filter(row => row.completed).map(row => `${row.skill}:${row.item_key}`));
    checks.forEach(check => {
        const skill = check.dataset.learningSkill;
        const itemKey = check.dataset.learningItem;
        check.checked = completed.has(`${skill}:${itemKey}`);
        check.addEventListener("click", event => event.stopPropagation());
        check.addEventListener("change", async () => {
            check.disabled = true;
            const { error: saveError } = await window.supabaseClient
                .from("learning_completions")
                .upsert({
                    user_id: user.id,
                    skill,
                    item_key: itemKey,
                    completed: check.checked,
                    completed_at: check.checked ? new Date().toISOString() : null
                }, { onConflict: "user_id,skill,item_key" });
            check.disabled = false;
            if (saveError) {
                check.checked = !check.checked;
                console.error("Could not save learning checklist:", saveError.message);
                return;
            }
            if (skill === "speaking") updateSpeakingMockAvailability();
            loadLearningDashboard();
        });
    });
}
