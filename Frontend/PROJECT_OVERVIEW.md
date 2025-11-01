# Tutore App - Project Overview

A cross-platform mobile and web application built with Expo, React Native, and NativeWind (TailwindCSS).

## 🎯 Features

### Authentication
- **Login Page** (`app/(auth)/login.tsx`)
  - Email/password authentication
  - Form validation
  - Navigation to signup
  
- **Signup Page** (`app/(auth)/signup.tsx`)
  - User registration with email, password, name, school, and dream job
  - Password confirmation
  - Form validation

### Main Application Pages

#### 1. Home (`app/(tabs)/index.tsx`)
- Welcome screen with quick action cards
- Navigation to all main features
- Recent activity display
- Daily tips section

#### 2. Chat (`app/(tabs)/chat.tsx`)
- AI chatbot interface
- Real-time message display
- Message input with send button
- Typing indicator
- Ready for RAG backend integration

#### 3. Upload (`app/(tabs)/upload.tsx`)
- Photo upload functionality (camera/gallery)
- User information form (name, school, dream job)
- Additional info text area
- Form validation

#### 4. Psychologists (`app/(tabs)/psychologists.tsx`)
- List of available psychologists
- Psychologist profiles with specialty, experience, and ratings
- Message and consultation request buttons
- Availability status indicators

#### 5. Profile (`app/(tabs)/profile.tsx`)
- User profile display
- Edit mode for updating information
- Profile photo upload
- Settings and logout options

## 📁 Project Structure

```
Frontend/
├── app/
│   ├── (auth)/
│   │   ├── _layout.tsx          # Auth stack layout
│   │   ├── login.tsx             # Login screen
│   │   └── signup.tsx            # Signup screen
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Tab navigation layout
│   │   ├── index.tsx            # Home screen
│   │   ├── chat.tsx             # Chat screen
│   │   ├── upload.tsx           # Upload screen
│   │   ├── psychologists.tsx   # Psychologists list
│   │   ├── profile.tsx          # User profile
│   │   └── global.css           # Global styles
│   ├── _layout.tsx              # Root layout
│   └── index.tsx                # Entry point with redirect
├── components/
│   └── ui/
│       ├── Button.tsx           # Reusable button component
│       ├── Input.tsx            # Reusable input component
│       └── Card.tsx             # Reusable card component
├── package.json
├── tailwind.config.js
└── app.json
```

## 🎨 UI Components

### Button (`components/ui/Button.tsx`)
- Variants: primary, secondary, outline
- Loading state
- Disabled state
- Customizable with className

### Input (`components/ui/Input.tsx`)
- Label support
- Error message display
- Secure text entry for passwords
- Multiline support
- Various keyboard types

### Card (`components/ui/Card.tsx`)
- Consistent card styling
- Shadow and border
- Customizable with className

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI

### Installation

1. Navigate to the Frontend directory:
```bash
cd Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on specific platform:
```bash
npm run android   # Android
npm run ios       # iOS
npm run web       # Web
```

## 📱 Navigation Structure

```
Root
├── (auth)
│   ├── login
│   └── signup
└── (tabs)
    ├── index (Home)
    ├── chat
    ├── upload
    ├── psychologists
    └── profile
```

## 🎨 Design System

### Colors
- **Primary**: Blue (#2563eb)
- **Success**: Green (#16a34a)
- **Warning**: Orange (#ea580c)
- **Danger**: Red (#ef4444)
- **Gray Scale**: Various shades for text and backgrounds

### Typography
- **Headings**: Bold, various sizes (text-xl to text-4xl)
- **Body**: Regular weight, text-base
- **Small**: text-sm for secondary information

### Spacing
- Consistent padding: px-4, px-6, py-4, py-6
- Margins: mb-4, mb-6, mb-8
- Gap: gap-3, gap-4

## 🔧 Configuration

### NativeWind (TailwindCSS)
- Configured in `tailwind.config.js`
- Global styles in `app/(tabs)/global.css`
- Utility-first CSS framework

### Expo Router
- File-based routing
- Typed routes enabled
- Stack and Tab navigation

## 📦 Dependencies

### Core
- `expo`: ~54.0.20
- `react`: 19.1.0
- `react-native`: 0.81.5

### Navigation
- `expo-router`: ~6.0.13
- `@react-navigation/native`: ^7.1.8
- `@react-navigation/bottom-tabs`: ^7.4.0

### UI & Styling
- `nativewind`: ^4.2.1
- `tailwindcss`: ^3.4.18
- `@expo/vector-icons`: ^15.0.3

### Features
- `expo-image-picker`: ~16.0.6 (for photo uploads)
- `expo-image`: ~3.0.10
- `react-native-gesture-handler`: ~2.28.0
- `react-native-reanimated`: ~3.17.4

## 🔮 Future Integration Points

### Backend Integration
1. **Authentication API**
   - Connect login/signup to backend
   - JWT token management
   - Secure storage

2. **RAG Chatbot**
   - WebSocket connection for real-time chat
   - Message history persistence
   - Context-aware responses

3. **Image Upload**
   - Connect to cloud storage (AWS S3, Cloudinary)
   - Image optimization
   - Profile photo management

4. **Psychologist Messaging**
   - Real-time messaging system
   - Consultation scheduling
   - Notification system

5. **User Profile**
   - Profile data persistence
   - Update API endpoints
   - Photo upload integration

## 📝 Notes

- TypeScript errors for route types will resolve after running the app (Expo Router generates types)
- All pages are currently using placeholder data
- Backend integration points are marked with comments
- Image picker functionality needs expo-image-picker configuration in app.json

## 🎯 Next Steps

1. Run `npm install` to install the new expo-image-picker dependency
2. Test the app on your preferred platform
3. Integrate backend APIs
4. Add authentication state management (Context API or Zustand)
5. Implement actual image picker functionality
6. Connect RAG chatbot backend
7. Add push notifications
8. Implement real-time messaging

## 🤝 Development Guidelines

- Use TypeScript for type safety
- Follow the existing component structure
- Maintain consistent styling with TailwindCSS
- Keep components reusable and modular
- Add proper error handling
- Implement loading states for async operations
