import Property from '../models/property.model.js';
import Favorite from '../models/favourites.model.js';
import mongoose from 'mongoose';

// Helper to resolve user id from different shapes
const resolveUserId = (user) => {
  if (!user) return null;
  return user._id || user.id || user.userId || null;
};

// Create new property
export const createProperty = async (req, res) => {
  try {
    console.log('Create Property Request:', req.body);
    console.log('User:', req.user);
    
    // Always set postedBy from authenticated user for security
    const authUserId = resolveUserId(req.user);
    console.log('Auth User ID:', authUserId);
    
    if (!authUserId) {
      return res.status(401).json({ message: 'Authentication required to create property' });
    }

    const payload = { ...req.body };
    // Ignore any client-provided ownerId - always use authenticated user
    delete payload.ownerId;
    payload.postedBy = authUserId;

    console.log('Final payload:', payload);

    const property = new Property(payload);
    await property.save();
    console.log('Property saved:', property._id);
    
    const populated = await Property.findById(property._id).populate('postedBy', 'name email');
    res.status(201).json(populated);
  } catch (error) {
    console.error('Create Property Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all properties
export const getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find().populate('postedBy', 'name email');
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single property by ID
export const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.status(200).json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get properties by postedBy user ID
export const getPropertiesByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const properties = await Property.find({ postedBy: userId }).populate('postedBy', 'name email');
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update property
export const updateProperty = async (req, res) => {
  try {
    const authUserId = resolveUserId(req.user);
    if (!authUserId) {
      return res.status(401).json({ message: 'Authentication required to update property' });
    }

    // Check ownership before allowing update
    const existing = await Property.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Property not found' });

    if (String(existing.postedBy) !== String(authUserId)) {
      return res.status(403).json({ message: 'Forbidden: you are not the owner of this property' });
    }

    const payload = { ...req.body };
    // Ignore client-provided ownerId - don't allow changing owner
    delete payload.ownerId;
    delete payload.postedBy;
    payload.updatedAt = new Date();

    const updated = await Property.findByIdAndUpdate(req.params.id, payload, { new: true });
    const populated = await Property.findById(updated._id).populate('postedBy', 'name email');
    res.status(200).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete property
export const deleteProperty = async (req, res) => {
  try {
    const authUserId = resolveUserId(req.user);
    if (!authUserId) {
      return res.status(401).json({ message: 'Authentication required to delete property' });
    }

    const existing = await Property.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Property not found' });

    if (String(existing.postedBy) !== String(authUserId)) {
      return res.status(403).json({ message: 'Forbidden: you are not the owner of this property' });
    }

    await Property.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users who favourited a property
export const getUsersWhoFavourited = async (req, res) => {
  try {
    const { propertyId } = req.params;
    // Find all Favorite docs where properties array contains propertyId
    const favs = await Favorite.find({ properties: mongoose.Types.ObjectId.createFromHexString(propertyId) }).populate('seeker', 'name email');
    // Map to seekers (users)
    const users = favs.map(fav => fav.seeker);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search properties by location (city, state, zip)
export const searchPropertiesByLocation = async (req, res) => {
  try {
    const { city, state, zip } = req.query;
    const query = {};
    if (city) {
      query["address.city"] = { $regex: city, $options: "i" };
    }
    if (state) {
      query["address.state"] = { $regex: state, $options: "i" };
    }
    if (zip) {
      query["address.zip"] = zip;
    }
    const properties = await Property.find(query).populate('postedBy', 'name email');
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search properties by proximity (nearby search)
export const searchPropertiesNearby = async (req, res) => {
  try {
    const { lat, lng, distance } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude (lat) and longitude (lng) are required.' });
    }
    const maxDistance = distance ? parseInt(distance) : 10000; // default 5km
    const properties = await Property.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: maxDistance
        }
      }
    }).populate('postedBy', 'name email');
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};