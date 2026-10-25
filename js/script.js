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

    window.location.href = "pages/listening.html";

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
    const modules = {
        listening: { total: 8, label: "Listening" },
        speaking: { total: 3, label: "Speaking" },
        reading: { total: 8, label: "Reading" },
        writing: { total: 4, label: "Writing" }
    };
    const percentageNodes = {
        listening: { percentage: "listening-perc", count: "listening-count", bar: "listening-bar" },
        speaking: { percentage: "speaking-perc", count: "speaking-count", bar: "speaking-bar" },
        reading: { percentage: "reading-perc", count: "reading-count", bar: "reading-bar" },
        writing: { percentage: "writing-perc", count: "writing-count", bar: "writing-bar" }
    };
    const syncStatus = document.getElementById("progression-sync-status");
    const overallNode = document.getElementById("overall-percentage");
    if (!overallNode) return;

    const renderModule = (skill, completed) => {
        const { total } = modules[skill];
        const percent = Math.round((completed / total) * 100);
        const nodes = percentageNodes[skill];
        const label = document.getElementById(nodes.percentage);
        const count = document.getElementById(nodes.count);
        const bar = document.getElementById(nodes.bar);
        const track = bar?.parentElement;
        if (label) label.textContent = `${percent}%`;
        if (count) count.textContent = `${completed} / ${total}`;
        if (bar) bar.style.width = `${percent}%`;
        if (track) track.setAttribute("aria-valuenow", String(percent));
        return { completed, total };
    };

    const renderOverall = moduleTotals => {
        const complete = Object.values(moduleTotals).reduce((sum, value) => sum + value.completed, 0);
        const total = Object.values(moduleTotals).reduce((sum, value) => sum + value.total, 0);
        const percent = total ? Math.round((complete / total) * 100) : 0;
        overallNode.textContent = `${percent}%`;
        const ring = document.getElementById("overall-progress-ring");
        if (ring) {
            ring.style.background = `conic-gradient(#655bff ${percent * 3.6}deg, #e9e8ff 0deg)`;
            ring.setAttribute("aria-valuenow", String(percent));
        }
        const count = document.getElementById("overall-activity-count");
        if (count) count.textContent = `${complete} of ${total} activities complete`;
        const headline = document.getElementById("progress-headline");
        if (headline) headline.textContent = percent === 100 ? "All modules completed!" : percent >= 75 ? "Excellent progress!" : percent >= 40 ? "Good progress!" : percent ? "Keep building your streak!" : "Start practicing!";
        const description = document.getElementById("progress-description");
        if (description) description.textContent = percent === 100 ? "You have completed every tracked activity." : "Complete activities in any module to move your progress forward.";
        return percent;
    };

    if (!window.supabaseClient || !window.supabaseAuth) {
        Object.keys(modules).forEach(skill => renderModule(skill, 0));
        renderOverall(Object.fromEntries(Object.entries(modules).map(([skill, module]) => [skill, { completed: 0, total: module.total }])));
        if (syncStatus) syncStatus.textContent = "Connect and sign in to sync saved checklist progress.";
        return;
    }
    const session = await window.supabaseAuth.getSession();
    const user = session?.user;
    if (!user) {
        Object.keys(modules).forEach(skill => renderModule(skill, 0));
        renderOverall(Object.fromEntries(Object.entries(modules).map(([skill, module]) => [skill, { completed: 0, total: module.total }])));
        if (syncStatus) syncStatus.textContent = "Sign in to view your saved checklist progress.";
        return;
    }

    if (syncStatus) syncStatus.textContent = "Syncing saved checklist progress...";

    const { data: completions, error: completionError } = await window.supabaseClient
        .from("learning_completions")
        .select("skill, item_key, completed, completed_at")
        .eq("user_id", user.id)
        .eq("completed", true);
    if (completionError) {
        console.error("Could not load checklist progress:", completionError.message);
        if (syncStatus) syncStatus.textContent = "Progress sync failed. Reload to try again.";
        return;
    }

    const completedItems = Object.fromEntries(Object.keys(modules).map(skill => [skill, new Set()]));
    const activeDays = new Set();
    (completions || []).forEach(row => {
        const skill = String(row.skill || "").toLowerCase();
        const item = String(row.item_key || "").toLowerCase();
        if (completedItems[skill] && item) completedItems[skill].add(item);
        if (row.completed_at) {
            const date = new Date(row.completed_at);
            if (!Number.isNaN(date.getTime())) {
                activeDays.add(`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`);
            }
        }
    });

    const moduleTotals = Object.fromEntries(Object.entries(modules).map(([skill, module]) => {
        const completed = Math.min(completedItems[skill].size, module.total);
        return [skill, renderModule(skill, completed)];
    }));
    renderOverall(moduleTotals);

    const goal = user.user_metadata?.ielts_goal;
    const goalNode = document.getElementById("ielts-goal-value");
    if (goalNode && goal !== undefined && Number.isFinite(Number(goal)) && Number(goal) >= 0 && Number(goal) <= 9) {
        goalNode.textContent = `Band ${Number(goal).toFixed(1)}`;
    }
    let streak = 0;
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    const dayKey = date => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    if (!activeDays.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
    while (activeDays.has(dayKey(cursor))) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
    }
    const streakNode = document.getElementById("streak-value");
    if (streakNode) streakNode.textContent = `${streak} ${streak === 1 ? "Day" : "Days"}`;
    if (syncStatus) {
        syncStatus.textContent = `Synced from saved checkboxes | ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
    }
}

loadLearningDashboard();

/* Per-item completion checklists for all four learning skills. */
document.addEventListener("DOMContentLoaded", initLearningChecklist);

async function initLearningChecklist() {
    const checks = [...document.querySelectorAll("[data-learning-skill][data-learning-item]")];
    if (!checks.length) return;
    const saveButton = document.querySelector("[data-save-learning-progress]");
    const status = document.querySelector("[data-learning-save-status]");
    const showStatus = message => { if (status) status.textContent = message; };
    if (!window.supabaseClient || !window.supabaseAuth) {
        if (saveButton) saveButton.disabled = true;
        showStatus("Progress saving is unavailable. Check your connection and sign in again.");
        return;
    }
    const session = await window.supabaseAuth.getSession();
    const user = session?.user;
    if (!user) {
        if (saveButton) saveButton.disabled = true;
        showStatus("Sign in to load and save your progress.");
        return;
    }

    if (saveButton) saveButton.disabled = true;
    showStatus("Loading saved progress...");

    const { data, error } = await window.supabaseClient
        .from("learning_completions")
        .select("skill, item_key, completed")
        .eq("user_id", user.id);
    if (error) {
        console.error("Could not load learning checklist:", error.message);
        showStatus("Couldn't load saved progress. Refresh and try again.");
        return;
    }

    const completed = new Set((data || []).filter(row => row.completed).map(row => `${row.skill}:${row.item_key}`));
    checks.forEach(check => {
        const skill = check.dataset.learningSkill;
        const itemKey = check.dataset.learningItem;
        check.checked = completed.has(`${skill}:${itemKey}`);
        check.addEventListener("click", event => event.stopPropagation());
        check.closest("label")?.addEventListener("click", event => event.stopPropagation());
    });
    if (checks[0].dataset.learningSkill === "speaking") updateSpeakingMockAvailability();

    const skill = checks[0].dataset.learningSkill;
    if (!saveButton || checks.some(check => check.dataset.learningSkill !== skill)) {
        showStatus("Checklist controls are incomplete. Refresh this page and try again.");
        return;
    }
    checks.forEach(check => check.addEventListener("change", async () => {
        const completed = check.checked;
        check.disabled = true;
        showStatus("Saving your checkbox...");
        try {
            const { error: saveError } = await window.supabaseClient
                .from("learning_completions")
                .upsert({
                    user_id: user.id,
                    skill: check.dataset.learningSkill,
                    item_key: check.dataset.learningItem,
                    completed,
                    completed_at: completed ? new Date().toISOString() : null
                }, { onConflict: "user_id,skill,item_key" });
            if (saveError) throw saveError;
            if (skill === "speaking") updateSpeakingMockAvailability();
            showStatus("Checkbox saved. Dashboard progress will sync from this activity.");
        } catch (saveError) {
            check.checked = !completed;
            console.error("Could not save learning checkbox:", saveError.message || saveError);
            showStatus("Couldn't save this checkbox. Please try again.");
        } finally {
            check.disabled = false;
        }
    }));
    saveButton.disabled = false;
    showStatus("Your saved progress is up to date.");

    saveButton.addEventListener("click", async event => {
        event.stopPropagation();
        saveButton.disabled = true;
        showStatus("Saving your progress...");
        const timestamp = new Date().toISOString();
        const updates = checks.map(check => ({
            user_id: user.id,
            skill,
            item_key: check.dataset.learningItem,
            completed: check.checked,
            completed_at: check.checked ? timestamp : null
        }));
        try {
            const { error: saveError } = await window.supabaseClient
                .from("learning_completions")
                .upsert(updates, { onConflict: "user_id,skill,item_key" });
            if (saveError) throw saveError;
            if (skill === "speaking") updateSpeakingMockAvailability();
            await loadLearningDashboard();
            showStatus("Progress saved and dashboard updated.");
        } catch (saveError) {
            console.error("Could not save learning checklist:", saveError.message || saveError);
            showStatus("Couldn't save your progress. Please try again.");
        } finally {
            saveButton.disabled = false;
        }
    });
