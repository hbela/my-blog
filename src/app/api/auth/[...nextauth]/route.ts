import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "local",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "local",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "admin@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("Credentials received inside authorize:", credentials);
        try {
          const email = credentials?.email?.toLowerCase()?.trim()
          if (email === "admin@example.com" && credentials?.password === "admin") {
            let user = await prisma.user.findUnique({ where: { email: "admin@example.com" } })
            if (!user) {
              console.log("Admin user missing. Creating...");
              user = await prisma.user.create({ data: { email: "admin@example.com", name: "Admin", role: "ADMIN" } })
            }
            console.log("Returning user:", user.email);
            return user
          }
          console.log("Credentials mismatch!");
          return null
        } catch (error) {
          console.error("Authorize error:", error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      // On initial sign-in, `user` is populated
      if (user) {
        token.id = user.id
        // @ts-ignore
        token.role = user.role
      }
      // Always refresh the role from DB on every token refresh so
      // role changes (e.g. promoting to ADMIN) take effect immediately
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true }
        })
        if (dbUser) {
          token.role = dbUser.role
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        // @ts-ignore
        session.user.role = token.role
        // @ts-ignore
        session.user.id = token.id
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "secret",
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
