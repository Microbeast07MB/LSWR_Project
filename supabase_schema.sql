-- ==============================================================================
-- EngLish Platform - Supabase Student Progress Schema
-- ==============================================================================
-- Description:
-- Stores individual student progress for Listening, Speaking, Reading, and Writing (LSRW),
-- target IELTS band score, completed practice tasks, exam target date, and study notes.
--
-- HOW TO RUN THIS IN SUPABASE:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/yiwjiwesniwbddhvgmth
-- 2. In the left navigation, click on the "SQL Editor" icon (terminal icon).
-- 3. Click "New Query" (+ button).
-- 4. Paste the entire content of this file and click "Run" (or Ctrl + Enter).
-- ==============================================================================

-- 1. Create table for storing student progress
CREATE TABLE IF NOT EXISTS public.student_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT DEFAULT '',
    target_band NUMERIC(2, 1) DEFAULT 7.5 CHECK (target_band >= 1.0 AND target_band <= 9.0),
    target_date DATE,
    listening_progress INTEGER DEFAULT 0 CHECK (listening_progress >= 0 AND listening_progress <= 100),
    reading_progress INTEGER DEFAULT 0 CHECK (reading_progress >= 0 AND reading_progress <= 100),
    writing_progress INTEGER DEFAULT 0 CHECK (writing_progress >= 0 AND writing_progress <= 100),
    speaking_progress INTEGER DEFAULT 0 CHECK (speaking_progress >= 0 AND speaking_progress <= 100),
    completed_tasks JSONB DEFAULT '{"listening": [], "reading": [], "writing": [], "speaking": []}'::jsonb,
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create index on user_id for high-speed queries
CREATE INDEX IF NOT EXISTS idx_student_progress_user_id 
    ON public.student_progress(user_id);

-- 3. Enable Row Level Security (RLS) so each student can only view/edit their own data
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Select own progress
DROP POLICY IF EXISTS "Students can view their own progress" ON public.student_progress;
CREATE POLICY "Students can view their own progress"
    ON public.student_progress
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Insert own progress
DROP POLICY IF EXISTS "Students can insert their own progress" ON public.student_progress;
CREATE POLICY "Students can insert their own progress"
    ON public.student_progress
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Update own progress
DROP POLICY IF EXISTS "Students can update their own progress" ON public.student_progress;
CREATE POLICY "Students can update their own progress"
    ON public.student_progress
    FOR UPDATE
    USING (auth.uid() = user_id);

-- 4. Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_student_progress_updated ON public.student_progress;
CREATE TRIGGER on_student_progress_updated
    BEFORE UPDATE ON public.student_progress
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 5. Trigger to automatically initialize a progress row when a new student signs up
CREATE OR REPLACE FUNCTION public.handle_new_student_signup()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.student_progress (user_id, full_name, target_band)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        7.5
    )
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_student_created ON auth.users;
CREATE TRIGGER on_auth_student_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_student_signup();

-- Grant access to authenticated users
GRANT ALL ON TABLE public.student_progress TO authenticated;
GRANT ALL ON TABLE public.student_progress TO service_role;
