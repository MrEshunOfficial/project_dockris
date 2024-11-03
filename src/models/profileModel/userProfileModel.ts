import mongoose, { Document, Schema, Model } from 'mongoose';

// Interface for the UserProfile document
interface IUserProfile extends Document {
  _id: string;
  userId: string;
  email: string;
  fullName: {
    firstName: string;
    lastName: string;
  };
  username: string;
  profilePicture?: string;
  bio?: string;
  dateOfBirth: Date;
  gender: 'Male' | 'Female' | 'Non-binary' | 'Prefer not to say';
  occupation?: string;
  phoneNumber: string;
  country: string;
  skills: string[];
  interestsHobbies: string[];
  socialMediaLinks?: {
    twitter?: string | null;
    facebook?: string | null;
    instagram?: string | null;
    other?: string | null;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema = new Schema<IUserProfile>(
  {
    userId: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true,
      lowercase: true
    },
    fullName: {
      firstName: { 
        type: String, 
        required: true,
        trim: true,
        maxlength: 50 
      },
      lastName: { 
        type: String, 
        required: true,
        trim: true,
        maxlength: 50 
      }
    },
    username: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30
    },
    profilePicture: { 
      type: String,
      trim: true 
    },
    bio: { 
      type: String,
      maxlength: 500,
      trim: true 
    },
    dateOfBirth: { 
      type: Date,
      required: true 
    },
    gender: { 
      type: String, 
      enum: ['Male', 'Female', 'Non-binary', 'Prefer not to say'],
      required: true 
    },
    occupation: { 
      type: String,
      maxlength: 100,
      trim: true 
    },
    phoneNumber: { 
      type: String, 
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 15
    },
    country: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: 50 
    },
    skills: [{ 
      type: String,
      trim: true 
    }],
    interestsHobbies: [{ 
      type: String,
      trim: true 
    }],
    socialMediaLinks: {
      type: {
        twitter: { 
          type: String,
          trim: true,
          validate: {
            validator: function(v: string | null) {
              if (!v) return true; // Allow null/empty
              return /^https?:\/\//.test(v); // Basic URL validation
            },
            message: 'Invalid URL format'
          }
        },
        facebook: { 
          type: String,
          trim: true,
          validate: {
            validator: function(v: string | null) {
              if (!v) return true;
              return /^https?:\/\//.test(v);
            },
            message: 'Invalid URL format'
          }
        },
        instagram: { 
          type: String,
          trim: true,
          validate: {
            validator: function(v: string | null) {
              if (!v) return true;
              return /^https?:\/\//.test(v);
            },
            message: 'Invalid URL format'
          }
        },
        other: { 
          type: String,
          trim: true,
          validate: {
            validator: function(v: string | null) {
              if (!v) return true;
              return /^https?:\/\//.test(v);
            },
            message: 'Invalid URL format'
          }
        }
      },
      required: false
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function(doc, ret) {
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Indexes
ProfileSchema.index({ email: 1 });
ProfileSchema.index({ userId: 1 });
ProfileSchema.index({ username: 1 });

// Add URL validation middleware
ProfileSchema.pre('save', function(next) {
  const profile = this;
  if (profile.socialMediaLinks) {
    const links = profile.socialMediaLinks;
    Object.keys(links).forEach(key => {
      if (links[key as keyof typeof links] === '') {
        links[key as keyof typeof links] = null;
      }
    });
  }
  next();
});

// Model creation with error handling
let UserProfile: Model<IUserProfile>;
try {
  UserProfile = mongoose.model<IUserProfile>('UserProfile');
} catch {
  UserProfile = mongoose.model<IUserProfile>('UserProfile', ProfileSchema);
}

export { UserProfile };