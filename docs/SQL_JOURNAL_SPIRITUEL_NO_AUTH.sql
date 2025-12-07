-- ==========================================
-- JOURNAL SPIRITUEL - SUPABASE SQL
-- Architecture: PAS d'authentification (user_id = localStorage)
-- Date: 2025-12-07
-- ==========================================

-- IMPORTANT: RLS DÉSACTIVÉ (pas d'auth.uid())
-- Les données sont filtrées par user_id (string depuis localStorage)

-- 1. MÉDITATIONS
CREATE TABLE IF NOT EXISTS public.journal_spirituel_meditations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  jour_jeune INTEGER,
  type_meditation TEXT,
  duree INTEGER,
  ressenti TEXT,
  notes TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. VERSETS
CREATE TABLE IF NOT EXISTS public.journal_spirituel_versets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  reference TEXT NOT NULL,
  texte TEXT NOT NULL,
  note TEXT,
  favori BOOLEAN DEFAULT FALSE,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. QUESTIONS
CREATE TABLE IF NOT EXISTS public.journal_spirituel_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  jour_jeune INTEGER,
  question TEXT NOT NULL,
  reponse TEXT NOT NULL,
  type TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_modification TIMESTAMP WITH TIME ZONE
);

-- 4. INTENTIONS
CREATE TABLE IF NOT EXISTS public.journal_spirituel_intentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  texte TEXT NOT NULL,
  progression INTEGER DEFAULT 0 CHECK (progression >= 0 AND progression <= 100),
  accompli BOOLEAN DEFAULT FALSE,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_accomplissement TIMESTAMP WITH TIME ZONE
);

-- 5. AUDIOS
CREATE TABLE IF NOT EXISTS public.journal_spirituel_audios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  titre TEXT,
  note TEXT,
  tags TEXT[],
  jour_jeune INTEGER,
  duree INTEGER,
  taille BIGINT,
  storage_path TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. ÉCRITS
CREATE TABLE IF NOT EXISTS public.journal_spirituel_ecrits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  titre TEXT,
  texte TEXT NOT NULL,
  jour_jeune INTEGER,
  nb_caracteres INTEGER,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_modification TIMESTAMP WITH TIME ZONE
);

-- ==========================================
-- INDEX POUR PERFORMANCES
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_meditations_user_date ON public.journal_spirituel_meditations(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_versets_user_date ON public.journal_spirituel_versets(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_versets_favori ON public.journal_spirituel_versets(user_id, favori) WHERE favori = TRUE;
CREATE INDEX IF NOT EXISTS idx_questions_user_date ON public.journal_spirituel_questions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_intentions_user_accompli ON public.journal_spirituel_intentions(user_id, accompli);
CREATE INDEX IF NOT EXISTS idx_audios_user_date ON public.journal_spirituel_audios(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_audios_type ON public.journal_spirituel_audios(user_id, type);
CREATE INDEX IF NOT EXISTS idx_ecrits_user_date ON public.journal_spirituel_ecrits(user_id, date DESC);

-- ==========================================
-- RLS: DÉSACTIVÉ (accès public)
-- ==========================================
ALTER TABLE public.journal_spirituel_meditations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_spirituel_versets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_spirituel_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_spirituel_intentions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_spirituel_audios DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_spirituel_ecrits DISABLE ROW LEVEL SECURITY;

-- ==========================================
-- STORAGE BUCKET POUR AUDIOS
-- ==========================================
-- Créer bucket si n'existe pas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'journal-spirituel-audios', 
  'journal-spirituel-audios', 
  false,
  524288000, -- 500 MB max par fichier
  ARRAY['audio/webm', 'audio/wav', 'audio/mp3', 'audio/mpeg']
)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies (accès public pour upload/download)
CREATE POLICY IF NOT EXISTS "Public upload" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'journal-spirituel-audios');

CREATE POLICY IF NOT EXISTS "Public download" ON storage.objects FOR SELECT 
USING (bucket_id = 'journal-spirituel-audios');

CREATE POLICY IF NOT EXISTS "Public delete" ON storage.objects FOR DELETE 
USING (bucket_id = 'journal-spirituel-audios');

-- ==========================================
-- FIN DU SCRIPT
-- ==========================================
