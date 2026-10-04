# Phase-Wise Implementation Plan: Recall Photos

This document outlines the detailed phase-wise implementation plan for the "Recall Photos" MVP, combining requirements from the Product Summary, Architecture Document, and Problem Statement.

## Phase 0: Data Pipeline & Foundation
**Goal**: Set up the project structure and generate 2,500 low-resolution photos with synthetic metadata.

*   **Project Setup**: Initialize Node.js + Express backend and React + Vite frontend. Install key dependencies (`sharp`, `zustand`, `@tanstack/react-virtual`, etc.).
*   **Scene Manifest**: Create `/scripts/scenes.json` with ~250 base scenes covering defined categories (Goa trip, Food, People, Everyday, Utility, Travel). Include specific demo targets (`target_cafe`, `target_medicine`).
*   **Procedural Mode**: Implement `npm run generate -- --procedural` using SVG templates to immediately build out the UI with dummy images.
*   **AI Image Generation**: Implement `npm run generate` using `GEMINI_IMAGE_MODEL` to generate base images, followed by variant creation via `sharp` (crop, flip, color shift) to reach exactly 2,500 photos.
*   **Utility Render**: Implement template-based rendering for utility photos (receipts, medicine strips) without AI.
*   **Seeding Metadata**: Implement `npm run seed` to generate Takeout-style JSON sidecars with clustered timestamps and geoData. Ensure the timeline covers the required 8-year span and includes the specific demo scenarios.

## Phase 1: Core App Shell & Photo Library UI
**Goal**: Build the Google Photos-style web interface using seeded metadata.

*   **App Shell**: Develop the Top App Bar (search bar, menu) and Left Navigation Drawer (collapsible). Implement light/dark theme toggles.
*   **Grid View (`/photos`)**: Use `justified-layout` and `@tanstack/react-virtual` to render a performant, virtualized grid grouped by date and location. Include lazy-loading for thumbnails and a right-edge date scrubber.
*   **Photo Viewer**: Implement a full-screen overlay (black background) for viewing photos. Add left/right navigation, top actions, and an Info side panel (showing date, location, AI caption, tags, and a "generated" badge).

## Phase 2: Indexing & Secondary Pages
**Goal**: Process photos to create the primary index, compute embeddings, and build explore/album views.

*   **Indexing Script (`npm run index`)**: Compile `/data/index.json` combining metadata and ground truth tags.
*   **Gemini Tagging (Optional)**: Implement tagging via Gemini (`--vision` flag) on 256px thumbnails to generate realistic tags.
*   **CLIP Embeddings**: Generate local CLIP embeddings (`/data/embeddings.bin`) for semantic search and similarity.
*   **Life Anchors & Faces**: Generate `/data/anchors.json` (trips, festivals) and optionally run `@vladmandic/face-api` for local face clustering on own photos.
*   **Secondary Views**: Implement `/explore`, Albums, Favourites, and Documents & Utilities pages based on the indexed data.

## Phase 3: Classic Search & Help Me Remember (Core)
**Goal**: Implement classic keyword search, struggle detection, and the guided recall mechanism.

*   **Classic Search**: Implement keyword search matching against captions, objects, places, etc., with a suggestion dropdown.
*   **Struggle Detection**: Detect when a user is struggling (e.g., scrolling past 60 results, 2+ reformulations in 3 mins) and show the "Help me remember" banner.
*   **Help Me Remember UI**: Build the recall panel with the active question, removable answer chips, and a live counter of remaining strong matches.
*   **Adaptive Question Engine**: Implement the Shannon entropy logic to dynamically select the next best question from the predefined bank (`Q_WHO`, `Q_TYPE`, etc.).
*   **Soft Scoring System**: Implement grid re-sorting based on soft scores rather than hard filtering.

## Phase 4: Recall Enhancements & Near-Miss
**Goal**: Complete the Help Me Remember flow with recognition checkpoints and contextual jumps.

*   **Recognition Checkpoint**: Trigger k-means clustering (k=4) on CLIP embeddings when candidates <= 120. Display 4 "look-alike" mosaic cards for the user to refine the search.
*   **Near-Miss Jump**: Add "It was around this moment" button in the viewer and grid hover to open a timeline strip of photos from the same day/event.
*   **Success Panel**: Implement the "This is it!" button and success summary panel showing time taken and narrowing metrics.

## Phase 5: Ask Photos (AI Search Mode)
**Goal**: Integrate the conversational AI search pipeline using Gemini and CLIP.

*   **Ask Toggle & Panel**: Implement the toggle switch inside the search bar. Build the conversational slide-down Ask Panel.
*   **Query Understanding**: Send natural language queries to Gemini (`GEMINI_CHAT_MODEL`) to extract structured JSON (intent, entities, time anchors).
*   **Candidate Retrieval & Re-ranking**: Use CLIP text embeddings against local `embeddings.bin` for candidate retrieval, followed by re-ranking the top 40 via Gemini.
*   **Inline Recall Chips**: Implement confidence checks; if results are broad, suggest "Help Me Remember" question chips directly inside the conversational flow.

## Phase 6: Telemetry, Metrics & Polish
**Goal**: Add logging, a metrics dashboard, and prepare for testing.

*   **Event Logging**: Record all critical interactions (queries, scrolls, recall starts, answers, successes) to `/data/events.jsonl`.
*   **Metrics Dashboard (`/metrics`)**: Create a view to analyze success rates, time-to-find, and compare A/B search modes.
*   **Testing Modes**: Implement the "A/B mode" toggle (hiding Help Me Remember) and the "Test task" mode (showing a target photo briefly for manual testing).
*   **Final Polish**: Update README with setup instructions, API key requirements, and demo script details. Ensure the app works completely offline without API keys in `--procedural` mode.
