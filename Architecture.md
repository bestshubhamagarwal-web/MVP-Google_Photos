# Architecture Document: Recall Photos

## 1. System Overview
"Recall Photos" is a local, single-user web application designed to emulate the Google Photos web experience, focusing on advanced search capabilities like "Ask Photos" and a guided recall feature called "Help Me Remember". The system operates on a generated dataset of 2,500 synthetic photos, entirely offline/local except for API calls to generative AI models (Gemini) for image generation, tagging, and query understanding.

## 2. Tech Stack

### Frontend
- **Framework:** React with Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS (with specific design tokens matching Google Photos)
- **State Management:** Zustand (for global UI state, search context, and recall session state)
- **Routing:** React Router
- **Key Libraries:**
  - `justified-layout`: For rendering the Google Photos-style photo grid.
  - `@tanstack/react-virtual`: For virtualized rendering of the large photo grid (2,500+ items).
- **Assets:** Material Symbols (Outlined), Roboto font (Google Fonts).

### Backend
- **Environment:** Node.js + Express
- **Role:** Serves as a local API and static file server. It handles serving images, index data, orchestrating AI endpoints, and logging. Holds API keys securely (using `.env`).

### AI & Data Processing
- **Image Generation:** Gemini API (`GEMINI_IMAGE_MODEL`) for creating base scenes, manipulated via `sharp` for variants.
- **Image/Text Embeddings:** CLIP via `@xenova/transformers` (running locally in Node.js) for semantic search and visual similarity (look-alike groups, "More like this").
- **LLM/Vision:** Gemini API (`GEMINI_CHAT_MODEL`, `GEMINI_TAG_MODEL`) for query understanding, photo tagging, and conversational search answers.
- **Image Processing:** `sharp` for resizing and thumbnails, `exifr` for EXIF data (if needed).
- **Face Grouping (Optional):** `@vladmandic/face-api` for local face clustering.

### Storage
- Local File System (JSON and Binaries). No traditional database.

## 3. Data Architecture & Pipeline

### 3.1 Data Storage Layout
```
/data/
  ├── photos/
  │   ├── generated/ (2,500 synthetic JPEGs)
  │   └── own/       (Optional user photos)
  ├── thumbs/        (256px thumbnails)
  ├── index.json     (Primary metadata index for all photos)
  ├── embeddings.bin (CLIP embeddings + ID map)
  ├── anchors.json   (Detected trips, festivals)
  ├── events.jsonl   (Telemetry and metrics logging)
  └── ... (other metadata files like people.json, demo_targets.json)
```

### 3.2 Data Pipeline Workflows
The pipeline is executed via npm scripts:
1.  **Generation (`npm run generate`)**:
    -   Reads `/scripts/scenes.json`.
    -   Generates base images via Gemini API (or procedural SVGs via `--procedural`).
    -   Uses `sharp` to create variants (crop, flip, color shift).
    -   Renders utility templates (receipts, medicine).
2.  **Seeding (`npm run seed`)**:
    -   Generates Takeout-style JSON sidecars with synthetic metadata (timestamp, geoData) simulating an 8-year span with realistic clustering (trips, events).
3.  **Indexing (`npm run index`)**:
    -   Compiles `/data/index.json`.
    -   Generates local CLIP embeddings (`/data/embeddings.bin`).
    -   Optionally uses Gemini (`--vision`) to tag photos or local face-api (`--faces`).
    -   Generates `/data/anchors.json` for time-based queries.

## 4. Frontend Architecture

### 4.1 Component Hierarchy (High-Level)
- `AppShell` (Layout wrapper)
  - `TopAppBar`
    - `SearchBar` (with Classic / Ask Photos Toggle)
  - `LeftNavDrawer` (Photos, Explore, Albums, etc.)
  - `MainContentArea`
    - `Routes`:
      - `/photos`: `PhotoGrid` (Virtualized justified layout)
      - `/explore`: `ExploreView` (Categorized cards)
      - `/search`: `SearchResultsView`
  - `PhotoViewer` (Full-screen overlay, triggered globally)
    - `InfoPanel`
  - `AskPanel` (Slides down below TopAppBar when Ask mode is active)
  - `HelpMeRememberPanel` (Rendered above grid in search results)

### 4.2 State Management (Zustand)
- **`usePhotoStore`**: Loads and caches `index.json`, manages currently selected photos, and grid display settings.
- **`useSearchStore`**: Manages the current search query, search mode (Classic vs. Ask), and the active set of filtered results.
- **`useRecallStore`**: Manages the state of the "Help Me Remember" session (current question, answers picked, active filters, remaining photo count, checkpoint state).

## 5. Backend Architecture & API

### 5.1 Endpoints
-   `GET /images/*`: Serves raw photos and thumbnails.
-   `GET /api/index`: Returns `index.json` and `anchors.json`.
-   `GET /api/search?q=...`: Handles classic keyword search.
-   `POST /api/ask`: Handles AI conversational search pipeline.
-   `POST /api/log`: Appends telemetry events to `/data/events.jsonl`.
-   `POST /api/similar`: Returns similar photos based on CLIP embeddings.

### 5.2 AI Search Pipeline (`/api/ask`)
1.  **Query Understanding**: Sends user query to Gemini to extract JSON (semantic intent, entities, time anchors).
2.  **Candidate Retrieval**:
    -   Computes CLIP embedding of semantic intent.
    -   Compares against local `embeddings.bin` (top 300).
    -   Applies soft filtering/scoring based on extracted JSON entities and time anchors.
3.  **Re-ranking & Answering**: Sends top 40 candidate metadata to Gemini to generate the conversational answer and final ranking.
4.  **Confidence Check**: If confidence is low, the backend suggests "Help Me Remember" inline chips.

## 6. Core System Workflows

### 6.1 "Help Me Remember" (Guided Recall)
-   **Trigger**: Struggles detected in search, inline chips, or explicit nav item.
-   **Execution**:
    -   Dynamically selects the next best question using Shannon entropy over current candidates (avoids questions with > 85% uniformity).
    -   Uses soft scoring (not hard filtering) based on answers.
    -   Maintains a live counter of candidates.
-   **Checkpoints**: Triggers k-means clustering (k=4) on CLIP embeddings when candidates <= 120, showing 4 visual "look-alike" groups.
-   **Near-miss Jump**: UI affords jumping to the timeline context of a specific photo.

## 7. Telemetry & Metrics
-   **Logging**: Every critical interaction is logged to `events.jsonl` (searches, scrolling, photo opens, recall question answers, etc.).
-   **`/metrics` Dashboard**: A specialized frontend route that parses `events.jsonl` to calculate:
    -   Vague-query success rate.
    -   Time to find.
    -   Feature health (question skip rates, checkpoint usage).
    -   Comparison across modes (Classic, A/B, Ask Photos).
