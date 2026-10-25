/* =====================================================
   MOBILE MENU
===================================================== */

const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");

if (menuBtn && mobileMenu) menuBtn.addEventListener("click", () => {

    mobileMenu.classList.toggle("open");

    const icon = menuBtn.querySelector("i");
    if (!icon) return;

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

        if (!mobileMenu || !menuBtn) return;

        mobileMenu.classList.remove("open");

        const icon = menuBtn.querySelector("i");
        if (!icon) return;

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

    if (!testModal) return;

    testModal.classList.add("show");

    document.body.style.overflow = "hidden";

}


function closeTestModal() {

    if (!testModal) return;

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

let navbarSyncVersion = 0;

async function syncNavbarAuthState(sessionFromAuthEvent, hasAuthEventSession = false) {
    const syncVersion = ++navbarSyncVersion;
    const navActions = document.getElementById("navActions");
    const mobileLoginBtn = document.getElementById("mobileLoginBtn");
    const setDestination = (element, destination) => {
        if (!element) return;
        if (element instanceof HTMLAnchorElement) element.href = destination;
        else element.onclick = () => { window.location.href = destination; };
    };
    const setSignedOutNavigation = () => {
        if (navActions && !navActions.querySelector(".login-btn")) {
            const loginLink = document.createElement("a");
            loginLink.className = "login-btn";
            loginLink.textContent = "Login";
            const signupLink = document.createElement("a");
            signupLink.className = "signup-btn";
            signupLink.textContent = "Get Started";
            navActions.replaceChildren(loginLink, signupLink);
        }
        document.querySelectorAll(".login-btn").forEach(link => setDestination(link, "pages/login.html"));
        document.querySelectorAll(".signup-btn").forEach(link => setDestination(link, "pages/login.html?mode=signup"));
        if (mobileLoginBtn) {
            mobileLoginBtn.textContent = "Login";
            mobileLoginBtn.onclick = () => { window.location.href = "pages/login.html"; };
        }
    };

    if (!window.supabaseAuth || !window.isSupabaseConfigured || !window.isSupabaseConfigured()) {
        setSignedOutNavigation();
        return;
    }

    try {
        const session = hasAuthEventSession ? sessionFromAuthEvent : await window.supabaseAuth.getSession();
        if (syncVersion !== navbarSyncVersion) return;
        let user = session?.user || null;
        // Some browsers restore local auth storage after the page scripts run.
        // Retry briefly before replacing the navbar with signed-out links.
        if (!user && !hasAuthEventSession && typeof window.supabaseAuth.getUser === "function") {
            for (let attempt = 0; attempt < 4 && !user; attempt++) {
                if (attempt) await new Promise(resolve => window.setTimeout(resolve, 250 * attempt));
                user = await window.supabaseAuth.getUser();
                if (syncVersion !== navbarSyncVersion) return;
            }
        }

        if (user && navActions) {
            const profileName = user.user_metadata?.full_name || user.user_metadata?.name || "";
            const emailName = String(user.email || "").split("@")[0];
            const displayName = String(profileName || emailName || "Account").trim();
            const chip = document.createElement("div");
            chip.className = "user-nav-chip";
            chip.title = user.email ? `Signed in as ${user.email}` : "Signed in";

            const avatar = document.createElement("span");
            avatar.className = "user-avatar-circle";
            avatar.textContent = Array.from(displayName)[0]?.toUpperCase() || "A";
            avatar.setAttribute("aria-hidden", "true");

            const name = document.createElement("span");
            name.className = "user-nav-name";
            name.textContent = displayName;

            const logout = document.createElement("button");
            logout.type = "button";
            logout.className = "nav-logout-btn";
            logout.setAttribute("aria-label", "Sign out");
            logout.title = "Sign out";
            logout.innerHTML = '<i class="fa-solid fa-arrow-right-from-bracket" aria-hidden="true"></i>';
            logout.addEventListener("click", async () => {
                logout.disabled = true;
                logout.innerHTML = '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>';
                const { error } = await window.supabaseAuth.signOut();
                if (error) {
                    console.error("Could not sign out:", error.message);
                    logout.disabled = false;
                    logout.innerHTML = '<i class="fa-solid fa-arrow-right-from-bracket" aria-hidden="true"></i>';
                    return;
                }
                window.location.reload();
            });
            chip.append(avatar, name, logout);
            navActions.replaceChildren(chip);

            if (mobileLoginBtn) {
                mobileLoginBtn.innerHTML = `<i class="fa-solid fa-arrow-right-from-bracket" aria-hidden="true"></i> Logout (${displayName})`;
                mobileLoginBtn.onclick = async () => {
                    mobileLoginBtn.disabled = true;
                    const { error } = await window.supabaseAuth.signOut();
                    if (error) {
                        console.error("Could not sign out:", error.message);
                        mobileLoginBtn.disabled = false;
                        return;
                    }
                    window.location.reload();
                };
            }
        } else {
            setSignedOutNavigation();
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
    window.supabaseAuth.onAuthStateChange((event, session) => {
        // Retry the persisted-session lookup if the initial auth event arrives
        // before Supabase has finished restoring storage in this browser.
        if (event === "INITIAL_SESSION" && !session) {
            window.setTimeout(() => syncNavbarAuthState(), 0);
            return;
        }
        syncNavbarAuthState(session, true);
    });
}

// A page restored from the back-forward cache may not rerun its load handlers.
// Refresh the navbar when the user returns to the tab or another tab changes auth.
let navbarRefreshTimer;
function refreshNavbarAuthState() {
    window.clearTimeout(navbarRefreshTimer);
    navbarRefreshTimer = window.setTimeout(() => syncNavbarAuthState(), 0);
}
window.addEventListener("pageshow", refreshNavbarAuthState);
window.addEventListener("focus", refreshNavbarAuthState);
window.addEventListener("storage", refreshNavbarAuthState);

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
            await loadLearningDashboard();
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
