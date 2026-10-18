/* ==============================================================================
   EngLish Platform - Student Progress Service
   Handles syncing student skill percentages, target band, and completed tasks
   with Supabase Database (Table: student_progress).
   ============================================================================== */

const TASK_DEFINITIONS = {
    listening: [
        { id: "L1", title: "Task 1: Campus Directions & Tour", duration: "10 mins" },
        { id: "L2", title: "Task 2: Academic Seminar Discussion", duration: "12 mins" },
        { id: "L3", title: "Task 3: Laboratory Safety Protocol", duration: "15 mins" },
        { id: "L4", title: "Task 4: Environmental Engineering Lecture", duration: "15 mins" },
        { id: "L5", title: "Task 5: Project Management Meeting", duration: "12 mins" },
        { id: "L6", title: "Task 6: Technical Interview Simulation", duration: "14 mins" },
        { id: "L7", title: "Task 7: Research Paper Presentation", duration: "18 mins" },
        { id: "L8", title: "Task 8: Global Engineering Summit", duration: "20 mins" }
    ],
    reading: [
        { id: "R1", title: "Matching Headings (Paragraph Analysis)", count: "6 Questions" },
        { id: "R2", title: "True / False / Not Given (Fact Checking)", count: "7 Questions" },
        { id: "R3", title: "Multiple Choice Questions (Engineering)", count: "5 Questions" },
        { id: "R4", title: "Summary Completion (Technical Passage)", count: "6 Questions" },
        { id: "R5", title: "Sentence Completion (Vocabulary Focus)", count: "5 Questions" },
        { id: "R6", title: "Matching Features & Scientists", count: "6 Questions" },
        { id: "R7", title: "Diagram Label Completion", count: "4 Questions" },
        { id: "R8", title: "Short Answer Questions", count: "5 Questions" }
    ],
    writing: [
        { id: "W1", title: "Task 1: Academic Process & Flowchart", count: "150 words" },
        { id: "W2", title: "Task 1: Line Graphs & Data Trends", count: "150 words" },
        { id: "W3", title: "Task 2: Technology & Society Essay", count: "250 words" },
        { id: "W4", title: "Task 2: Automation & Future of Work Essay", count: "250 words" }
    ],
    speaking: [
        { id: "S1", title: "Part 1: Introduction & Engineering Background", duration: "4-5 mins" },
        { id: "S2", title: "Part 2: Cue Card Presentation (Technical Project)", duration: "3-4 mins" },
        { id: "S3", title: "Part 3: In-Depth Discussion & Technology Ethics", duration: "4-5 mins" }
    ]
};

class StudentProgressService {
    constructor() {
        this.cacheKeyPrefix = "english_student_progress_";
        this.isTableAvailable = true;
    }

    /**
     * Get local storage fallback key for a user
     */
    getLocalKey(userId) {
        return `${this.cacheKeyPrefix}${userId}`;
    }

    /**
     * Get default initial progress object
     */
    getDefaultProgress(user) {
        const rawName = (user?.user_metadata && user.user_metadata.full_name) ||
            (user?.email ? user.email.split("@")[0] : "Student");

        return {
            user_id: user?.id || "",
            full_name: rawName,
            target_band: 7.5,
            target_date: "",
            listening_progress: 0,
            reading_progress: 0,
            writing_progress: 0,
            speaking_progress: 0,
            completed_tasks: {
                listening: [],
                reading: [],
                writing: [],
                speaking: []
            },
            notes: "",
            is_local_fallback: false,
            updated_at: new Date().toISOString()
        };
    }

    /**
     * Load student progress from Supabase (with localStorage fallback)
     * @param {object} user - Supabase user object
     * @returns {Promise<object>} student progress data
     */
    async loadProgress(user) {
        if (!user || !user.id) {
            return null;
        }

        const localKey = this.getLocalKey(user.id);
        const cachedStr = localStorage.getItem(localKey);
        let localData = cachedStr ? JSON.parse(cachedStr) : null;

        if (!window.supabaseClient || !window.isSupabaseConfigured?.()) {
            console.warn("[ProgressService] Supabase not configured. Using local progress cache.");
            return localData || this.getDefaultProgress(user);
        }

        try {
            const { data, error } = await window.supabaseClient
                .from("student_progress")
                .select("*")
                .eq("user_id", user.id)
                .maybeSingle();

            if (error) {
                // Table might not exist yet or connection error
                console.warn("[ProgressService] Could not query student_progress table:", error.message);
                this.isTableAvailable = false;
                const fallback = localData || this.getDefaultProgress(user);
                fallback.is_local_fallback = true;
                return fallback;
            }

            if (!data) {
                // Record does not exist yet -> initialize row
                console.log("[ProgressService] No progress record found. Initializing new progress row...");
                const newRecord = localData || this.getDefaultProgress(user);
                newRecord.user_id = user.id;

                const { data: inserted, error: insertError } = await window.supabaseClient
                    .from("student_progress")
                    .insert([{
                        user_id: user.id,
                        full_name: newRecord.full_name,
                        target_band: newRecord.target_band,
                        listening_progress: newRecord.listening_progress,
                        reading_progress: newRecord.reading_progress,
                        writing_progress: newRecord.writing_progress,
                        speaking_progress: newRecord.speaking_progress,
                        completed_tasks: newRecord.completed_tasks,
                        notes: newRecord.notes
                    }])
                    .select()
                    .single();

                if (insertError) {
                    console.error("[ProgressService] Failed to insert initial progress row:", insertError);
                    newRecord.is_local_fallback = true;
                    return newRecord;
                }

                localStorage.setItem(localKey, JSON.stringify(inserted));
                this.isTableAvailable = true;
                return inserted;
            }

            // Successfully loaded from Supabase
            this.isTableAvailable = true;
            localStorage.setItem(localKey, JSON.stringify(data));
            return data;
        } catch (err) {
            console.error("[ProgressService] Unexpected error loading progress:", err);
            const fallback = localData || this.getDefaultProgress(user);
            fallback.is_local_fallback = true;
            return fallback;
        }
    }

    /**
     * Save/upsert student progress to Supabase and cache locally
     * @param {object} user - Supabase user object
     * @param {object} progressData - Updated progress data
     * @returns {Promise<{success: boolean, data: object, error: any}>}
     */
    async saveProgress(user, progressData) {
        if (!user || !user.id) {
            return { success: false, error: new Error("User is not authenticated.") };
        }

        const localKey = this.getLocalKey(user.id);
        const payload = {
            user_id: user.id,
            full_name: progressData.full_name || "",
            target_band: Number(progressData.target_band) || 7.5,
            target_date: progressData.target_date || null,
            listening_progress: Math.min(100, Math.max(0, Math.round(progressData.listening_progress || 0))),
            reading_progress: Math.min(100, Math.max(0, Math.round(progressData.reading_progress || 0))),
            writing_progress: Math.min(100, Math.max(0, Math.round(progressData.writing_progress || 0))),
            speaking_progress: Math.min(100, Math.max(0, Math.round(progressData.speaking_progress || 0))),
            completed_tasks: progressData.completed_tasks || {
                listening: [],
                reading: [],
                writing: [],
                speaking: []
            },
            notes: progressData.notes || "",
            updated_at: new Date().toISOString()
        };

        // Cache locally first for instantaneous responsiveness
        localStorage.setItem(localKey, JSON.stringify(payload));

        if (!window.supabaseClient || !window.isSupabaseConfigured?.()) {
            return { success: true, data: payload, isFallback: true };
        }

        try {
            const { data, error } = await window.supabaseClient
                .from("student_progress")
                .upsert(payload, { onConflict: "user_id" })
                .select()
                .single();

            if (error) {
                console.warn("[ProgressService] Supabase upsert error (saved locally):", error);
                this.isTableAvailable = false;
                payload.is_local_fallback = true;
                return { success: true, data: payload, isFallback: true, error };
            }

            this.isTableAvailable = true;
            localStorage.setItem(localKey, JSON.stringify(data));
            return { success: true, data, isFallback: false };
        } catch (err) {
            console.error("[ProgressService] Save exception:", err);
            payload.is_local_fallback = true;
            return { success: true, data: payload, isFallback: true, error: err };
        }
    }

    /**
     * Toggle completion of a specific task and auto-recalculate percentage
     * @param {object} user - Supabase user
     * @param {string} skill - 'listening' | 'reading' | 'writing' | 'speaking'
     * @param {string} taskId - Task ID like 'L1', 'R2', etc.
     * @returns {Promise<object>} updated progress
     */
    async toggleTask(user, skill, taskId) {
        const current = await this.loadProgress(user);
        if (!current) return null;

        const tasksList = current.completed_tasks[skill] || [];
        const index = tasksList.indexOf(taskId);

        if (index > -1) {
            // Uncheck task
            tasksList.splice(index, 1);
        } else {
            // Check task
            tasksList.push(taskId);
        }

        current.completed_tasks[skill] = tasksList;

        // Auto-recalculate skill percentage based on defined task totals
        const totalPossible = (TASK_DEFINITIONS[skill] || []).length;
        if (totalPossible > 0) {
            const percentage = Math.round((tasksList.length / totalPossible) * 100);
            current[`${skill}_progress`] = Math.min(100, Math.max(0, percentage));
        }

        const res = await this.saveProgress(user, current);
        return res.data;
    }

    /**
     * Calculate overall average percentage across all 4 LSRW skills
     * @param {object} progress
     * @returns {number} percentage (0-100)
     */
    calculateOverall(progress) {
        if (!progress) return 0;
        const l = Number(progress.listening_progress) || 0;
        const r = Number(progress.reading_progress) || 0;
        const w = Number(progress.writing_progress) || 0;
        const s = Number(progress.speaking_progress) || 0;
        return Math.round((l + r + w + s) / 4);
    }
}

// Instantiate globally
window.TASK_DEFINITIONS = TASK_DEFINITIONS;
window.studentProgressService = new StudentProgressService();
