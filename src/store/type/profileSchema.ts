import { z } from 'zod';

// Base schema for common profile fields
export const profileBaseSchema = z.object({
  userId: z.string(),
  email: z.string().email("Invalid email address"),
  fullName: z.object({
    firstName: z.string().min(1, "First name is required").max(50),
    lastName: z.string().min(1, "Last name is required").max(50),
  }),
  username: z.string().min(3, "Username must be at least 3 characters").max(30),
  profilePicture: z.string().optional(),
  bio: z.string().max(500).optional(),
  dateOfBirth: z.union([
    z.string().transform((val) => new Date(val)),
    z.date()
  ]).refine((date) => !isNaN(date.getTime()), {
    message: "Invalid date format",
  }),
  gender: z.enum(['Male', 'Female', 'Non-binary', 'Prefer not to say']),
  occupation: z.string().max(100).optional(),
  phoneNumber: z.string().min(10).max(15),
  country: z.string().min(1, "Country is required").max(50),
  skills: z.array(z.string()).default([]),
  interestsHobbies: z.array(z.string()).default([]),
  socialMediaLinks: z.object({
    twitter: z.string().url("Invalid Twitter URL").optional().or(z.literal('')),
    facebook: z.string().url("Invalid Facebook URL").optional().or(z.literal('')),
    instagram: z.string().url("Invalid Instagram URL").optional().or(z.literal('')),
    other: z.string().url("Invalid URL").optional().or(z.literal(''))
  }).optional().default({
    twitter: '',
    facebook: '',
    instagram: '',
    other: ''
  })
});

// Export type for TypeScript usage
export type UserProfileInput = z.infer<typeof profileBaseSchema>;

// Default values matching the schema
export const defaultValues: UserProfileInput = {
  userId: '',
  email: '',
  fullName: {
    firstName: '',
    lastName: '',
  },
  username: '',
  profilePicture: '',
  bio: '',
  dateOfBirth: new Date(),
  gender: 'Prefer not to say',
  occupation: '',
  phoneNumber: '',
  country: '',
  skills: [],
  interestsHobbies: [],
  socialMediaLinks: {
    twitter: '',
    facebook: '',
    instagram: '',
    other: ''
  }
};

// Export the profile schema for API validation
export const profileSchema = profileBaseSchema;