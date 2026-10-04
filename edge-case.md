# Edge Cases and Corner Scenarios: Recall Photos MVP

This document outlines potential edge cases, failure modes, and corner scenarios for the "Recall Photos" MVP, derived from the `Architecture.md` and `implementation-plan.md`.

## 1. Data Pipeline & Foundation (Phase 0)

*   **API Rate Limits / Quotas:** The Gemini image generation (`GEMINI_IMAGE_MODEL`) might hit rate limits before creating all 2,500 base images.
    *   *Mitigation:* Implement exponential backoff, retry logic, and chunking in the generation script. The `--procedural` flag serves as an ultimate fallback.
*   **Duplicate/Invalid Metadata:** The `seed` script might generate photos with overlapping EXACT timestamps, breaking strict chronological sorts, or produce invalid GPS coordinates (e.g., out of bounds).
    *   *Mitigation:* Ensure strict bounds checking for coordinates and add jitter to generated timestamps.
*   **Asset Corruption/Failure:** Variant creation via `sharp` might fail on certain generated images due to incomplete downloads or corrupt image formats.

## 2. Core App Shell & Photo Library UI (Phase 1)

*   **Viewport Resizing & Virtualization:** Drastic resizing of the browser window might break the `justified-layout` or `@tanstack/react-virtual` calculations, leaving blank spaces or misaligned grids.
*   **Extreme Aspect Ratios:** Utility renders (e.g., long receipts) or cropped images might result in extreme aspect ratios, disrupting the grid flow.
    *   *Mitigation:* Enforce maximum/minimum aspect ratio constraints within the grid layout.
*   **Rapid Scrolling / Lazy Loading:** Very fast scrolling through the 2,500-item grid might overwhelm the lazy-loading queue, causing thumbnail flickering or excessive memory usage.

## 3. Indexing & Secondary Pages (Phase 2)

*   **CLIP Embedding Out-Of-Memory (OOM):** Running local `@xenova/transformers` for CLIP embeddings on 2,500 images simultaneously might crash the Node.js process.
    *   *Mitigation:* Process embeddings in small batches (e.g., batch size of 10-50).
*   **Missing Tags/Metadata:** If Gemini tagging fails for some photos, those photos might have sparse metadata (`index.json`), reducing searchability.

## 4. Search & Help Me Remember (Phase 3 & 4)

*   **Zero Candidates or Over-filtering:** The user answers "Help Me Remember" questions in a contradictory way (e.g., "It was in winter" + "I was at the beach in Goa"), reducing candidate count to zero.
    *   *Mitigation:* Soft scoring instead of hard filtering. Ensure the count never drops to absolute zero without providing a "backtrack" or "relax constraints" option.
*   **Uniformity in Candidates (Entropy Failure):** The Shannon entropy logic might find that all remaining candidates share the same attributes, leaving no useful questions to ask.
    *   *Mitigation:* Fall back to visual clustering (Checkpoints) early if entropy is too low, or offer to jump to the timeline.
*   **K-Means Clustering Failure:** If candidates <= 120 trigger the checkpoint, but the images are too visually similar (e.g., 100 photos of the exact same document), K-Means (k=4) might produce redundant or identical mosaic cards.

## 5. Ask Photos (Phase 5)

*   **Query Understanding Hallucination:** Gemini (`GEMINI_CHAT_MODEL`) might incorrectly extract intent, hallucinate entities not in the query, or misinterpret time anchors (e.g., "last summer" mapped to the wrong year).
*   **Timeout on Candidate Retrieval:** Retrieving and comparing CLIP text embeddings against the local `embeddings.bin` plus re-ranking the top 40 via Gemini could exceed typical UI timeout thresholds (e.g., >5 seconds).
    *   *Mitigation:* Stream the response, provide progressive loading states, or cap the re-ranking candidate pool if latency is too high.
*   **False Positive Struggle Detection:** The "Help me remember" banner might trigger prematurely if a user is just idly scrolling or exploring, annoying them.

## 6. Offline / Procedural Mode Limitations

*   **Missing API Keys in Standard Run:** Running standard search or Ask Photos without an internet connection or without valid API keys.
    *   *Mitigation:* The app should gracefully degrade, showing explicit "Offline Mode" warnings and falling back to basic regex/keyword search on local metadata.
