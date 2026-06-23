-- Supabase Schema for CleanCity Fleet Tracker
-- Table: fleet

CREATE TABLE public.fleet (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    truck_id TEXT NOT NULL UNIQUE,
    ward_name TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    status_message TEXT NOT NULL,
    completion_percentage INTEGER NOT NULL DEFAULT 0,
    service_interrupted BOOLEAN NOT NULL DEFAULT false,
    interruption_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.fleet ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for MVP demo)
CREATE POLICY "Allow public read access" 
ON public.fleet
FOR SELECT
USING (true);

-- Allow service role / authenticated write access (you can lock this down further as needed)
CREATE POLICY "Allow authenticated update access" 
ON public.fleet
FOR ALL
USING (true)
WITH CHECK (true);

-- Insert the Ghost Truck starting point for the demo
INSERT INTO public.fleet (truck_id, ward_name, latitude, longitude, status_message, completion_percentage)
VALUES ('SP-TRUCK-05', 'Ward 12 - Galeshewe', -28.7282, 24.7358, 'Starting Route', 0)
ON CONFLICT (truck_id) DO NOTHING;
