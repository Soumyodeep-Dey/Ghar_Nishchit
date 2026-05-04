import Favorite from '../models/favourites.model.js';
import Property from '../models/property.model.js';
import { query as neonQuery } from '../db/neon.js';

// ── NeonDB Sync Helpers ──────────────────────────────────────────────────────
const addFavToNeon = async (seekerId, propertyId) => {
  try {
    await neonQuery(
      `INSERT INTO favorites (seeker_id, property_id)
       VALUES ($1, $2)
       ON CONFLICT (seeker_id, property_id) DO NOTHING`,
      [seekerId.toString(), propertyId.toString()]
    );
  } catch (e) {
    console.warn('[NeonDB] favorite add warning:', e.message);
  }
};

const removeFavFromNeon = async (seekerId, propertyId) => {
  try {
    await neonQuery(
      `DELETE FROM favorites WHERE seeker_id = $1 AND property_id = $2`,
      [seekerId.toString(), propertyId.toString()]
    );
  } catch (e) {
    console.warn('[NeonDB] favorite remove warning:', e.message);
  }
};

// Get all favourites for the logged-in user
export const getFavourites = async (req, res) => {
  try {
    const fav = await Favorite.findOne({ seeker: req.user.userId }).populate('properties');
    res.status(200).json(fav ? fav.properties : []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a property to favourites
export const addFavourite = async (req, res) => {
  try {
    const { propertyId } = req.body;
    if (!propertyId) return res.status(400).json({ message: 'Property ID required' });
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    let fav = await Favorite.findOne({ seeker: req.user.userId });
    if (!fav) {
      fav = new Favorite({ seeker: req.user.userId, properties: [propertyId] });
    } else {
      if (fav.properties.includes(propertyId)) {
        return res.status(409).json({ message: 'Property already in favourites' });
      }
      fav.properties.push(propertyId);
    }
    await fav.save();

    // Dual-write to NeonDB
    await addFavToNeon(req.user.userId, propertyId);

    res.status(201).json({ message: 'Added to favourites', favourites: fav.properties });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove a property from favourites
export const removeFavourite = async (req, res) => {
  try {
    const { propertyId } = req.body;
    if (!propertyId) return res.status(400).json({ message: 'Property ID required' });
    const fav = await Favorite.findOne({ seeker: req.user.userId });
    if (!fav) return res.status(404).json({ message: 'No favourites found' });
    const initialLength = fav.properties.length;
    fav.properties = fav.properties.filter(
      (id) => id.toString() !== propertyId
    );
    if (fav.properties.length === initialLength) {
      return res.status(404).json({ message: 'Property not found in favourites' });
    }
    await fav.save();

    // Dual-write to NeonDB
    await removeFavFromNeon(req.user.userId, propertyId);

    res.status(200).json({ message: 'Removed from favourites', favourites: fav.properties });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Check if a property is favourited by the user
export const isFavourited = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const fav = await Favorite.findOne({ seeker: req.user.userId });
    const isFav = fav && fav.properties.some(
      (id) => id.toString() === propertyId
    );
    res.status(200).json({ favourited: !!isFav });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 