/* ==============================================================================
   EngLish Platform - Student Dashboard Logic
   Connects UI to Supabase database via studentProgressService
   ============================================================================== */

document.addEventListener("DOMContentLoaded", async () => {
    // Current authenticated user and progress cache
    let currentUser = null;
    let currentProgress = null;
    let activeChecklistTab = "listening";
    let toastTimeout = null;

    // ==========================================================================
    // 1. DOM REFERENCES
    // ==========================================================================
    // Top Nav
    const userDisplayName = document.getElementById("userDisplayName");
    const userEmailAddress = document.getElementById("userEmailAddress");
    const userAvatarInitial = document.getElementById("userAvatarInitial");
    const syncStatusIndicator = document.getElementById("syncStatusIndicator");
    const dashLogoutBtn = document.getElementById("dashLogoutBtn");

    // Alerts
    const schemaSetupAlert = document.getElementById("schemaSetupAlert");
    const openSqlModalBtn = document.getElementById("openSqlModalBtn");
    const dismissSchemaAlert = document.getElementById("dismissSchemaAlert");

    // Hero
    const heroStudentName = document.getElementById("heroStudentName");
    const heroTargetBandText = document.getElementById("heroTargetBandText");
    const heroOverallPercentage = document.getElementById("heroOverallPercentage");
    const overallRadialNumber = document.getElementById("overallRadialNumber");
    const overallRingCircle = document.getElementById("overallRingCircle");
    const editGoalBtn = document.getElementById("editGoalBtn");

    // KPIs
    const kpiTargetBandVal = document.getElementById("kpiTargetBandVal");
    const kpiOverallVal = document.getElementById("kpiOverallVal");
    const kpiTasksVal = document.getElementById("kpiTasksVal");
    const kpiFocusVal = document.getElementById("kpiFocusVal");

    // Skill Cards
    const listeningProgressBar = document.getElementById("listeningProgressBar");
    const listeningScorePill = document.getElementById("listeningScorePill");
    const listeningPercentLabel = document.getElementById("listeningPercentLabel");
    const listeningCountText = document.getElementById("listeningCountText");
    const listeningBandBadge = document.getElementById("listeningBandBadge");

    const readingProgressBar = document.getElementById("readingProgressBar");
    const readingScorePill = document.getElementById("readingScorePill");
    const readingPercentLabel = document.getElementById("readingPercentLabel");
    const readingCountText = document.getElementById("readingCountText");
    const readingBandBadge = document.getElementById("readingBandBadge");

    const writingProgressBar = document.getElementById("writingProgressBar");
    const writingScorePill = document.getElementById("writingScorePill");
    const writingPercentLabel = document.getElementById("writingPercentLabel");
    const writingCountText = document.getElementById("writingCountText");
    const writingBandBadge = document.getElementById("writingBandBadge");

    const speakingProgressBar = document.getElementById("speakingProgressBar");
    const speakingScorePill = document.getElementById("speakingScorePill");
    const speakingPercentLabel = document.getElementById("speakingPercentLabel");
    const speakingCountText = document.getElementById("speakingCountText");
    const speakingBandBadge = document.getElementById("speakingBandBadge");

    // Task Checklist
    const tasksChecklistGrid = document.getElementById("tasksChecklistGrid");
    const checkTabBtns = document.querySelectorAll(".check-tab-btn");

    // Modals
    const goalModal = document.getElementById("goalModal");
    const closeGoalModalBtn = document.getElementById("closeGoalModalBtn");
    const cancelGoalBtn = document.getElementById("cancelGoalBtn");
    const goalForm = document.getElementById("goalForm");
    const goalFullNameInput = document.getElementById("goalFullNameInput");
    const goalTargetBandSelect = document.getElementById("goalTargetBandSelect");
    const goalTargetDateInput = document.getElementById("goalTargetDateInput");
    const goalNotesInput = document.getElementById("goalNotesInput");

    const openAdjustModalBtn = document.getElementById("openAdjustModalBtn");
    const adjustModal = document.getElementById("adjustModal");
    const closeAdjustModalBtn = document.getElementById("closeAdjustModalBtn");
    const cancelAdjustBtn = document.getElementById("cancelAdjustBtn");
    const adjustForm = document.getElementById("adjustForm");
    const adjustListeningInput = document.getElementById("adjustListeningInput");
    const adjustReadingInput = document.getElementById("adjustReadingInput");
    const adjustWritingInput = document.getElementById("adjustWritingInput");
    const adjustSpeakingInput = document.getElementById("adjustSpeakingInput");
    const adjustListeningVal = document.getElementById("adjustListeningVal");
    const adjustReadingVal = document.getElementById("adjustReadingVal");
    const adjustWritingVal = document.getElementById("adjustWritingVal");
    const adjustSpeakingVal = document.getElementById("adjustSpeakingVal");

    const sqlModal = document.getElementById("sqlModal");
    const closeSqlModalBtn = document.getElementById("closeSqlModalBtn");
    const copySqlBtn = document.getElementById("copySqlBtn");
    const sqlSnippetCode = document.getElementById("sqlSnippetCode");

    const dashToast = document.getElementById("dashToast");

    // ==========================================================================
    // 2. AUTHENTICATION & INITIALIZATION
    // ==========================================================================
    async function initDashboard() {
        if (!window.supabaseAuth || !window.isSupabaseConfigured?.()) {
            console.error("Supabase not configured. Redirecting to login.");
            window.location.replace("login.html?next=dashboard.html");
            return;
        }

        try {
            const session = await window.supabaseAuth.getSession();
            if (!session || !session.user) {
                window.location.replace("login.html?next=dashboard.html");
                return;
            }

            currentUser = session.user;
            renderUserIdentity(currentUser);

            // Fetch progress from Supabase
            updateSyncStatus("syncing", "Syncing with Supabase...");
            currentProgress = await window.studentProgressService.loadProgress(currentUser);

            if (currentProgress.is_local_fallback) {
                updateSyncStatus("offline", "Cached Locally (Run SQL)");
                if (schemaSetupAlert) schemaSetupAlert.style.display = "flex";
            } else {
                updateSyncStatus("synced", "Synced with Supabase");
                if (schemaSetupAlert) schemaSetupAlert.style.display = "none";
            }

            // Render all UI components
            renderDashboard(currentProgress);
        } catch (err) {
            console.error("Dashboard initialization error:", err);
            updateSyncStatus("offline", "Offline Mode");
        }
    }

    function renderUserIdentity(user) {
        const rawName = (user.user_metadata && user.user_metadata.full_name) ||
            user.email.split("@")[0];
        const initial = rawName.charAt(0).toUpperCase();

        if (userDisplayName) userDisplayName.textContent = rawName;
        if (userEmailAddress) userEmailAddress.textContent = user.email;
        if (userAvatarInitial) userAvatarInitial.textContent = initial;
        if (heroStudentName) heroStudentName.textContent = rawName;
    }

    function updateSyncStatus(status, text) {
        if (!syncStatusIndicator) return;
        syncStatusIndicator.className = `sync-status-indicator ${status}`;
        const syncText = syncStatusIndicator.querySelector(".sync-text");
        if (syncText) syncText.textContent = text;
    }

    // ==========================================================================
    // 3. RENDER DASHBOARD METRICS & PILLARS
    // ==========================================================================
    function renderDashboard(progress) {
        if (!progress) return;

        // Band Target
        const targetBand = Number(progress.target_band) || 7.5;
        if (heroTargetBandText) heroTargetBandText.textContent = targetBand.toFixed(1);
        if (kpiTargetBandVal) kpiTargetBandVal.textContent = targetBand.toFixed(1);

        // Overall Percentage & Radial Gauge
        const overall = window.studentProgressService.calculateOverall(progress);
        if (heroOverallPercentage) heroOverallPercentage.textContent = `${overall}%`;
        if (kpiOverallVal) kpiOverallVal.textContent = `${overall}%`;
        if (overallRadialNumber) overallRadialNumber.textContent = `${overall}%`;

        // Radial gauge stroke offset (circumference = 2 * PI * 54 ≈ 339.292)
        if (overallRingCircle) {
            const circumference = 339.292;
            const offset = circumference - (circumference * overall) / 100;
            overallRingCircle.style.strokeDashoffset = offset;
        }

        // Skill 1: Listening
        const lPercent = progress.listening_progress || 0;
        const lCompleted = (progress.completed_tasks?.listening || []).length;
        if (listeningProgressBar) listeningProgressBar.style.width = `${lPercent}%`;
        if (listeningScorePill) listeningScorePill.textContent = `${lPercent}%`;
        if (listeningPercentLabel) listeningPercentLabel.textContent = `${lPercent}%`;
        if (listeningCountText) listeningCountText.textContent = `${lCompleted} of 8 audio tasks complete`;
        if (listeningBandBadge) listeningBandBadge.textContent = `Est. Band: ${calculateSkillBand(lPercent)}`;

        // Skill 2: Reading
        const rPercent = progress.reading_progress || 0;
        const rCompleted = (progress.completed_tasks?.reading || []).length;
        if (readingProgressBar) readingProgressBar.style.width = `${rPercent}%`;
        if (readingScorePill) readingScorePill.textContent = `${rPercent}%`;
        if (readingPercentLabel) readingPercentLabel.textContent = `${rPercent}%`;
        if (readingCountText) readingCountText.textContent = `${rCompleted} of 8 formats complete`;
        if (readingBandBadge) readingBandBadge.textContent = `Est. Band: ${calculateSkillBand(rPercent)}`;

        // Skill 3: Writing
        const wPercent = progress.writing_progress || 0;
        const wCompleted = (progress.completed_tasks?.writing || []).length;
        if (writingProgressBar) writingProgressBar.style.width = `${wPercent}%`;
        if (writingScorePill) writingScorePill.textContent = `${wPercent}%`;
        if (writingPercentLabel) writingPercentLabel.textContent = `${wPercent}%`;
        if (writingCountText) writingCountText.textContent = `${wCompleted} of 4 tasks complete`;
        if (writingBandBadge) writingBandBadge.textContent = `Est. Band: ${calculateSkillBand(wPercent)}`;

        // Skill 4: Speaking
        const sPercent = progress.speaking_progress || 0;
        const sCompleted = (progress.completed_tasks?.speaking || []).length;
        if (speakingProgressBar) speakingProgressBar.style.width = `${sPercent}%`;
        if (speakingScorePill) speakingScorePill.textContent = `${sPercent}%`;
        if (speakingPercentLabel) speakingPercentLabel.textContent = `${sPercent}%`;
        if (speakingCountText) speakingCountText.textContent = `${sCompleted} of 3 parts complete`;
        if (speakingBandBadge) speakingBandBadge.textContent = `Est. Band: ${calculateSkillBand(sPercent)}`;

        // Total Tasks Count (out of 23)
        const totalCompleted = lCompleted + rCompleted + wCompleted + sCompleted;
        if (kpiTasksVal) kpiTasksVal.textContent = `${totalCompleted} / 23`;

        // Focus Recommendation (Lowest skill)
        const skillsList = [
            { name: "Listening", val: lPercent },
            { name: "Reading", val: rPercent },
            { name: "Writing", val: wPercent },
            { name: "Speaking", val: sPercent }
        ];
        skillsList.sort((a, b) => a.val - b.val);
        const lowest = skillsList[0];
        if (kpiFocusVal) kpiFocusVal.textContent = lowest.name;

        // Render checklist tab
        renderTaskChecklist(activeChecklistTab, progress);
    }

    function calculateSkillBand(percent) {
        if (percent >= 90) return "8.5 - 9.0";
        if (percent >= 75) return "7.5 - 8.0";
        if (percent >= 60) return "7.0";
        if (percent >= 45) return "6.5";
        if (percent >= 30) return "6.0";
        if (percent >= 15) return "5.5";
        return "5.0";
    }

    // ==========================================================================
    // 4. INTERACTIVE CHECKLIST TABS & TASKS
    // ==========================================================================
    function renderTaskChecklist(skill, progress) {
        if (!tasksChecklistGrid) return;
        tasksChecklistGrid.innerHTML = "";

        const tasks = window.TASK_DEFINITIONS[skill] || [];
        const completedList = (progress && progress.completed_tasks && progress.completed_tasks[skill]) || [];

        tasks.forEach((task) => {
            const isCompleted = completedList.includes(task.id);

            const card = document.createElement("div");
            card.className = `task-item-card ${isCompleted ? "completed" : ""}`;
            card.setAttribute("role", "checkbox");
            card.setAttribute("aria-checked", isCompleted ? "true" : "false");
            card.tabIndex = 0;

            card.innerHTML = `
                <div class="task-checkbox-box">
                    <i class="fa-solid fa-check" style="${isCompleted ? 'display: block;' : 'display: none;'}"></i>
                </div>
                <div class="task-text-wrap">
                    <span class="task-title">${task.title}</span>
                    <span class="task-extra">${task.duration || task.count || 'Exercise'}</span>
                </div>
                <span class="task-id-badge">${task.id}</span>
            `;

            // Toggle on click
            card.addEventListener("click", async () => {
                await handleTaskToggle(skill, task.id);
            });

            // Toggle on Enter/Space
            card.addEventListener("keydown", async (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    await handleTaskToggle(skill, task.id);
                }
            });

            tasksChecklistGrid.appendChild(card);
        });
    }

    async function handleTaskToggle(skill, taskId) {
        if (!currentUser) return;

        updateSyncStatus("syncing", "Saving to Supabase...");
        try {
            const updated = await window.studentProgressService.toggleTask(currentUser, skill, taskId);
            currentProgress = updated;
            renderDashboard(currentProgress);

            if (currentProgress.is_local_fallback) {
                updateSyncStatus("offline", "Cached Locally (Run SQL)");
                showToast("Task updated! (Saved in local cache)");
            } else {
                updateSyncStatus("synced", "Synced with Supabase");
                showToast("Task updated and synced to Supabase!");
            }
        } catch (err) {
            console.error("Error toggling task:", err);
            updateSyncStatus("offline", "Save Failed");
        }
    }

    // Switch Checklist Tab
    checkTabBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            checkTabBtns.forEach((b) => {
                b.classList.remove("active");
                b.setAttribute("aria-selected", "false");
            });
            btn.classList.add("active");
            btn.setAttribute("aria-selected", "true");

            activeChecklistTab = btn.dataset.tab;
            renderTaskChecklist(activeChecklistTab, currentProgress);
        });
    });

    // ==========================================================================
    // 5. GOAL & TARGET BAND MODAL
    // ==========================================================================
    if (editGoalBtn) {
        editGoalBtn.addEventListener("click", () => {
            if (!currentProgress) return;
            if (goalFullNameInput) goalFullNameInput.value = currentProgress.full_name || "";
            if (goalTargetBandSelect) goalTargetBandSelect.value = String(currentProgress.target_band || "7.5");
            if (goalTargetDateInput) goalTargetDateInput.value = currentProgress.target_date || "";
            if (goalNotesInput) goalNotesInput.value = currentProgress.notes || "";

            goalModal.style.display = "flex";
            if (goalFullNameInput) goalFullNameInput.focus();
        });
    }

    function closeGoalModal() {
        if (goalModal) goalModal.style.display = "none";
    }

    if (closeGoalModalBtn) closeGoalModalBtn.addEventListener("click", closeGoalModal);
    if (cancelGoalBtn) cancelGoalBtn.addEventListener("click", closeGoalModal);
    if (goalModal) {
        goalModal.addEventListener("click", (e) => {
            if (e.target === goalModal) closeGoalModal();
        });
    }

    if (goalForm) {
        goalForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (!currentUser || !currentProgress) return;

            const saveBtn = document.getElementById("saveGoalBtn");
            const originalHTML = saveBtn.innerHTML;
            saveBtn.disabled = true;
            saveBtn.innerHTML = `<span>Saving...</span> <i class="fa-solid fa-spinner fa-spin"></i>`;

            currentProgress.full_name = goalFullNameInput.value.trim();
            currentProgress.target_band = parseFloat(goalTargetBandSelect.value);
            currentProgress.target_date = goalTargetDateInput.value;
            currentProgress.notes = goalNotesInput.value.trim();

            updateSyncStatus("syncing", "Saving to Supabase...");
            const res = await window.studentProgressService.saveProgress(currentUser, currentProgress);

            saveBtn.disabled = false;
            saveBtn.innerHTML = originalHTML;
            closeGoalModal();

            if (res.success) {
                currentProgress = res.data;
                renderUserIdentity(currentUser);
                renderDashboard(currentProgress);
                showToast("Target Band & Goals updated successfully!");
                updateSyncStatus(res.isFallback ? "offline" : "synced", res.isFallback ? "Cached Locally" : "Synced with Supabase");
            } else {
                showToast("Failed to save goals. Please try again.");
            }
        });
    }

    // ==========================================================================
    // 6. PERCENTAGE ADJUSTER MODAL
    // ==========================================================================
    if (openAdjustModalBtn) {
        openAdjustModalBtn.addEventListener("click", () => {
            if (!currentProgress) return;
            adjustListeningInput.value = currentProgress.listening_progress || 0;
            adjustReadingInput.value = currentProgress.reading_progress || 0;
            adjustWritingInput.value = currentProgress.writing_progress || 0;
            adjustSpeakingInput.value = currentProgress.speaking_progress || 0;

            adjustListeningVal.textContent = `${adjustListeningInput.value}%`;
            adjustReadingVal.textContent = `${adjustReadingInput.value}%`;
            adjustWritingVal.textContent = `${adjustWritingInput.value}%`;
            adjustSpeakingVal.textContent = `${adjustSpeakingInput.value}%`;

            adjustModal.style.display = "flex";
        });
    }

    function closeAdjustModal() {
        if (adjustModal) adjustModal.style.display = "none";
    }

    if (closeAdjustModalBtn) closeAdjustModalBtn.addEventListener("click", closeAdjustModal);
    if (cancelAdjustBtn) cancelAdjustBtn.addEventListener("click", closeAdjustModal);
    if (adjustModal) {
        adjustModal.addEventListener("click", (e) => {
            if (e.target === adjustModal) closeAdjustModal();
        });
    }

    // Connect slider inputs to dynamic values
    function wireSlider(slider, label) {
        if (!slider || !label) return;
        slider.addEventListener("input", () => {
            label.textContent = `${slider.value}%`;
        });
    }

    wireSlider(adjustListeningInput, adjustListeningVal);
    wireSlider(adjustReadingInput, adjustReadingVal);
    wireSlider(adjustWritingInput, adjustWritingVal);
    wireSlider(adjustSpeakingInput, adjustSpeakingVal);

    if (adjustForm) {
        adjustForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (!currentUser || !currentProgress) return;

            const saveBtn = document.getElementById("saveAdjustBtn");
            const originalHTML = saveBtn.innerHTML;
            saveBtn.disabled = true;
            saveBtn.innerHTML = `<span>Saving...</span> <i class="fa-solid fa-spinner fa-spin"></i>`;

            currentProgress.listening_progress = parseInt(adjustListeningInput.value, 10);
            currentProgress.reading_progress = parseInt(adjustReadingInput.value, 10);
            currentProgress.writing_progress = parseInt(adjustWritingInput.value, 10);
            currentProgress.speaking_progress = parseInt(adjustSpeakingInput.value, 10);

            updateSyncStatus("syncing", "Saving to Supabase...");
            const res = await window.studentProgressService.saveProgress(currentUser, currentProgress);

            saveBtn.disabled = false;
            saveBtn.innerHTML = originalHTML;
            closeAdjustModal();

            if (res.success) {
                currentProgress = res.data;
                renderDashboard(currentProgress);
                showToast("Skill percentages updated in Supabase!");
                updateSyncStatus(res.isFallback ? "offline" : "synced", res.isFallback ? "Cached Locally" : "Synced with Supabase");
            }
        });
    }

    // ==========================================================================
    // 7. SQL SCHEMA INSTRUCTIONS MODAL
    // ==========================================================================
    if (openSqlModalBtn) {
        openSqlModalBtn.addEventListener("click", () => {
            sqlModal.style.display = "flex";
        });
    }

    function closeSqlModal() {
        if (sqlModal) sqlModal.style.display = "none";
    }

    if (closeSqlModalBtn) closeSqlModalBtn.addEventListener("click", closeSqlModal);
    if (sqlModal) {
        sqlModal.addEventListener("click", (e) => {
            if (e.target === sqlModal) closeSqlModal();
        });
    }

    if (dismissSchemaAlert) {
        dismissSchemaAlert.addEventListener("click", () => {
            if (schemaSetupAlert) schemaSetupAlert.style.display = "none";
        });
    }

    if (copySqlBtn && sqlSnippetCode) {
        copySqlBtn.addEventListener("click", async () => {
            try {
                await navigator.clipboard.writeText(sqlSnippetCode.textContent);
                copySqlBtn.innerHTML = `<i class="fa-solid fa-check"></i> <span>Copied!</span>`;
                setTimeout(() => {
                    copySqlBtn.innerHTML = `<i class="fa-regular fa-copy"></i> <span>Copy SQL</span>`;
                }, 2000);
            } catch (err) {
                console.error("Clipboard copy failed:", err);
            }
        });
    }

    // Escape closes any open modal
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeGoalModal();
            closeAdjustModal();
            closeSqlModal();
        }
    });

    // ==========================================================================
    // 8. LOGOUT ACTION
    // ==========================================================================
    if (dashLogoutBtn) {
        dashLogoutBtn.addEventListener("click", async () => {
            dashLogoutBtn.disabled = true;
            dashLogoutBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i>`;
            if (window.supabaseAuth) {
                await window.supabaseAuth.signOut();
            }
            window.location.replace("login.html");
        });
    }

    // ==========================================================================
    // 9. TOAST NOTIFICATION HELPER
    // ==========================================================================
    function showToast(message) {
        if (!dashToast) return;
        const textSpan = dashToast.querySelector(".toast-text");
        if (textSpan) textSpan.textContent = message;

        dashToast.classList.add("show");
        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            dashToast.classList.remove("show");
        }, 3200);
    }

    // Start
    initDashboard();
});
