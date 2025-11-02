# Tutore App - Codebase Explanation

## Overview

Tutore is a cross-platform educational consulting application built with Expo and React Native. It connects students with professional consultants through a modern, intuitive interface.

## 🏗 Architecture

### Authentication System (Dual-Role)

#### Client Authentication (`app/(auth)/`)
```
├── _layout.tsx      # Auth navigation stack
├── login.tsx        # Client login screen
└── signup.tsx       # Client signup with role selector
```

The authentication system supports two user types:
- **Clients** (Students)
- **Consultants** (Professional advisors)

Key Features:
- Role selection during signup
- Separate flows for clients and consultants
- Professional verification for consultants

#### Consultant Authentication (`app/(consultant-auth)/`)
```
├── _layout.tsx      # Consultant auth stack
├── login.tsx        # Professional login
└── signup.tsx       # Detailed consultant application
```

Special Features:
- License number verification
- Professional details collection
- Application review process
- Specialized dashboard access

### Navigation Structure

#### Client Navigation (`app/(tabs)/`)
```
├── _layout.tsx          # Tab navigation setup
├── index.tsx            # Home dashboard
├── chat.tsx            # AI assistant
├── upload.tsx          # Document sharing
├── psychologists.tsx   # Find consultants
└── profile.tsx         # User profile
```

#### Consultant Navigation (`app/(consultant-tabs)/`)
```
├── _layout.tsx          # Professional tab navigation
├── index.tsx            # Consultant dashboard
├── sessions.tsx         # Session management
├── messages.tsx         # Client communications
└── profile.tsx         # Professional profile
```

## 🎨 UI Components

### Core Components (`components/ui/`)

#### Button (`Button.tsx`)
A versatile button component with:
- Multiple variants (primary, outline)
- Loading states
- Disabled handling
- Custom styling via className

Usage:
```tsx
<Button 
  title="Sign In"
  onPress={handleLogin}
  loading={loading}
  variant="primary"
/>
```

#### Input (`Input.tsx`)
Enhanced text input with:
- Built-in label support
- Error state handling
- Various keyboard types
- Secure text entry option

Usage:
```tsx
<Input
  label="Email"
  value={email}
  onChangeText={setEmail}
  error={errors.email}
  keyboardType="email-address"
/>
```

#### Card (`Card.tsx`)
Container component for:
- Consistent styling
- Shadow effects
- Flexible content layout

Usage:
```tsx
<Card className="p-4">
  <Text>Card Content</Text>
</Card>
```

## 📱 Key Features Explained

### 1. Home Screen (`app/(tabs)/index.tsx`)
- Modern gradient header
- Quick action cards with icons
- Recent activity tracking
- Daily tips section

Key UI Elements:
```tsx
<View className="bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-500">
  {/* Header content */}
</View>

<View className="flex-row flex-wrap gap-4">
  {/* Quick action cards */}
</View>
```

### 2. Chat Interface (`app/(tabs)/chat.tsx`)
- Real-time message UI
- Typing indicators
- Message history
- Input handling

Core Features:
```tsx
const [messages, setMessages] = useState<Message[]>([]);
const [isTyping, setIsTyping] = useState(false);

// Message sending logic
const handleSend = async () => {
  // Send message implementation
};
```

### 3. Consultant Features (`app/(consultant-tabs)/`)

#### Dashboard (`index.tsx`)
- Session overview
- Student statistics
- Upcoming appointments
- Quick actions

#### Sessions (`sessions.tsx`)
- Calendar integration
- Session management
- Student history

## 🔐 Authentication Flow

### 1. Initial Signup
Users choose their role (Client/Consultant) at signup:
```tsx
const [role, setRole] = useState<'client' | 'consultant'>('client');

// Route to appropriate flow
if (role === 'consultant') {
  router.push('/(consultant-auth)/signup');
} else {
  // Normal client signup
}
```

### 2. Consultant Verification
Professional verification includes:
- License number validation
- Experience verification
- Specialization details
- Application review process

## 🎨 Styling System

The app uses NativeWind (TailwindCSS) for styling:

### Color Scheme
- Primary: Indigo/Violet gradient
- Secondary: Emerald
- Accents: Amber, Rose
- Neutral: Slate

### Common Patterns
```tsx
// Gradient backgrounds
className="bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-500"

// Card styling
className="bg-white rounded-2xl shadow-sm"

// Interactive elements
className="active:opacity-80 disabled:opacity-50"
```

## 🔄 State Management

### Local State
- Form data
- UI interactions
- Loading states

Example:
```tsx
const [formData, setFormData] = useState({
  email: '',
  password: '',
  // ...other fields
});
```

### Navigation State
Managed by Expo Router:
- Stack navigation for auth flows
- Tab navigation for main app
- Deep linking support

## 📱 Platform Specific Features

### Mobile
- Native keyboard handling
- Touch feedback
- Platform-specific styling

### Web
- Responsive design
- Keyboard navigation
- Hover states

## 🚀 Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start development:
```bash
npm start
```

3. Run on platform:
```bash
npm run ios     # iOS
npm run android # Android
npm run web     # Web
```

## 🔮 Next Steps

1. Backend Integration
   - Authentication API
   - Real-time messaging
   - Data persistence

2. Feature Enhancement
   - Push notifications
   - File attachments
   - Video consultations

3. Performance
   - Image optimization
   - Caching strategies
   - Lazy loading

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native](https://reactnative.dev/)
- [NativeWind](https://www.nativewind.dev/)
- [TypeScript](https://www.typescriptlang.org/)