## Update env variables for github OAuth

Add following env variables
NEXT_PUBLIC_GITHUB_CLIENT_ID
NEXT_PUBLIC_GITHUB_REDIRECT_URI=http://localhost:3000/auth/callback/github
GITHUB_CLIENT_SECRET

## Running development server

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.