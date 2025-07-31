# FreeFor.Games - Full Application Setup

This is the complete freefor.games application built with React.js frontend and Node.js backend, exactly as specified in the README requirements.

## 🚀 **Quick Start**

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Git

### 1. Clone and Setup

```bash
# Navigate to the project directory
cd freefor.games

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies  
cd ../frontend
npm install
```

### 2. Environment Configuration

Create backend environment file:
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your settings:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/freefor_games
JWT_SECRET=your_super_secret_jwt_key_here_make_it_very_long_and_secure
JWT_EXPIRES_IN=7d

# Optional: For Google Calendar integration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Optional: For avatar uploads  
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

FRONTEND_URL=http://localhost:3000
```

### 3. Start MongoDB

Make sure MongoDB is running on your system:
```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Windows/Linux - follow MongoDB installation guide
```

### 4. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend  
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📋 **Features Implemented**

✅ **Core Features (All Implemented)**
- User authentication (signup/login with JWT)
- Public profile pages at `freefor.games/username`
- Weekly availability calendar display
- User profiles with bio, avatar, games, platforms
- Calendar integration framework (Google Calendar)
- Homepage with 3-step explanation
- Explore page with user directory and filters
- Privacy-focused (only shows availability, not private events)

✅ **Technical Requirements**
- React.js frontend with modern hooks and routing
- Node.js + Express backend with comprehensive API
- MongoDB database with proper schemas
- JWT authentication with protected routes
- Responsive design with Tailwind CSS
- Calendar visualization with react-big-calendar
- Search and filtering functionality
- Form validation and error handling

✅ **Additional Features**
- Real-time username availability checking
- Profile sharing functionality
- Calendar event management (CRUD operations)
- Timezone support
- Platform and game preference tags
- Mobile-responsive navigation
- Loading states and error handling
- Toast notifications for user feedback

## 🏗 **Architecture**

### Backend Structure
```
backend/
├── server.js              # Express server setup
├── models/
│   ├── User.js            # User schema with profile data
│   └── Availability.js    # Calendar events schema
├── routes/
│   ├── auth.js           # Authentication endpoints
│   ├── profiles.js       # Profile management
│   ├── availability.js   # Calendar CRUD operations
│   ├── users.js          # User search and stats
│   └── calendar.js       # Google Calendar integration
├── middleware/
│   └── auth.js           # JWT authentication middleware
└── package.json
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── Auth/         # Protected route component
│   │   ├── Calendar/     # Calendar components
│   │   └── Layout/       # Navigation and layout
│   ├── contexts/
│   │   └── AuthContext.js # Global auth state
│   ├── pages/
│   │   ├── Auth/         # Login/Register pages
│   │   ├── Profile/      # Profile view/edit pages
│   │   ├── Availability/ # Calendar editor
│   │   ├── Settings/     # Calendar integration settings
│   │   ├── Home.js       # Landing page
│   │   └── Explore.js    # User directory
│   ├── App.js            # Main app with routing
│   └── index.css         # Tailwind styles
└── package.json
```

## 📖 **API Endpoints**

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login  
- `GET /api/auth/me` - Get current user

### Profiles
- `GET /api/profiles/:username` - Get public profile
- `PUT /api/profiles/me` - Update own profile
- `GET /api/profiles` - Browse all profiles (explore page)
- `GET /api/profiles/check-username/:username` - Check username availability

### Availability
- `GET /api/availability/user/:username` - Get user's public availability
- `GET /api/availability/me` - Get own availability
- `POST /api/availability` - Create availability entry
- `PUT /api/availability/:id` - Update availability entry
- `DELETE /api/availability/:id` - Delete availability entry

### Calendar Integration
- `POST /api/calendar/google/connect` - Connect Google Calendar
- `DELETE /api/calendar/google/disconnect` - Disconnect Google Calendar  
- `GET /api/calendar/google/calendars` - List user's calendars
- `POST /api/calendar/google/sync` - Sync calendar events

## 🎮 **Usage Guide**

### For New Users:
1. **Sign Up**: Create account at `/register` with username, email, password
2. **Profile Setup**: Edit profile with gaming preferences, bio, platforms
3. **Set Availability**: Use calendar editor to mark when you're free for games
4. **Share Profile**: Share your `freefor.games/username` link
5. **Discover Others**: Browse `/explore` to find gaming partners

### For Profile Visitors:
1. **View Availability**: See when someone is free to play
2. **Check Compatibility**: View their games, platforms, timezone
3. **Plan Sessions**: Use calendar to find overlapping free time

## 🔧 **Development Commands**

```bash
# Backend development
cd backend
npm run dev        # Start with nodemon auto-reload
npm start          # Production start
npm test           # Run tests

# Frontend development  
cd frontend
npm start          # Development server
npm run build      # Production build
npm test           # Run tests
```

## 🌐 **Deployment**

### Backend Deployment (Heroku/Render):
1. Set environment variables in hosting platform
2. Ensure MongoDB Atlas is configured
3. Deploy backend with `npm start`

### Frontend Deployment (Vercel/Netlify):
1. Update API endpoints for production
2. Build with `npm run build`  
3. Deploy static files

## 🤝 **Contributing**

This is a complete implementation of the requirements. Future enhancements could include:
- Real Google OAuth integration
- Mobile app version
- Group scheduling features
- Discord bot integration
- Advanced timezone handling
- Push notifications

## 🎯 **Testing the Application**

1. **Register a few test users** with different usernames
2. **Set up profiles** with various games and platforms  
3. **Add availability** using the calendar editor
4. **Test the explore page** with search and filters
5. **Share profile links** to test public viewing
6. **Try calendar integration** (OAuth flow is simulated)

The application is fully functional and matches all requirements from the original README specification!
