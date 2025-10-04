# Supabase Setup Guide for ClipIt

This guide will help you set up Supabase (PostgreSQL database) for your ClipIt platform.

## Step 1: Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub or email
4. Create a new organization (if needed)

## Step 2: Create New Project

1. Click "New Project"
2. Choose your organization
3. Enter project details:
   - **Name**: `clipit-platform`
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your users
4. Click "Create new project"
5. Wait for project to be ready (2-3 minutes)

## Step 3: Get Project Credentials

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **anon public** key
   - **service_role** key (keep this secret!)

## Step 4: Set Environment Variables

### Backend (.env file)
```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Other existing variables...
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.local file)
```env
# Supabase Configuration (for future use)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here


```

## Step 5: Set Up Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the entire content from `backend/supabase-schema.sql`
3. Paste it into the SQL editor
4. Click "Run" to execute the schema

## Step 6: Verify Setup

1. Go to **Table Editor** in Supabase dashboard
2. You should see these tables:
   - `users`
   - `campaigns`
   - `submissions`
   - `payouts`
   - `user_campaigns`
   - `earnings_history`
   - `notifications`

3. Check that sample data was inserted:
   - Go to `users` table - should have admin and creator users
   - Go to `campaigns` table - should have sample campaigns

## Step 7: Test Backend Connection

1. Start your backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Test the health endpoint:
   ```bash
   curl http://localhost:5000/api/health
   ```

3. Test campaigns endpoint (will return sample data):
   ```bash
   curl http://localhost:5000/api/campaigns
   ```

## Step 8: Configure Row Level Security (RLS)

The schema already includes RLS policies, but you may need to adjust them:

1. Go to **Authentication** → **Policies**
2. Verify policies are active for each table
3. Test with different user roles

## Step 9: Set Up Real-time Subscriptions (Optional)

For real-time features like live notifications:

```javascript
// In your frontend components
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Subscribe to notifications
supabase
  .channel('notifications')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'notifications' },
    (payload) => {
      console.log('New notification:', payload.new)
    }
  )
  .subscribe()
```

## Step 10: Database Management

### Viewing Data
- Use **Table Editor** for basic data viewing
- Use **SQL Editor** for complex queries

### Backup
- Go to **Settings** → **Database**
- Click "Create backup" for manual backups
- Enable point-in-time recovery for automatic backups

### Monitoring
- Go to **Dashboard** to see:
  - Database performance
  - API usage
  - Storage usage
  - Real-time connections

## Troubleshooting

### Common Issues

1. **Connection Error**
   - Check environment variables
   - Verify project URL and keys
   - Ensure project is not paused

2. **RLS Policy Issues**
   - Check if policies are enabled
   - Verify user authentication
   - Test with different user roles

3. **Schema Errors**
   - Check SQL syntax in schema file
   - Ensure all required extensions are enabled
   - Verify table relationships

### Getting Help

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

## Next Steps

1. **Connect Frontend**: Update frontend to use Supabase client
2. **Add Real-time Features**: Implement live updates
3. **File Storage**: Set up Supabase Storage for file uploads
4. **Edge Functions**: Create serverless functions for complex logic
5. **Analytics**: Set up database analytics and monitoring

## Security Best Practices

1. **Never expose service_role key** in frontend code
2. **Use RLS policies** to secure data access
3. **Validate all inputs** before database operations
4. **Use prepared statements** to prevent SQL injection
5. **Regular backups** of your database
6. **Monitor API usage** for unusual patterns
