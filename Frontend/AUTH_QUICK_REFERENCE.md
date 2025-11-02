# Quick Reference: Refactored Auth Screens

## 🎯 The New Approach

### Before: Messy
- 4 separate screens
- ~700 lines of similar code
- Hard to maintain
- Inconsistent styling

### After: Clean
- 5 reusable components
- ~300 lines total (57% reduction)
- Easy to maintain
- Consistent everywhere

---

## 📦 New Components Location

```
components/auth/
├── AuthFormLayout.tsx     - Wrapper for all auth screens
├── AuthHeader.tsx         - Title/subtitle (client or consultant themed)
├── AuthFooter.tsx         - Navigation links and role switching
├── RoleSelector.tsx       - Client/Consultant toggle button
├── AuthInfoBox.tsx        - Info/warning boxes
└── index.ts               - Exports
```

---

## 🔧 Usage Example: Simple Login Screen

```tsx
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from '@/hooks/useForm';
import { validateEmail, validatePassword } from '@/utils/validation';
import { AuthFormLayout, AuthHeader, AuthFooter } from '@/components/auth';
import { Alert } from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function LoginScreen() {
  const auth = useAuth();
  
  const form = useForm(
    { email: '', password: '' },
    async (values) => {
      await auth.login(values.email, values.password);
      router.replace('/(tabs)');
    },
    (values) => ({
      email: validateEmail(values.email) || '',
      password: validatePassword(values.password) || '',
    })
  );

  return (
    <>
      <StatusBar style="dark" />
      <AuthFormLayout>
        {/* Header */}
        <AuthHeader 
          title="Welcome Back" 
          subtitle="Sign in to continue"
          variant="client"
        />

        {/* Error display */}
        {auth.error && (
          <Alert 
            type="error" 
            message={auth.error}
            dismissible
            onDismiss={() => auth.clearError()}
          />
        )}

        {/* Form fields */}
        <Input
          label="Email"
          placeholder="Enter your email"
          value={form.values.email}
          onChangeText={form.handleChange('email')}
          error={form.touched.email ? form.errors.email : undefined}
        />

        <Input
          label="Password"
          placeholder="Enter your password"
          value={form.values.password}
          onChangeText={form.handleChange('password')}
          secureTextEntry
          error={form.touched.password ? form.errors.password : undefined}
        />

        {/* Button */}
        <Button
          title={auth.isLoading ? 'Signing in...' : 'Sign In'}
          onPress={form.handleSubmit}
          loading={auth.isLoading}
          disabled={auth.isLoading}
        />

        {/* Footer with navigation */}
        <AuthFooter variant="login" userType="client" />
      </AuthFormLayout>
    </>
  );
}
```

---

## 🎨 Component Props Reference

### AuthFormLayout
```typescript
<AuthFormLayout>
  {/* children */}
</AuthFormLayout>
```
**Props:** `children: ReactNode`

---

### AuthHeader
```typescript
<AuthHeader 
  title="Welcome Back"
  subtitle="Sign in to continue"
  variant="client" // "client" | "consultant"
/>
```
**Props:**
- `title: string` - Main heading
- `subtitle?: string` - Subheading
- `variant?: 'client' | 'consultant'` - Color scheme

---

### AuthFooter
```typescript
<AuthFooter 
  variant="login" // "login" | "signup"
  userType="client" // "client" | "consultant"
  onSwitchRole={() => router.replace('/(consultant-auth)/login')}
/>
```
**Props:**
- `variant: 'login' | 'signup'` - Shows signup link or signin link
- `userType: 'client' | 'consultant'` - Color scheme and routes
- `onSwitchRole?: () => void` - Optional role switch handler

---

### RoleSelector
```typescript
<RoleSelector 
  role={role}
  onRoleChange={setRole}
  consultantNote={true}
/>
```
**Props:**
- `role: 'client' | 'consultant'` - Current selected role
- `onRoleChange: (role) => void` - Callback when toggled
- `consultantNote?: boolean` - Show verification info box

---

### AuthInfoBox
```typescript
<AuthInfoBox 
  type="warning"
  title="Verification Required"
  message="Your application will be reviewed..."
/>
```
**Props:**
- `type: 'note' | 'warning' | 'info'` - Style variant
- `title?: string` - Box title
- `message: string` - Box content

---

## ✨ Key Benefits

| Before | After |
|--------|-------|
| 150+ lines per screen | 60 lines per screen |
| Manual state management | useForm hook |
| Duplicate validation | Reusable validators |
| Inconsistent styling | Centralized components |
| Hard to update | Single source of truth |

---

## 🔄 Copy-Paste Ready Templates

### Client Login Screen
```typescript
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from '@/hooks/useForm';
import { validateEmail, validatePassword } from '@/utils/validation';
import { AuthFormLayout, AuthHeader, AuthFooter } from '@/components/auth';
import { Alert } from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function LoginScreen() {
  const auth = useAuth();
  const form = useForm(
    { email: '', password: '' },
    async (v) => { await auth.login(v.email, v.password); router.replace('/(tabs)'); },
    (v) => ({ email: validateEmail(v.email) || '', password: validatePassword(v.password) || '' })
  );
  return (
    <>
      <StatusBar style="dark" />
      <AuthFormLayout>
        <AuthHeader title="Welcome Back" subtitle="Sign in to continue" />
        {auth.error && <Alert type="error" message={auth.error} dismissible onDismiss={() => auth.clearError()} />}
        <Input label="Email" placeholder="Enter email" value={form.values.email} onChangeText={form.handleChange('email')} error={form.touched.email ? form.errors.email : undefined} />
        <Input label="Password" placeholder="Enter password" value={form.values.password} onChangeText={form.handleChange('password')} secureTextEntry error={form.touched.password ? form.errors.password : undefined} />
        <Button title={auth.isLoading ? 'Signing in...' : 'Sign In'} onPress={form.handleSubmit} loading={auth.isLoading} />
        <AuthFooter variant="login" userType="client" />
      </AuthFormLayout>
    </>
  );
}
```

---

## 📋 Checklist for Refactoring Remaining Screens

- [ ] `(auth)/signup.tsx` - Client signup
- [ ] `(consultant-auth)/login.tsx` - Consultant login  
- [ ] `(consultant-auth)/signup.tsx` - Consultant signup

Each should take ~30 minutes to refactor!

---

## 🐛 Troubleshooting

**Q: Components not found?**
A: Make sure you imported from `@/components/auth` not `@/components/ui`

**Q: Form validation not working?**
A: Ensure you pass validators to useForm's third parameter

**Q: Colors look wrong?**
A: Check the `variant` prop on `AuthHeader` - should be 'client' or 'consultant'

**Q: Navigation not working?**
A: Verify `userType` prop matches your user type in `AuthFooter`
