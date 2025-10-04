# ClipIt - Content Creator Platform

A modern platform connecting content creators with brands, enabling creators to earn money from their content through campaigns and submissions.

# Supabase Configuration
SUPABASE_URL=https://nhbsuleeotnkkwmwtjxu.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oYnN1bGVlb3Rua2t3bXd0anh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NDAyMjUsImV4cCI6MjA3MDQxNjIyNX0.MNcC5NkRfxydPwia9NnwKbkU75SIInq_WDNbVizowho
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oYnN1bGVlb3Rua2t3bXd0anh1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg0MDIyNSwiZXhwIjoyMDcwNDE2MjI1fQ.3PBQxde0Q-64zHqghZ5BlOGu0JAJZEZU7_fU6dB0kVw

# Server Configuration
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

## 🚀 Features

- **User Authentication**: Secure sign-up/sign-in with Supabase Auth
- **Role-Based Access Control**: Three user roles (Clipper, Creator, Admin) with different permissions
- **Campaign Management**: Browse and join content creation campaigns
- **Content Submissions**: Submit and track your content submissions
- **Earnings Tracking**: Monitor your earnings and view analytics
- **Admin Dashboard**: Manage campaigns, submissions, and payouts
- **Real-time Updates**: Live notifications and updates
- **Responsive Design**: Works seamlessly on desktop and mobile

## 🛠 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Supabase Auth** - Authentication and user management

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Supabase** - PostgreSQL database with real-time features
- **Row Level Security (RLS)** - Database-level security
- **JWT Authentication** - Secure token-based auth

### Database
- **PostgreSQL** - Relational database
- **Supabase** - Hosted PostgreSQL with additional features
- **Real-time Subscriptions** - Live data updates
- **File Storage** - Media file management

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm or yarn
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd clipit
```

### 2. Set Up Supabase

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Get your project credentials from Settings → API
4. Run the database schema from `backend/supabase-schema.sql`

### 3. Environment Variables

#### Frontend (.env.local)
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Backend (.env)
```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Server Configuration
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### 4. Install Dependencies

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 5. Start Development Servers

```bash
# Frontend (Terminal 1)
cd frontend
npm run dev

# Backend (Terminal 2)
cd backend
npm start
```

## 👥 User Roles & Permissions

The platform supports three user roles with different levels of access:

### 🎬 **Clipper** (Default Role)
- **Permissions**: 
  - Browse and join campaigns
  - Submit content for campaigns
  - View own earnings and analytics
  - Update profile information
- **Access**: Basic content creation features

### 🎨 **Creator**
- **Permissions**: 
  - All Clipper permissions
  - Create new campaigns
  - Manage own campaigns
  - View campaign analytics
- **Access**: Campaign creation and management

### 👑 **Admin**
- **Permissions**: 
  - All Creator permissions
  - Manage all users and roles
  - Approve/reject submissions
  - Process payouts
  - View system-wide analytics
  - Manage platform settings
- **Access**: Full system administration

### Role Hierarchy
```
Admin > Creator > Clipper
```

### API Endpoints by Role

#### Public Endpoints
- `GET /api/health` - Health check
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `GET /api/auth/me` - Get current user (authenticated)

#### Clipper Endpoints
- `GET /api/campaigns` - Browse campaigns
- `GET /api/campaigns/:id` - View campaign details
- `POST /api/campaigns/:id/join` - Join campaign
- `GET /api/submissions` - View own submissions
- `POST /api/submissions` - Submit content
- `GET /api/users/profile` - View own profile
- `PUT /api/users/profile` - Update own profile

#### Creator Endpoints
- `POST /api/campaigns` - Create new campaigns
- `PUT /api/campaigns/:id` - Update own campaigns
- `DELETE /api/campaigns/:id` - Delete own campaigns

#### Admin Endpoints
- `GET /api/admin/users` - View all users
- `PUT /api/admin/users/:id` - Update user roles
- `GET /api/admin/submissions` - View all submissions
- `PUT /api/admin/submissions/:id` - Approve/reject submissions
- `GET /api/admin/payouts` - View all payouts
- `PUT /api/admin/payouts/:id` - Process payouts
- `GET /api/roles/users` - Get all users with roles
- `PUT /api/roles/:userId` - Update user role

# Backend (Terminal 2)
cd backend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📁 Project Structure

```
clipit/
├── frontend/                 # Next.js frontend application
│   ├── app/                 # App Router pages
│   │   ├── dashboard/       # Protected dashboard routes
│   │   ├── sign-in/         # Authentication pages
│   │   └── sign-up/
│   ├── components/          # Reusable UI components
│   │   ├── dashboard/       # Dashboard-specific components
│   │   ├── admin/          # Admin panel components
│   │   └── ui/             # Base UI components
│   ├── lib/                # Utility functions
│   └── styles/             # Global styles
├── backend/                 # Express.js backend API
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── middleware/     # Express middleware
│   │   └── config/         # Configuration files
│   └── supabase-schema.sql # Database schema
└── README.md
```

## 🔐 Authentication Flow

1. **Sign Up**: Users create accounts with email/password or Google OAuth
2. **Sign In**: Secure authentication with Supabase Auth
3. **Session Management**: Automatic token refresh and session persistence
4. **Protected Routes**: Dashboard access requires authentication
5. **User Profiles**: Automatic profile creation on signup

## 🗄 Database Schema

### Core Tables
- **users**: User profiles and authentication data
- **campaigns**: Available content creation campaigns
- **submissions**: User content submissions
- **user_campaigns**: Many-to-many relationship for campaign joins
- **payouts**: Payment requests and processing
- **earnings_history**: Historical earnings data
- **notifications**: User notifications

### Security Features
- **Row Level Security (RLS)**: Database-level access control
- **JWT Tokens**: Secure authentication tokens
- **Policy-based Access**: Granular permissions per table

## 🔌 API Endpoints

### Authentication
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/verify` - Verify authentication token

### Campaigns
- `GET /api/campaigns` - List all campaigns
- `GET /api/campaigns/:id` - Get campaign details
- `POST /api/campaigns/:id/join` - Join a campaign

### Submissions
- `GET /api/submissions` - Get user submissions
- `POST /api/submissions` - Create new submission
- `PUT /api/submissions/:id` - Update submission

### Users
- `GET /api/users/profile` - Get user profile
- `GET /api/users/earnings` - Get earnings data
- `GET /api/users/analytics` - Get analytics data

### Admin (Protected)
- `GET /api/admin/metrics` - Platform metrics
- `GET /api/admin/users` - User management
- `GET /api/admin/submissions` - Submission management
- `POST /api/admin/payouts/:id/process` - Process payouts

## 🎨 UI Components

### Design System
- **Color Palette**: Vibrant red-orange, turquoise accents
- **Typography**: Clean, readable fonts
- **Spacing**: Consistent spacing system
- **Components**: Reusable, accessible components

### Key Components
- **Dashboard Layout**: Responsive sidebar navigation
- **Campaign Cards**: Visual campaign display
- **Analytics Charts**: Data visualization
- **Form Components**: Consistent form styling
- **Modal Dialogs**: Interactive overlays

## 🔧 Development

### Code Style
- **TypeScript**: Strict type checking
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Component Structure**: Consistent component patterns

### Testing
```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test
```

### Building for Production
```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm run build
```

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Connect your repository
2. Set environment variables
3. Deploy automatically on push

### Backend (Railway/Render)
1. Connect your repository
2. Set environment variables
3. Configure build commands

### Database (Supabase)
1. Use Supabase's hosted PostgreSQL
2. Configure RLS policies
3. Set up backups and monitoring

## 🔒 Security

- **Authentication**: Supabase Auth with JWT tokens
- **Authorization**: Row Level Security policies
- **Data Validation**: Input validation and sanitization
- **CORS**: Configured for production domains
- **Environment Variables**: Secure credential management

## 📈 Performance

- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js image optimization
- **Caching**: Strategic caching strategies
- **Database Indexing**: Optimized query performance
- **CDN**: Global content delivery

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review existing issues
- Create a new issue with details

## 🎯 Roadmap

- [ ] Real-time notifications
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] Payment integration
- [ ] Social features
- [ ] Content moderation
- [ ] API rate limiting
- [ ] Performance monitoring

---

**Built with ❤️ using Next.js, Supabase, and modern web technologies**
