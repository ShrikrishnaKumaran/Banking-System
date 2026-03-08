# Prompts for Code Reviews and Best Practices
### 1. Handling Phone Numbers & Country Codes (OTP Auth)
Firebase requires phone numbers in the **E.164 format** (e.g., `+919876543210` for India). However, for your UI and analytics, it is often better to store the country code separately. 

**Industry Standard Solution:** Store it as a nested object.
```javascript
phone: {
  countryCode: String, // e.g., "+91"
  number: String,      // e.g., "9876543210"
}
```

### 2. Renaming to `panIdHash`
**Approved.** 🟢 This is Domain-Driven Design (DDD). If your FinTech operates in India, using `panIdHash` or `aadhaarHash` instead of a generic `nationalId` makes your codebase much easier for your team to understand. We will officially lock in `panIdHash`.

### 3. Zod Redundancy (Create vs. Update)
You spotted a very common anti-pattern! Rewriting validations for Create and Update violates the **DRY (Don't Repeat Yourself)** principle. 

**The Clever Industry Standard:** Zod has built-in utility functions like `.omit()`, `.pick()`, and `.partial()`. You define one "Base" schema, and derive the others from it.

Here is how we do it in production:

```typescript
import { z } from 'zod';

// 1. The BASE Schema (All the strict rules)
const BaseUserSchema = z.object({
  email: z.string().email(),
  panIdHash: z.string().length(64), // Assuming SHA-256 hash length
  kycStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
  isActive: z.boolean()
});

// 2. The CREATE Schema (User signs up)
// The user shouldn't be able to set their own kycStatus or isActive flag during signup!
export const CreateUserSchema = BaseUserSchema.omit({ 
  kycStatus: true, 
  isActive: true 
});

// 3. The UPDATE Schema (User edits profile)
// .partial() makes every field OPTIONAL, so they can update just one field (like email)
export const UpdateUserSchema = BaseUserSchema.omit({
  panIdHash: true // Never let them update their PAN ID via a standard update route!
}).partial();
```
*Notice how we only wrote the `.email()` validation once? That is the standard.*

---
