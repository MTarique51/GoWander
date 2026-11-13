import { useEffect, useState } from 'react';
import api from '../lib/api';
import ListingCard from '../components/ListingCard';
export default function Favorites() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    api
      .get('/favorites')
      .then(({ data }) => setItems(data.items.map((x) => x.listing)))
      .catch(() => {});
  }, []);
  return (
    <div className="container-app py-12">
      <p className="eyebrow">Saved for later</p>
      <h1 className="mt-2 text-4xl font-extrabold">Your favorites</h1>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((x) => (
          <ListingCard
            key={x._id}
            listing={x}
            favoriteIds={items.map((i) => i._id)}
            onFavorite={(id) => setItems((old) => old.filter((x) => x._id !== id))}
          />
        ))}
      </div>
      {!items.length && (
        <div className="card mt-8 p-10 text-center text-slate-500">Your wishlist is empty.</div>
      )}
    </div>
  );
}
