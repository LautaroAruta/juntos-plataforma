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
          // Determine role
          const role = email === "aruta839@gmail.com" ? "admin" : "cliente";
          
          // Create new user record
          const { error: createError } = await supabase.from("users").insert({
            id: randomUUID(), // Generate a valid UUID to satisfy the database schema
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
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }

      // Fetch latest role and profile status from DB using email (more reliable for manual registration)
      if (token.email) {
        const { data: dbUser } = await supabase
          .from("users")
          .select("id, rol, telefono")
          .eq("email", token.email)
          .single();
        
        if (dbUser) {
          token.id = dbUser.id; // Sync ID
          token.rol = dbUser.rol || "cliente";
          token.perfilCompleto = !!dbUser.telefono;
        } else {
          token.rol = "cliente";
          token.perfilCompleto = false;
        }
      }
      
      return token;
    },
  },
  pages: {
    signIn: "/auth/login",
    newUser: "/auth/completar-perfil",
  },
};
