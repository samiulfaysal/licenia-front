# License Management SaaS - Frontend

## Overview
Modern Next.js frontend for License Management SaaS with Tailwind CSS and Glassmorphism UI.

## Features
- ✅ User authentication (Register/Login)
- ✅ Dashboard with statistics
- ✅ Product management
- ✅ License generation
- ✅ License management interface
- ✅ Modern glassmorphic UI
- ✅ Real-time notifications
- ✅ Responsive design

## Setup

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Configure environment**
```bash
cp .env.example .env.local
# Edit .env.local with API URL
```

3. **Start development server**
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## Pages

### Public
- `/` - Homepage
- `/login` - Login page
- `/register` - Registration page

### Protected (Authenticated)
- `/dashboard` - Main dashboard with overview
- `/products` - Products list
- `/products/[id]` - Product details & license management

## Components

- **Navbar** - Navigation with user info
- **ProtectedRoute** - Auth wrapper for protected pages

## Environment Variables

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Development

### Running in Development
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

## Tech Stack
- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **State**: Zustand
- **HTTP**: Axios
- **Notifications**: React Hot Toast
- **Icons**: Lucide React
- **Language**: TypeScript

## Key Features

### Authentication Flow
1. User registers or logs in
2. Backend returns JWT token
3. Token stored in localStorage
4. Axios interceptor adds token to all requests
5. Automatic redirect if token expires

### Dashboard
- Quick stats (products, licenses, active licenses)
- Create new products
- View recent licenses
- Product management

### Product Management
- Create/edit/delete products
- Generate licenses
- View license list with status
- Track activations
- Expiration dates

## Styling

### Utility Classes
- `.glass` - Full glassmorphic container
- `.glass-sm` - Small glassmorphics container
- `.btn-primary` - Primary button
- `.btn-secondary` - Secondary button

### Color Scheme
- Primary: Blue (#3b82f6)
- Secondary: Purple (#a855f7)
- Background: Dark slate gradient
- Text: Slate shades

## State Management

Using Zustand for auth state:
```typescript
const { user, token, login, logout, isAuthenticated } = useAuthStore()
```

## API Integration

Axios client with automatic auth:
```typescript
import apiClient from '@/lib/api'

const response = await apiClient.post('/products', data)
```

## License
MIT
