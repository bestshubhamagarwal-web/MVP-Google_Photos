# Vercel Deployment Plan

This document outlines the step-by-step strategy for deploying the MVP Photos project to Vercel. The project consists of a Vite React frontend and an Express Node.js backend.

## Architecture on Vercel

Vercel excels at hosting static frontends (like Vite apps) and supports serverless functions for backends (like Express). We will use a unified deployment approach by utilizing a `vercel.json` file.

1. **Frontend**: Vite builds the static assets into a `dist` directory. Vercel will serve these assets globally via its Edge Network.
2. **Backend API**: The Express server (`server.ts`) will be converted into a Vercel Serverless Function to handle `/api/*` endpoints.
3. **Static Media**: The mock photos in `data/photos` will be served directly.

## Deployment Steps

### 1. Update Project Structure for Vercel
Vercel needs a configuration file at the root to understand how to build and route the monorepo-style setup.

- Create a `vercel.json` in the root:
  ```json
  {
    "version": 2,
    "builds": [
      {
        "src": "frontend/package.json",
        "use": "@vercel/vite"
      },
      {
        "src": "server.ts",
        "use": "@vercel/node"
      }
    ],
    "routes": [
      {
        "src": "/api/(.*)",
        "dest": "/server.ts"
      },
      {
        "src": "/media/(.*)",
        "dest": "/data/photos/$1"
      },
      {
        "src": "/(.*)",
        "dest": "/frontend/dist/$1"
      }
    ]
  }
  ```

### 2. Configure Environment Variables
In your Vercel Project Dashboard, navigate to **Settings > Environment Variables** and add:
- `GEMINI_API_KEY`: Your Google Gemini API Key.
- `NODE_ENV`: Set to `production`.

### 3. Adapt Express Server for Serverless
Vercel's `@vercel/node` builder can automatically wrap an Express app, but ensure that `server.ts` exports the `app` instance instead of only calling `app.listen()` directly. 

At the bottom of `server.ts`:
```typescript
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

export default app; // Required for Vercel
```

### 4. Build Configuration
Ensure the `package.json` in the root has a build script if necessary, or let Vercel handle the frontend build natively by specifying the `frontend` as the Root Directory in Vercel settings. If doing so, the `vercel.json` configuration might be simplified to just handle Serverless API rewrites.

### 5. Potential Limitations & Caveats
- **@xenova/transformers**: If the backend loads large machine learning models into memory, it might exceed Vercel's Serverless Function limits (50MB size limit and 10s timeout on the free tier). Consider moving heavy ML workloads to a dedicated backend like Render or Railway if you hit execution timeouts.
- **File System (fs)**: Vercel functions are read-only. `fs.readFileSync` for `data/index.json` will work as long as it's packaged, but you cannot write to the file system.

### 6. Deployment Execution
You can deploy using the Vercel CLI:
```bash
npm i -g vercel
vercel
```
Or connect your GitHub repository directly to Vercel for automatic CI/CD deployments on push.
