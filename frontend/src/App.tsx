import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { PhotosPage } from './pages/PhotosPage';
import { ExplorePage } from './pages/ExplorePage';
import { AlbumsPage } from './pages/AlbumsPage';
import { FavouritesPage } from './pages/FavouritesPage';
import { UtilitiesPage } from './pages/UtilitiesPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Navigate to="/photos" replace />} />
          <Route path="photos" element={<PhotosPage />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="albums" element={<AlbumsPage />} />
          <Route path="favourites" element={<FavouritesPage />} />
          <Route path="utilities" element={<UtilitiesPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
