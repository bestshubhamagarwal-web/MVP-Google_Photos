import React, { useEffect, useState } from 'react';
import { useSearchStore } from '../store/searchStore';

export const AlbumsPage: React.FC = () => {
  const { albumPhotos } = useSearchStore();
  const [allPhotos, setAllPhotos] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/photos')
      .then(r => r.json())
      .then(data => {
        setAllPhotos(data);
      })
      .catch(console.error);
  }, []);

  const getPhotoUrl = (id: string) => {
    return `https://picsum.photos/seed/${id.replace('.jpg', '')}/400/400`;
  };

  return (
    <div style={{ padding: '20px', color: 'var(--text-primary)' }}>
      <h2>Albums</h2>
      {Object.keys(albumPhotos).length === 0 ? (
        <p>No albums yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {Object.entries(albumPhotos).map(([albumName, photoIds]) => (
            <div key={albumName}>
              <h3>{albumName}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', marginTop: '10px' }}>
                {photoIds.map(id => (
                  <div key={id} style={{ borderRadius: '8px', overflow: 'hidden', height: '150px', background: 'var(--bg-secondary)' }}>
                    <img src={getPhotoUrl(id)} alt={id} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
