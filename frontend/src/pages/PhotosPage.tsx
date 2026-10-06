import React, { useMemo, useEffect, useState } from 'react';
import layout from 'justified-layout';
import { useSearchStore } from '../store/searchStore';
import { CheckCircle, Clock, Search as SearchIcon, X } from 'lucide-react';

const OPTIONS = {
  "Who was there?": ["Just me", "2-3 people", "A group", "No one"],
  "What was in the photo?": ["People", "Food", "Place", "Object", "Screenshot", "Document", "Pet"],
  "Where were you?": ["Beach", "Restaurant/Cafe", "Home", "Street", "Nature", "Hotel", "Hospital/Clinic", "Temple"],
  "Indoors or outdoors?": ["Indoors", "Outdoors"],
  "Daylight or evening?": ["Daylight", "Evening/Night"],
  "Special occasion or an ordinary day?": ["Special occasion", "Ordinary day"]
};

const SPECIFIC_PHOTOS = [
  { id: 'img-cafe', url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800', width: 800, height: 600, tags: ["2-3 people", "Food", "Restaurant/Cafe", "Indoors", "Daylight", "Ordinary day"], description: "Coffee and croissants at a local cafe" },
  { id: 'img-medicine-2', url: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=800', width: 800, height: 600, tags: ["Just me", "Object", "Home", "Indoors", "Daylight"], description: "Medicine blister packs and tablets" },
  { id: 'img-hospital', url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800', width: 800, height: 700, tags: ["2-3 people", "People", "Hospital/Clinic", "Indoors", "Daylight", "Ordinary day"], description: "Doctor consultation at the hospital" },
  { id: 'img-hospital-bill', url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800', width: 800, height: 600, tags: ["No one", "Document", "Hospital/Clinic", "Indoors", "Daylight"], description: "Screenshot of hospital bills and receipts" },
  { id: 'img-document', url: 'https://picsum.photos/seed/document/800/600', width: 800, height: 600, tags: ["No one", "Document", "Home", "Indoors", "Daylight"], description: "Passport document page open" },
  { id: 'img-diwali', url: 'https://picsum.photos/seed/diwali-lights/800/600', width: 800, height: 600, tags: ["A group", "People", "Home", "Indoors", "Evening/Night", "Special occasion"], description: "Diwali celebration with lights" },
  { id: 'img-birthday', url: 'https://picsum.photos/seed/birthday-cake/800/600', width: 800, height: 600, tags: ["A group", "People", "Restaurant/Cafe", "Indoors", "Evening/Night", "Special occasion"], description: "Birthday cake with candles" },
];

const allCombinations: string[][] = [];
for (const who of OPTIONS["Who was there?"]) {
  for (const what of OPTIONS["What was in the photo?"]) {
    for (const where of OPTIONS["Where were you?"]) {
      for (const indoors of OPTIONS["Indoors or outdoors?"]) {
        for (const daylight of OPTIONS["Daylight or evening?"]) {
          for (const occasion of OPTIONS["Special occasion or an ordinary day?"]) {
            allCombinations.push([who, what, where, indoors, daylight, occasion]);
          }
        }
      }
    }
  }
}

// Add more photos to reach at least 5000 total
while (allCombinations.length < 1000) {
  allCombinations.push([
    OPTIONS["Who was there?"][Math.floor(Math.random() * OPTIONS["Who was there?"].length)],
    OPTIONS["What was in the photo?"][Math.floor(Math.random() * OPTIONS["What was in the photo?"].length)],
    OPTIONS["Where were you?"][Math.floor(Math.random() * OPTIONS["Where were you?"].length)],
    OPTIONS["Indoors or outdoors?"][Math.floor(Math.random() * OPTIONS["Indoors or outdoors?"].length)],
    OPTIONS["Daylight or evening?"][Math.floor(Math.random() * OPTIONS["Daylight or evening?"].length)],
    OPTIONS["Special occasion or an ordinary day?"][Math.floor(Math.random() * OPTIONS["Special occasion or an ordinary day?"].length)]
  ]);
}

const categoryToSeed: Record<string, string> = {
  "People": "portrait",
  "Food": "meal",
  "Place": "landscape",
  "Object": "item",
  "Screenshot": "screen",
  "Document": "paper",
  "Pet": "animal"
};

const GENERATED_PHOTOS = allCombinations.map((tags, i) => {
  const height = Math.floor(Math.random() * 400) + 400;
  return {
    id: `img-${i}`,
    url: `https://picsum.photos/seed/img-${i}/800/${height}`,
    width: 800,
    height,
    tags,
    description: tags.join(' ')
  };
});

const DUMMY_PHOTOS = [...SPECIFIC_PHOTOS, ...GENERATED_PHOTOS];

export const PhotosPage: React.FC = () => {
  const { 
    query, answeredQuestions, setScrollDepth, 
    setCandidatesCount, isSuccess, setSuccess, successStats,
    selectedPhotoId, setSelectedPhotoId,
    foundPhotoId, favouriteIds, toggleFavourite, albumPhotos, addToAlbum
  } = useSearchStore();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [realPhotos, setRealPhotos] = useState<any[]>([]);
  
  useEffect(() => {
    fetch('/api/photos')
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) {
          throw new Error('Data is not an array');
        }
        const loaded = data.map((d: any) => {
          const randomTags = [
            OPTIONS["Who was there?"][Math.floor(Math.random() * OPTIONS["Who was there?"].length)],
            OPTIONS["What was in the photo?"][Math.floor(Math.random() * OPTIONS["What was in the photo?"].length)],
            OPTIONS["Where were you?"][Math.floor(Math.random() * OPTIONS["Where were you?"].length)],
            OPTIONS["Indoors or outdoors?"][Math.floor(Math.random() * OPTIONS["Indoors or outdoors?"].length)],
            OPTIONS["Daylight or evening?"][Math.floor(Math.random() * OPTIONS["Daylight or evening?"].length)],
            OPTIONS["Special occasion or an ordinary day?"][Math.floor(Math.random() * OPTIONS["Special occasion or an ordinary day?"].length)]
          ];
          const height = 600;
          const seed = d.id ? d.id.replace('.jpg', '') : Math.random().toString();
          
          return {
            id: d.id,
            description: d.description || '',
            url: `https://picsum.photos/seed/${seed}/800/600`,
            width: 800,
            height: 600,
            tags: d.tags?.length ? [...d.tags, ...randomTags] : [d.category || 'Photo', ...randomTags]
          };
        });
        setRealPhotos([...SPECIFIC_PHOTOS, ...loaded]);
      })
      .catch((err) => {
        console.error("Failed to fetch photos, using dummy fallback:", err);
        setRealPhotos(DUMMY_PHOTOS);
      });
  }, []);

  const [containerWidth, setContainerWidth] = useState(typeof window !== 'undefined' ? Math.max(window.innerWidth - 250, 300) : 1000);

  useEffect(() => {
    const handleResize = () => setContainerWidth(Math.max(window.innerWidth - 250, 300));
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const filteredPhotos = useMemo(() => {
    let result = realPhotos;
    if (query) {
      result = result.filter(p => p.id.includes(query) || (p.description && p.description.toLowerCase().includes(query.toLowerCase())) || p.tags.some((t: string) => t.toLowerCase().includes(query.toLowerCase())));
    }
    const answers = Object.values(answeredQuestions);
    if (answers.length > 0) {
      result = result.filter(p => answers.every(a => p.tags.includes(a)));
    }
    return result;
  }, [query, answeredQuestions, realPhotos]);

  const displayedPhotos = useMemo(() => filteredPhotos.slice(0, 100), [filteredPhotos]);

  useEffect(() => {
    setCandidatesCount(filteredPhotos.length);
  }, [filteredPhotos.length, setCandidatesCount]);

  const geometry = useMemo(() => {
    const inputSizes = displayedPhotos.map(p => ({ width: p.width, height: p.height }));
    return layout(inputSizes, {
      containerWidth: containerWidth - 40, // 20px padding on each side
      targetRowHeight: 250,
      boxSpacing: 8,
    });
  }, [containerWidth, displayedPhotos]);

  useEffect(() => {
    const handleScroll = () => {
      // Mock scroll depth calculation
      const depth = Math.floor(window.scrollY / 100);
      setScrollDepth(depth);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setScrollDepth]);

  const selectedPhoto = selectedPhotoId ? filteredPhotos.find(p => p.id === selectedPhotoId) : null;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Photos</h2>
      
      {/* Phase 4: Success Panel */}
      {isSuccess && successStats && (
        <div style={{ background: 'var(--bg-active)', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <CheckCircle size={48} color="var(--accent-blue)" />
          <div>
            <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-primary)' }}>You found it!</h3>
            <div style={{ display: 'flex', gap: '15px', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Clock size={16}/> {successStats.timeSeconds} seconds</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><SearchIcon size={16}/> {successStats.queries} searches</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><CheckCircle size={16}/> {successStats.answers} answers</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button 
                onClick={() => foundPhotoId && addToAlbum('Saved', foundPhotoId)}
                style={{ background: foundPhotoId && albumPhotos['Saved']?.includes(foundPhotoId) ? 'var(--accent-blue)' : 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: foundPhotoId && albumPhotos['Saved']?.includes(foundPhotoId) ? 'white' : 'var(--text-primary)', padding: '6px 12px', borderRadius: '16px', cursor: 'pointer', fontSize: '14px' }}
              >
                {foundPhotoId && albumPhotos['Saved']?.includes(foundPhotoId) ? 'Added to album' : 'Add to album'}
              </button>
              <button 
                onClick={() => foundPhotoId && toggleFavourite(foundPhotoId)}
                style={{ background: foundPhotoId && favouriteIds.includes(foundPhotoId) ? 'var(--accent-blue)' : 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: foundPhotoId && favouriteIds.includes(foundPhotoId) ? 'white' : 'var(--text-primary)', padding: '6px 12px', borderRadius: '16px', cursor: 'pointer', fontSize: '14px' }}
              >
                {foundPhotoId && favouriteIds.includes(foundPhotoId) ? 'Favourited' : 'Favourite'}
              </button>
            </div>
          </div>
          <button onClick={() => setSuccess(false)} style={{ marginLeft: 'auto', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', alignSelf: 'flex-start' }}>
            Dismiss
          </button>
        </div>
      )}

      {/* Phase 4: Recognition Checkpoint Mockup */}
      {!isSuccess && filteredPhotos.length <= 100 && filteredPhotos.length > 0 && (Object.keys(answeredQuestions).length > 0 || query) && (
        <div style={{ marginBottom: '20px', padding: '15px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
          <h4 style={{ margin: '0 0 15px 0', color: 'var(--text-primary)' }}>Closer to one of these?</h4>
          <div style={{ display: 'flex', gap: '10px' }}>
             {(() => {
               const answerValues = Object.values(answeredQuestions);
               const tagCounts: Record<string, number> = {};
               filteredPhotos.forEach(p => {
                 p.tags.forEach((t: string) => {
                   if (!answerValues.includes(t)) {
                     tagCounts[t] = (tagCounts[t] || 0) + 1;
                   }
                 });
               });
               const clusterNames = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]).slice(0, 4);
               
               // Fallback if not enough tags (very rare, but possible if highly filtered)
               // If there are exactly 0, it means all tags are answered.
               
               return clusterNames.map((groupName, i) => {
                 const groupPhotos = filteredPhotos.filter(p => p.tags.includes(groupName)).slice(0, 4);
                 return (
                   <div key={i} onClick={() => useSearchStore.getState().setQuery(groupName)} style={{ flex: 1, height: '140px', backgroundColor: 'var(--bg-active)', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', border: '1px solid var(--border-color)', position: 'relative' }}>
                     <div style={{ display: 'grid', gridTemplateColumns: groupPhotos.length > 1 ? '1fr 1fr' : '1fr', gridTemplateRows: groupPhotos.length > 2 ? '1fr 1fr' : '1fr', height: '100%', width: '100%', gap: '2px', backgroundColor: 'var(--bg-primary)' }}>
                       {groupPhotos.map((gp, j) => (
                         <img key={j} src={gp.url} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} alt={groupName} />
                       ))}
                     </div>
                     <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white', fontWeight: 'bold', textShadow: '0 2px 5px rgba(0,0,0,0.9)', padding: '10px', textAlign: 'center', fontSize: '15px' }}>
                       {groupName}
                     </div>
                   </div>
                 );
               });
             })()}
          </div>
        </div>
      )}

      <div style={{ position: 'relative', height: geometry.containerHeight, marginTop: '20px' }}>
        {geometry.boxes.map((box: any, i: number) => {
          const photo = displayedPhotos[i];
          const isHovered = hoveredId === photo.id;
          return (
            <div
              key={photo.id}
              onMouseEnter={() => setHoveredId(photo.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                position: 'absolute',
                top: box.top,
                left: box.left,
                width: box.width,
                height: box.height,
                backgroundColor: `hsl(${(i * 137) % 360}, 70%, 85%)`,
                borderRadius: '8px',
                overflow: 'hidden',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(0,0,0,0.5)',
                fontWeight: 'bold',
                flexDirection: 'column'
              }}
              onClick={() => setSelectedPhotoId(photo.id)}
            >
              <span style={{ position: 'absolute', zIndex: 1, padding: '10px', textAlign: 'center', pointerEvents: 'none' }}>
                {photo.tags.slice(0, 2).join(', ')}
              </span>
              <img
                src={photo.url}
                alt={`Photo ${photo.id}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'relative', zIndex: 2 }}
                loading="lazy"
                onError={(e) => { 
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://placehold.co/800x600/EAEAEA/333333?text=Unavailable';
                }}
              />
              {/* Phase 4: Near-Miss Jump & Success Actions on hover */}
              {isHovered && (
                <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                  <button onClick={(e) => { e.stopPropagation(); setSuccess(true, photo.id); }} style={{ background: 'var(--accent-blue)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontWeight: 500 }}>
                    This is it!
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); useSearchStore.getState().setQuery(photo.tags.find((t: string) => OPTIONS["Daylight or evening?"].includes(t) || OPTIONS["Indoors or outdoors?"].includes(t)) || ''); }} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid white', padding: '6px 12px', borderRadius: '16px', cursor: 'pointer', fontSize: '12px' }}>
                    It was around this moment
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); useSearchStore.getState().setQuery(photo.tags[1] || photo.tags[0]); }} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid white', padding: '6px 12px', borderRadius: '16px', cursor: 'pointer', fontSize: '12px' }}>
                    More like this
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Phase 1 & 4: Photo Viewer Overlay with Near-Miss Jump */}
      {selectedPhoto && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => setSelectedPhotoId(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
              <X size={32} />
            </button>
          </div>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
             <img src={selectedPhoto.url} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} alt="Selected" />
          </div>
          <div style={{ padding: '20px', display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
             <button onClick={() => { setSuccess(true, selectedPhoto.id); setSelectedPhotoId(null); }} style={{ background: 'var(--accent-blue)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '24px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
               This is it!
             </button>
             <button onClick={() => { useSearchStore.getState().setQuery(selectedPhoto.tags.find((t: string) => OPTIONS["Daylight or evening?"].includes(t) || OPTIONS["Indoors or outdoors?"].includes(t)) || ''); setSelectedPhotoId(null); }} style={{ background: 'transparent', color: 'white', border: '1px solid white', padding: '12px 24px', borderRadius: '24px', cursor: 'pointer', fontSize: '16px' }}>
               It was around this moment
             </button>
             <button onClick={() => { useSearchStore.getState().setQuery(selectedPhoto.tags[1] || selectedPhoto.tags[0]); setSelectedPhotoId(null); }} style={{ background: 'transparent', color: 'white', border: '1px solid white', padding: '12px 24px', borderRadius: '24px', cursor: 'pointer', fontSize: '16px' }}>
               More like this
             </button>
          </div>
        </div>
      )}
    </div>
  );
};
