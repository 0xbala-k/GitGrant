export interface GitHubUser {
    id: number;
    login: string;
    name: string | null;
    email: string | null;
    avatar_url: string;
    bio: string | null;
  }
  
  export interface AuthState {
    user: GitHubUser | null;
    accessToken: string | null;
    expiresAt?: number;
  }