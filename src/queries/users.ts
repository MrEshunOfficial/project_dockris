// auth-utils.ts
// import { connect } from './dbconfigue/dbConfigue';
import { connect } from "@/dbconfigue/dbConfigue";
import { User } from "@/models/authentication/authModel";
import bcrypt from 'bcryptjs';

export async function registerUser(userData: { 
  name: string; 
  email: string; 
  password: string; 
}) {
  try {
    await connect();
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Log the registration attempt
    console.log('Attempting to register user:', {
      email: userData.email,
      name: userData.name,
      passwordLength: userData.password?.length
    });

    // Create new user
    const user = new User({
      name: userData.name,
      email: userData.email,
      password: userData.password // Will be hashed by the pre-save hook
    });

    // Save user and log the result
    const savedUser = await user.save();
    console.log('User registered successfully:', {
      id: savedUser._id,
      email: savedUser.email,
      hasPassword: !!savedUser.password,
      passwordLength: savedUser.password?.length
    });

    return savedUser;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

export async function verifyCredentials(email: string, password: string) {
  try {
    await connect();
    
    console.log('Verifying credentials for:', email);

    // Find user and explicitly include password
    const user = await User.findOne({ email }).select('password');
    
    console.log('User found:', {
      exists: !!user,
      hasPassword: user ? !!user.password : false,
      isOAuth: user ? user.isOAuthUser() : false
    });

    if (!user) {
      console.log('No user found with email:', email);
      return null;
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    console.log('Password verification result:', isValid);

    return isValid ? user : null;
  } catch (error) {
    console.error('Verification error:', error);
    return null;
  }
}