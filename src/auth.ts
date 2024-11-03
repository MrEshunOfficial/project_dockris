import NextAuth from 'next-auth';
import type { NextAuthConfig, Session, User as AuthUser, DefaultSession } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { User } from "@/models/authentication/authModel";
import crypto from 'crypto';
import { connect } from './dbconfigue/dbConfigue';

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      role?: string;
      email?: string | null;
      name?: string | null;
    } & DefaultSession['user'];
    sessionId?: string;
  }

  interface User {
    id?: string;
    role?: string;
    email?: string | null;
    name?: string | null;
  }
}

const publicPaths: string[] = ['/info/about', '/info/contact', '/authclient/Register', '/authclient/Login'];
const privatePaths: string[] = ['/Features', '/profile', '/settings', '/account'];

interface CustomToken extends JWT {
  id?: string;
  role?: string;
  sessionId?: string;
}

export const authOptions: NextAuthConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/authclient/Login',
    error: '/authclient/error',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    }),
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Missing credentials');
          }
          
          await connect();
          
          // Use select('+password') to explicitly include the password field
          const user = await User.findOne({ email: credentials.email }).select('+password');
          
          if (!user) {
            throw new Error('User not found');
          }
          
          if (user.provider && user.providerId) {
            throw new Error(`Please sign in with ${user.provider}`);
          }
          
          const isPasswordValid = await user.comparePassword(credentials.password);
          
          if (!isPasswordValid) {
            throw new Error('Invalid password');
          }
          
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role
          };
        } catch (error: any) {
          console.error('Authorization error:', error);
          throw new Error(error.message || 'Authentication failed');
        }
      }
    })
  ],
  callbacks: {
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const path = nextUrl.pathname;

      if (publicPaths.some(p => path.startsWith(p))) {
        // If user is logged in and tries to access auth pages, redirect to home
        if (isLoggedIn && (path.startsWith('/authclient/Login') || path.startsWith('/authclient/Register'))) {
          return Response.redirect(new URL('/', nextUrl));
        }
        return true;
      }
      
      if (privatePaths.some(p => path.startsWith(p))) {
        if (!isLoggedIn) {
          return Response.redirect(new URL('/authclient/Login', nextUrl));
        }
        return true;
      }

      if (path === '/') {
        if (!isLoggedIn) {
          return Response.redirect(new URL('/authclient/Login', nextUrl));
        }
        return true;
      }

      return true;
    },
    
    async signIn({ user, account }) {
      if (!user?.email) return false;
      
      try {
        await connect();
        
        let dbUser = await User.findOne({ email: user.email });
        
        if (!dbUser) {
          if (account) {
            dbUser = await User.create({
              email: user.email,
              name: user.name,
              provider: account.provider,
              providerId: account.providerAccountId,
            });
          } else {
            return false;
          }
        }
        
        if (account) {
          if (dbUser.provider && dbUser.provider !== account.provider) {
            return false;
          }
          dbUser.providerId = account.providerAccountId;
          dbUser.provider = account.provider;
          await dbUser.save();
        }
        
        user.id = dbUser._id.toString();
        user.role = dbUser.role;
        
        return true;
      } catch (error) {
        console.error('SignIn error:', error);
        return false;
      }
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.sessionId = crypto.randomBytes(32).toString('hex');
      }
      return token;
    },

    async session({ session, token }: { session: Session; token: CustomToken }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.sessionId = token.sessionId;
      }
      return session;
    },
  },
};

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authOptions);