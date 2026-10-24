-- ============================================================================
-- LSRW IELTS Project (Grammarium) - Database Schema
-- Simplified for 2nd-Year Engineering DBMS Viva & Supabase Integration
-- ============================================================================
--
-- This schema manages two tables:
-- 1. practice_results    -> Stores test scores when a user completes a mock test
-- 2. learning_completions -> Tracks learning checklist items marked as completed
--
-- All tables are linked to Supabase Auth (auth.users) using a Foreign Key.
-- Row Level Security (RLS) ensures each student only accesses their own data.
-- ============================================================================


-- ============================================================================
-- TABLE 1: practice_results
-- Purpose: Records score each time a student finishes a test in any skill.
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.practice_results (
    id           SERIAL PRIMARY KEY,
    user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    skill        VARCHAR(20) NOT NULL,
    score        INT NOT NULL,
    max_score    INT NOT NULL,
    completed_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.practice_results ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view their own test scores
CREATE POLICY "Users can view own practice results"
    ON public.practice_results FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- RLS Policy: Users can only insert their own test scores
CREATE POLICY "Users can insert own practice results"
    ON public.practice_results FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);


-- ============================================================================
-- TABLE 2: learning_completions
-- Purpose: Tracks checkbox progress for individual tasks across LSRW skills.
-- Composite Primary Key (user_id, skill, item_key) ensures no duplicate entries.
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.learning_completions (
    user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    skill        VARCHAR(20) NOT NULL,
    item_key     VARCHAR(100) NOT NULL,
    completed    BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMP,
    PRIMARY KEY (user_id, skill, item_key)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.learning_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view their own checklist
CREATE POLICY "Users can view own checklist"
    ON public.learning_completions FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own checklist items
CREATE POLICY "Users can insert own checklist"
    ON public.learning_completions FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own checklist items (toggle checked/unchecked)
CREATE POLICY "Users can update own checklist"
    ON public.learning_completions FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);


-- ============================================================================
-- PERMISSIONS (GRANT)
-- Supabase PostgREST requires explicit table permissions for authenticated users
-- ============================================================================
GRANT SELECT, INSERT ON public.practice_results TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.learning_completions TO authenticated;


-- ============================================================================
-- OPTIONAL: MIGRATION SCRIPT FOR EXISTING SUPABASE DATABASES
-- If you already created tables earlier and want to clean up without dropping:
-- ============================================================================
-- ALTER TABLE public.practice_results ALTER COLUMN score TYPE INT;
-- ALTER TABLE public.practice_results ALTER COLUMN max_score TYPE INT;
-- ALTER TABLE public.practice_results DROP CONSTRAINT IF EXISTS practice_results_skill_check;
-- ALTER TABLE public.practice_results DROP CONSTRAINT IF EXISTS practice_results_score_check;
-- ALTER TABLE public.practice_results DROP CONSTRAINT IF EXISTS practice_results_max_score_check;
-- DROP INDEX IF EXISTS public.practice_results_user_completed_idx;
-- ALTER TABLE public.learning_completions DROP COLUMN IF EXISTS updated_at;
-- ALTER TABLE public.learning_completions DROP CONSTRAINT IF EXISTS learning_completions_skill_check;
-- ALTER TABLE public.learning_completions DROP CONSTRAINT IF EXISTS learning_completions_check;
