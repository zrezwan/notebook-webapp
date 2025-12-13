This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Option 1: Using Docker (Recommended for Windows)

If you don't have Node.js/npm installed, you can use Docker:

```bash
# Build and start the development server
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

The application will be available at [http://localhost:3000](http://localhost:3000)

To stop the container:
```bash
docker-compose down
```

### Option 2: Local Development

If you have Node.js installed:

```bash
npm install
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Environment Variables

The frontend needs `API_URL` environment variable pointing to your backend:
- Default in Docker: `http://host.docker.internal:8080/notebook-backend/api`
- For local development: Create a `.env.local` file with:
  ```
  API_URL=http://localhost:8080/notebook-backend/api
  ```

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
