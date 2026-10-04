import React, { useEffect, useState } from 'react';
import { useSearchStore } from '../store/searchStore';

export const FavouritesPage: React.FC = () => {
  const { favouriteIds } = useSearchStore();
  const [photos, setPhotos] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/photos')
      .then(r => r.json())
      .then(data => {
        const favs = data.filter((d: any) => favouriteIds.includes(d.id));
        setPhotos(favs);
      })
      .catch(console.error);
  }, [favouriteIds]);

  return (
    <div style={{ padding: '20px', color: 'var(--text-primary)' }}>
      <h2>Favourites</h2>
      {photos.length === 0 ? (
        <p>No favourites yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
          {photos.map(p => (
            <div key={p.id} style={{ borderRadius: '8px', overflow: 'hidden', height: '200px', background: 'var(--bg-secondary)' }}>
              <img src={`https://picsum.photos/seed/${p.id.replace('.jpg', '')}/400/400`} alt={p.description || p.id} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
