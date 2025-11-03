# DreamTracker Setup Instructions

## Step 1: Create Database Tables

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `bucjanejcadoopxnkmzm`
3. Navigate to the **SQL Editor** (in the left sidebar)
4. Click **New Query**
5. Copy and paste the SQL from `/lib/supabase-queries.sql` into the editor
6. Click **Run** to execute the queries

This will create:
- `profiles` table for user information
- `dream_entries` table for journal entries
- Row Level Security (RLS) policies
- Indexes for performance
- Automatic triggers for profile creation

## Step 2: Create Test Account

### Option A: Via Supabase Dashboard (Recommended)
1. Go to **Authentication** → **Users** in your Supabase Dashboard
2. Click **Add user** → **Create new user**
3. Enter:
   - Email: `test@dreamtracker.com`
   - Password: `testpass123`
   - Click **Create user**

### Option B: Via the App
1. Open the DreamTracker app
2. Click **Sign Up**
3. Fill in:
   - Name: Test User
   - Email: test@dreamtracker.com
   - Password: testpass123
4. Click **Create Account**

## Step 3: (Optional) Add Sample Data

If you want to test with some sample dream entries:

1. Go to SQL Editor in Supabase
2. Get your test user ID:
   ```sql
   SELECT id FROM auth.users WHERE email = 'test@dreamtracker.com';
   ```
3. Copy the user ID
4. Insert sample entries (replace `YOUR_USER_ID` with the actual ID):
   ```sql
   INSERT INTO public.dream_entries (user_id, title, content, sleep_hours, caffeine_intake, sleep_quality, mood, stress_level)
   VALUES 
     ('YOUR_USER_ID', 'Flying Through Mountains', 'I was soaring through beautiful mountain ranges with golden eagles...', 8.0, 1, 9, 'great', 3),
     ('YOUR_USER_ID', 'Lost in a Forest', 'Walking through a mysterious dark forest with glowing mushrooms...', 6.5, 3, 5, 'neutral', 7),
     ('YOUR_USER_ID', 'Meeting Old Friends', 'Reunited with childhood friends at our old school playground...', 7.5, 2, 8, 'good', 4),
     ('YOUR_USER_ID', 'Underwater Adventure', 'Swimming with colorful fish in crystal clear tropical water...', 9.0, 0, 10, 'great', 2),
     ('YOUR_USER_ID', 'City Chase', 'Running through busy city streets trying to catch a train...', 5.0, 4, 4, 'bad', 8);
   ```

## Step 4: Test the App

1. Open DreamTracker
2. Click **Try Test Account** or manually login with:
   - Email: `test@dreamtracker.com`
   - Password: `testpass123`
3. Explore all features:
   - Create new dream entries in the Journal page
   - View analytics and charts in the Analytics page
   - Export your data in the Profile page

## Troubleshooting

### "Test account not set up yet" error
- Make sure you created the test user in Step 2
- Verify the email and password are correct
- Check that the SQL queries ran successfully

### Can't save entries
- Verify the tables were created successfully
- Check RLS policies are enabled
- Make sure you're logged in

### Data not showing in Analytics
- Ensure you've created at least one journal entry
- Try refreshing the page
- Check browser console for errors

## Security Notes

⚠️ **Important**: This app is for prototyping and learning purposes. For production use:
- Never commit API keys to version control
- Use environment variables for sensitive data
- Implement proper input validation
- Add rate limiting
- Follow healthcare data regulations if storing sensitive health information

## Database Schema

### profiles
- `id` (UUID, Primary Key) - References auth.users
- `email` (TEXT)
- `name` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### dream_entries
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key) - References auth.users
- `title` (TEXT)
- `content` (TEXT)
- `sleep_hours` (DECIMAL)
- `caffeine_intake` (INTEGER)
- `sleep_quality` (INTEGER, 1-10)
- `mood` (TEXT: 'great', 'good', 'neutral', 'bad')
- `stress_level` (INTEGER, 0-10)
- `created_at` (TIMESTAMP)
