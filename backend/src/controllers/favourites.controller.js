import Favorite from '../models/favourites.model.js';
import Property from '../models/property.model.js';

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
    fav.properties = fav.properties.filter(
      (id) => id.toString() !== propertyId
    );
    await fav.save();
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