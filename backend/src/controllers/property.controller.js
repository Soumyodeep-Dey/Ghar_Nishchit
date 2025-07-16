import Property from '../models/property.model.js';
import Favorite from '../models/favourites.model.js';
import mongoose from 'mongoose';

// Create new property
export const createProperty = async (req, res) => {
  try {
    const property = new Property(req.body);
    await property.save();
    res.status(201).json(property);
  } catch (error) {
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

// Update property
export const updateProperty = async (req, res) => {
  try {
    const updated = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete property
export const deleteProperty = async (req, res) => {
  try {
    await Property.findByIdAndDelete(req.params.id);
    res.status(204).send();
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