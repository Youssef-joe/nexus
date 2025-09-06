# L&D Nexus - Learning & Development Marketplace

A bilingual (Arabic-English) digital marketplace connecting businesses with verified Learning & Development professionals. Built with AI-powered matching, automated workflows, and secure collaboration tools.

##  Features

### Core Platform Features
- **Bilingual Support**: Full Arabic and English language support
- **User Roles**: Organizations and L&D Professionals
- **Project Management**: Create, manage, and track L&D projects
- **Application System**: Apply to projects with AI-powered matching
- **Secure Authentication**: JWT-based auth with email verification
- **Real-time Communication**: Built-in messaging system

### AI-Powered Features
- **Smart Matching**: AI algorithms match professionals to projects based on skills, experience, and requirements
- **Project Insights**: AI-generated market analysis and recommendations
- **Application Analysis**: Automated evaluation of professional applications
- **Skills Assessment**: Gap analysis and learning path recommendations
- **Personalized Recommendations**: AI-curated project suggestions

### Technical Features
- **Modern Tech Stack**: NestJS backend, React frontend
- **Database**: MongoDB with Mongoose ODM
- **AI Integration**: Vercel AI SDK with OpenAI
- **Email System**: Automated notifications and verification
- **File Upload**: Secure document handling
- **Rate Limiting**: API protection and throttling
- **Validation**: Comprehensive input validation

## 🛠 Tech Stack

### Backend
- **Framework**: NestJS (Node.js)
- **Database**: MongoDB
- **Authentication**: JWT + Passport
- **AI**: Vercel AI SDK + Google Gemini
- **Email**: Nodemailer
- **Validation**: Class Validator
- **File Upload**: Multer

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**: Shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Fetch API
- **Internationalization**: React i18next
- **Routing**: React Router DOM

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB 5+
- Google Gemini API Key (for AI features)
- SMTP credentials (for emails)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nexus
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Configure environment variables**
   
   **Backend (.env in server/nexus/)**
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/nexus-ld
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRES_IN=7d
   
   # Email Configuration
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   FROM_EMAIL=noreply@ldnexus.com
   
   # Gemini AI Configuration
   GEMINI_API_KEY=your-gemini-api-key
   
   # App Configuration
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```
   
   **Frontend (.env in nexus-learning-path/)**
   ```env
   VITE_API_URL=http://localhost:3001/api
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend API on http://localhost:3001
   - Frontend on http://localhost:5173

## 🏗 Project Structure

```
nexus/
├── server/nexus/                 # NestJS Backend
│   ├── src/
│   │   ├── auth/                # Authentication module
│   │   ├── projects/            # Projects management
│   │   ├── applications/        # Application system
│   │   ├── ai/                  # AI services
│   │   ├── email/               # Email services
│   │   ├── schemas/             # MongoDB schemas
│   │   └── dto/                 # Data transfer objects
│   └── .env                     # Backend environment
├── nexus-learning-path/         # React Frontend
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   ├── pages/               # Page components
│   │   ├── store/               # State management
│   │   ├── lib/                 # Utilities & API client
│   │   └── i18n/                # Internationalization
│   └── .env                     # Frontend environment
└── package.json                 # Root package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify-email` - Email verification
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset
- `GET /api/auth/profile` - Get user profile

### Projects
- `GET /api/projects` - List projects (with filters)
- `POST /api/projects` - Create project (organizations only)
- `GET /api/projects/:id` - Get project details
- `PATCH /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/my-projects` - Get user's projects
- `GET /api/projects/recommended` - AI-recommended projects
- `GET /api/projects/search` - Search projects

### Applications
- `POST /api/applications` - Apply to project
- `GET /api/applications` - List applications
- `GET /api/applications/:id` - Get application details
- `PATCH /api/applications/:id/status` - Update application status
- `DELETE /api/applications/:id/withdraw` - Withdraw application
- `GET /api/applications/my-applications` - Get user's applications

##  AI Features

### Smart Matching Algorithm
The AI matching system evaluates:
- **Skill Alignment** (40%): Match between required and professional skills
- **Experience Relevance** (25%): Years of experience and project complexity
- **Budget Compatibility** (20%): Rate expectations vs project budget
- **Language Match** (10%): Required vs spoken languages
- **Professional Rating** (5%): Historical performance rating

### Project Insights
AI analyzes projects to provide:
- Market competitiveness assessment
- Skill demand analysis
- Budget evaluation
- Timeline feasibility
- Improvement recommendations
- Risk factor identification

### Application Analysis
Automated evaluation includes:
- Overall application score
- Skill match percentage
- Experience relevance
- Proposal quality assessment
- Rate competitiveness
- Recommendation level

##  Internationalization

The platform supports Arabic and English with:
- RTL (Right-to-Left) layout for Arabic
- Complete translation coverage
- Dynamic language switching
- Localized date/number formatting
- Cultural adaptations

##  Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Email verification required
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS protection
- Environment variable security

## Responsive Design

- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly interfaces
- Progressive Web App ready
- Cross-browser compatibility

## Deployment

### Backend Deployment
1. Build the application: `npm run build:server`
2. Set production environment variables
3. Deploy to your preferred platform (AWS, Heroku, etc.)

### Frontend Deployment
1. Build the application: `npm run build:client`
2. Deploy the `dist` folder to CDN/hosting service
3. Configure environment variables for production API

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

##  License

This project is licensed under the MIT License.

##  Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**L&D Nexus** - Empowering Learning & Development in the MENA region 🚀
