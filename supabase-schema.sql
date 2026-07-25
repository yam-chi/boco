-- Supabase SQL Editor에 붙여넣기해서 실행하세요

-- ─── Profiles ─────────────────────────────────────────────
CREATE TABLE profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  height_cm integer,
  weight_kg numeric(5,1),
  target_kcal integer DEFAULT 2000,
  goal text DEFAULT 'maintain',
  activity_level numeric DEFAULT 1.375,
  preferred_exercises text[] DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "본인 프로필만 접근" ON profiles
  FOR ALL USING (auth.uid() = id);

-- 새 유저 가입 시 자동으로 프로필 row 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ─── Meals ────────────────────────────────────────────────
CREATE TABLE meals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  meal_type text NOT NULL CHECK (meal_type IN ('breakfast','lunch','dinner','snack')),
  items jsonb NOT NULL DEFAULT '[]',
  total_kcal integer NOT NULL DEFAULT 0,
  photo_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "본인 식사만 접근" ON meals
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX meals_user_date ON meals(user_id, date);

-- ─── Exercise Sessions ─────────────────────────────────────
CREATE TABLE exercise_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  type text NOT NULL,
  duration_min integer,
  steps integer,
  burned_kcal integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE exercise_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "본인 운동만 접근" ON exercise_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX exercise_user_date ON exercise_sessions(user_id, date);
