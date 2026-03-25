import "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
    companyId?: string | null;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      companyId: string | null;
    };
  }
}
