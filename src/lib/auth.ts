import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      rol?: string;
      perfilCompleto?: boolean;
      referral_code?: string;
      registration_step?: number;
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: "Email y Contraseña",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (error || !data.user) return null;

        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.nombre || data.user.email,
        };
      }
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const email = user.email;
        if (!email) return false;

        // Check if user exists in public.users
        const { data: existingUser } = await supabase
          .from("users")
          .select("id")
          .eq("email", email)
          .single();

        if (!existingUser) {
          // Determine role - 'nuevo' initially so they can choose, or 'admin'
          const role = email === "aruta839@gmail.com" ? "admin" : "nuevo";
          
          // Create new user record
          const { error: createError } = await supabase.from("users").insert({
            id: randomUUID(),
            nombre: profile?.name?.split(" ")[0] || "Usuario",
            apellido: profile?.name?.split(" ").slice(1).join(" ") || "Google",
            email: email,
            rol: role,
            avatar_url: user.image
          });

          if (createError) {
            console.error("Error creating user in public.users:", createError);
            return false;
          }
        } else {
          // User already exists, update their avatar if it changed (optional but good)
          await supabase.from("users").update({ avatar_url: user.image }).eq("email", email);
        }
        return true;
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        // @ts-ignore
        session.user.rol = token.rol as string;
        // @ts-ignore
        session.user.perfilCompleto = token.perfilCompleto as boolean;
        // @ts-ignore
        session.user.referral_code = token.referral_code as string;
        // @ts-ignore
        session.user.registration_step = token.registration_step as number;
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }

      // Handle session update (from update() hook in client)
      if (trigger === "update" && session?.rol) {
        token.rol = session.rol;
      }

      // Fetch latest role and profile status from DB using email
      if (token.email) {
        const { data: dbUser } = await supabase
          .from("users")
          .select("id, rol, telefono, referral_code, registration_step")
          .eq("email", token.email)
          .single();
        
        if (dbUser) {
          token.id = dbUser.id;
          token.rol = dbUser.rol || null; // Null means they need to pick a role
          token.perfilCompleto = !!dbUser.telefono;
          // @ts-ignore
          token.referral_code = dbUser.referral_code;
          // @ts-ignore
          token.registration_step = dbUser.registration_step;
        } else {
          // If user exists in auth but not in public.users (Edge case)
          token.rol = null;
          token.perfilCompleto = false;
        }
      }
      
      return token;
    },
  },
  pages: {
    signIn: "/auth/login",
    newUser: "/elegir-rol",
  },
};
