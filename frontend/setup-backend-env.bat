@echo off
echo Creating backend .env file...
echo.

echo # Supabase Configuration > backend\.env
echo SUPABASE_URL=https://nhbsuleeotnkkwmwtjxu.supabase.co >> backend\.env
echo SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6In >> backend\.env
echo SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here >> backend\.env
echo. >> backend\.env
echo # Server Configuration >> backend\.env
echo PORT=5000 >> backend\.env
echo NODE_ENV=development >> backend\.env
echo CORS_ORIGIN=http://localhost:3000 >> backend\.env

echo Backend .env file created!
echo.
echo IMPORTANT: You need to replace 'your_service_role_key_here' with your actual service role key from Supabase.
echo To get your service role key:
echo 1. Go to your Supabase project dashboard
echo 2. Navigate to Settings ^> API
echo 3. Copy the 'service_role' key (not the anon key)
echo 4. Replace 'your_service_role_key_here' in backend\.env
echo.
echo After updating the service role key, restart your backend server.
pause

