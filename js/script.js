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

function getLocalAuthUser() {
    if (window.supabaseAuth && typeof window.supabaseAuth.getLocalUser === "function") {
        const u = window.supabaseAuth.getLocalUser();
        if (u) return u;
    }
    try {
        const customUser = localStorage.getItem("grammarium_user");
        if (customUser) {
            const parsed = JSON.parse(customUser);
            if (parsed && (parsed.id || parsed.email)) return parsed;
        }
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith("sb-") && key.endsWith("-auth-token")) {
                const item = localStorage.getItem(key);
                if (item) {
                    const parsed = JSON.parse(item);
                    const user = parsed?.user || parsed?.currentSession?.user || null;
                    if (user && (user.id || user.email)) return user;
                }
            }
        }
    } catch (e) {
        console.warn("Could not read local auth user:", e);
    }
    return null;
}

function renderNavbarForUser(user) {
    if (!user) return;
    const navActions = document.getElementById("navActions");
    const mobileMenu = document.getElementById("mobileMenu");
    const mobileLoginBtn = document.getElementById("mobileLoginBtn");

    const profileName = user.user_metadata?.full_name || user.user_metadata?.name || "";
    const emailName = String(user.email || "").split("@")[0];
    const displayName = String(profileName || emailName || "Student").trim();
    const initial = (Array.from(displayName)[0] || "U").toUpperCase();

    // 1. Desktop Nav Actions
    if (navActions) {
        const wrapper = document.createElement("div");
        wrapper.className = "user-nav-wrapper";

        const chip = document.createElement("div");
        chip.className = "user-nav-chip";
        chip.title = user.email ? `Signed in as ${user.email}` : "Signed in";

        const avatar = document.createElement("span");
        avatar.className = "user-avatar-circle";
        avatar.setAttribute("aria-hidden", "true");
        avatar.textContent = initial;

        const name = document.createElement("span");
        name.className = "user-nav-name";
        name.textContent = displayName;

        chip.append(avatar, name);

        const logout = document.createElement("button");
        logout.type = "button";
        logout.className = "nav-logout-btn";
        logout.id = "navSignOutBtn";
        logout.setAttribute("aria-label", "Sign out");
        logout.title = "Sign out";
        logout.innerHTML = '<i class="fa-solid fa-arrow-right-from-bracket" aria-hidden="true"></i> <span>Sign Out</span>';

        logout.addEventListener("click", async () => {
            logout.disabled = true;
            logout.innerHTML = '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> <span>Signing out...</span>';
            try {
                localStorage.removeItem("grammarium_user");
            } catch (e) {}
            if (window.supabaseAuth && typeof window.supabaseAuth.signOut === "function") {
                await window.supabaseAuth.signOut();
            }
            window.location.reload();
        });

        wrapper.append(chip, logout);
        navActions.replaceChildren(wrapper);
    }

    // 2. Mobile Nav Actions
    if (mobileMenu) {
        let mobileUserBox = document.getElementById("mobileUserBox");
        if (!mobileUserBox) {
            mobileUserBox = document.createElement("div");
            mobileUserBox.className = "mobile-user-box";
            mobileUserBox.id = "mobileUserBox";
        }
        mobileUserBox.innerHTML = `
            <span class="user-avatar-circle" aria-hidden="true">${initial}</span>
            <span class="user-nav-name">${displayName}</span>
        `;

        let mobileSignOutBtn = document.getElementById("mobileSignOutBtn");
        if (!mobileSignOutBtn) {
            mobileSignOutBtn = document.createElement("button");
            mobileSignOutBtn.type = "button";
            mobileSignOutBtn.className = "mobile-logout-btn";
            mobileSignOutBtn.id = "mobileSignOutBtn";
        }
        mobileSignOutBtn.innerHTML = '<i class="fa-solid fa-arrow-right-from-bracket" aria-hidden="true"></i> Sign Out';
        mobileSignOutBtn.onclick = async () => {
            mobileSignOutBtn.disabled = true;
            try {
                localStorage.removeItem("grammarium_user");
            } catch (e) {}
            if (window.supabaseAuth && typeof window.supabaseAuth.signOut === "function") {
                await window.supabaseAuth.signOut();
            }
            window.location.reload();
        };

        if (mobileLoginBtn) {
            mobileLoginBtn.style.display = "none";
        }
        if (!mobileUserBox.parentElement) mobileMenu.appendChild(mobileUserBox);
        if (!mobileSignOutBtn.parentElement) mobileMenu.appendChild(mobileSignOutBtn);
    }
}

function renderNavbarSignedOut() {
    const navActions = document.getElementById("navActions");
    const mobileLoginBtn = document.getElementById("mobileLoginBtn");
    const mobileUserBox = document.getElementById("mobileUserBox");
    const mobileSignOutBtn = document.getElementById("mobileSignOutBtn");

    if (mobileUserBox) mobileUserBox.remove();
    if (mobileSignOutBtn) mobileSignOutBtn.remove();
    if (mobileLoginBtn) {
        mobileLoginBtn.style.display = "";
        mobileLoginBtn.textContent = "Login";
        mobileLoginBtn.onclick = () => { window.location.href = "pages/login.html"; };
    }

    if (navActions && !navActions.querySelector(".login-btn")) {
        const loginLink = document.createElement("a");
        loginLink.className = "login-btn";
        loginLink.href = "pages/login.html";
        loginLink.textContent = "Login";

        const signupLink = document.createElement("a");
        signupLink.className = "signup-btn";
        signupLink.href = "pages/login.html?mode=signup";
        signupLink.textContent = "Get Started";

        navActions.replaceChildren(loginLink, signupLink);
    }
}

async function syncNavbarAuthState(sessionFromAuthEvent, hasAuthEventSession = false) {
    const syncVersion = ++navbarSyncVersion;

    // 1. Instant optimistic sync from local storage
    const localUser = getLocalAuthUser();
    if (localUser) {
        renderNavbarForUser(localUser);
    }

    if (!window.supabaseAuth || !window.isSupabaseConfigured || !window.isSupabaseConfigured()) {
        if (!localUser) renderNavbarSignedOut();
        return;
    }

    try {
        let session = null;
        if (hasAuthEventSession) {
            session = sessionFromAuthEvent;
        } else if (typeof window.supabaseAuth.getSession === "function") {
            session = await Promise.race([
                window.supabaseAuth.getSession(),
                new Promise(resolve => setTimeout(() => resolve(null), 3000))
            ]);
        }

        if (syncVersion !== navbarSyncVersion) return;

        let user = session?.user || null;
        if (user) {
            try { localStorage.setItem("grammarium_user", JSON.stringify(user)); } catch (e) {}
            renderNavbarForUser(user);
            loadLearningDashboard(user);
        } else if (session === null && !localUser) {
            try { localStorage.removeItem("grammarium_user"); } catch (e) {}
            renderNavbarSignedOut();
            loadLearningDashboard(null);
        }
    } catch (err) {
        console.warn("Auth navbar sync error:", err);
    }
}

// Run on page load
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => syncNavbarAuthState());
} else {
    syncNavbarAuthState();
}

// React to session change events safely outside internal GoTrue locks
if (window.supabaseAuth && typeof window.supabaseAuth.onAuthStateChange === "function") {
    window.supabaseAuth.onAuthStateChange((event, session) => {
        setTimeout(() => {
            if (event === "SIGNED_OUT") {
                try { localStorage.removeItem("grammarium_user"); } catch (e) {}
                renderNavbarSignedOut();
                loadLearningDashboard(null);
            } else if (session?.user) {
                try { localStorage.setItem("grammarium_user", JSON.stringify(session.user)); } catch (e) {}
                renderNavbarForUser(session.user);
                loadLearningDashboard(session.user);
            } else if (event === "INITIAL_SESSION" && !session) {
                if (!getLocalAuthUser()) {
                    renderNavbarSignedOut();
                    loadLearningDashboard(null);
                }
            }
        }, 0);
    });
}

// Refresh when window regains focus, is restored from cache, or storage updates
let navbarRefreshTimer;
function refreshNavbarAuthState() {
    window.clearTimeout(navbarRefreshTimer);
    navbarRefreshTimer = window.setTimeout(() => syncNavbarAuthState(), 50);
}
window.addEventListener("pageshow", refreshNavbarAuthState);
window.addEventListener("focus", refreshNavbarAuthState);
window.addEventListener("storage", refreshNavbarAuthState);

/* =====================================================
   LEARNING DASHBOARD
   ===================================================== */

async function loadLearningDashboard(providedUser) {
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

    let user = providedUser;
    if (!user) {
        user = getLocalAuthUser();
    }
    if (!user && window.supabaseAuth?.getSession) {
        try {
            const session = await Promise.race([
                window.supabaseAuth.getSession(),
                new Promise(resolve => setTimeout(() => resolve(null), 2500))
            ]);
            user = session?.user || null;
        } catch (e) {
            console.warn("Could not retrieve session for dashboard:", e);
        }
    }

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
