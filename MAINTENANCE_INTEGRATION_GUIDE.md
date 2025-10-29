# Maintenance Management - Frontend Integration Guide

## Overview
This guide explains how to integrate the Maintenance Management backend with your LandlordMaintenance.jsx component.

## Files Created

### Backend Files:
1. **`backend/src/models/maintenance.model.js`** - MongoDB schema for maintenance requests
2. **`backend/src/controllers/maintenance.controller.js`** - Business logic for all operations
3. **`backend/src/routes/maintenance.routes.js`** - API route definitions
4. **`backend/src/app.js`** - Updated to include maintenance routes

### Frontend Files:
1. **`frontend/UI/src/services/api.js`** - Updated with maintenance API methods

## Quick Start

### 1. Start Your Backend Server
Make sure your MongoDB is running and start the backend:
```bash
cd backend
npm install
npm start
```

### 2. Update Your Frontend Component

Replace the mock data in `LandlordMaintenance.jsx` with API calls:

```javascript
import { useState, useEffect } from 'react';
import api from '../../../services/api';

const LandlordMaintenance = () => {
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({});
  
  // Get landlordId from your auth context or localStorage
  const landlordId = localStorage.getItem('userId'); // Adjust based on your auth implementation

  // Fetch maintenance requests on component mount
  useEffect(() => {
    fetchMaintenanceRequests();
    fetchStats();
  }, []);

  const fetchMaintenanceRequests = async (filters = {}) => {
    try {
      setIsLoading(true);
      const response = await api.getLandlordMaintenanceRequests(landlordId, filters);
      
      if (response.success) {
        setMaintenanceRequests(response.data);
      }
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
      // Show error notification
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.getMaintenanceStats(landlordId);
      
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      const response = await api.updateMaintenanceStatus(requestId, newStatus);
      
      if (response.success) {
        // Refresh the list
        fetchMaintenanceRequests();
        
        // Show success notification
        addNotification({
          type: 'success',
          title: 'Status Updated',
          message: `Request status changed to ${newStatus}`
        });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update status'
      });
    }
  };

  const handleAddComment = async (requestId, commentData) => {
    try {
      const response = await api.addMaintenanceComment(requestId, {
        author: 'Landlord', // Get from auth context
        authorId: landlordId,
        text: commentData.text,
        attachments: commentData.attachments || []
      });
      
      if (response.success) {
        // Refresh the list or update the specific request
        fetchMaintenanceRequests();
        
        addNotification({
          type: 'success',
          title: 'Comment Added',
          message: 'Your comment has been added successfully'
        });
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to add comment'
      });
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (window.confirm('Are you sure you want to delete this maintenance request?')) {
      try {
        const response = await api.deleteMaintenanceRequest(requestId);
        
        if (response.success) {
          // Refresh the list
          fetchMaintenanceRequests();
          
          addNotification({
            type: 'success',
            title: 'Request Deleted',
            message: 'Maintenance request has been successfully deleted'
          });
        }
      } catch (error) {
        console.error('Error deleting request:', error);
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to delete request'
        });
      }
    }
  };

  // Rest of your component code...
};
```

## API Methods Available

### Fetch Data
```javascript
// Get all maintenance requests for landlord
api.getLandlordMaintenanceRequests(landlordId, {
  status: 'In Progress',
  priority: 'High',
  property: 'propertyId',
  sortBy: 'createdAt',
  sortOrder: 'desc'
});

// Get single maintenance request
api.getMaintenanceRequestById(requestId);

// Get statistics
api.getMaintenanceStats(landlordId);

// Get requests by property
api.getMaintenanceByProperty(propertyId);
```

### Create & Update
```javascript
// Create new maintenance request
api.createMaintenanceRequest({
  title: 'Kitchen Faucet Leak',
  description: 'The faucet is leaking',
  property: 'propertyId',
  tenant: 'tenantId',
  landlord: 'landlordId',
  priority: 'High',
  category: 'plumbing',
  isEmergency: false,
  isUrgent: true
});

// Update maintenance request
api.updateMaintenanceRequest(requestId, {
  status: 'In Progress',
  progress: 50,
  estimatedCost: 150
});

// Update status only
api.updateMaintenanceStatus(requestId, 'Completed');

// Assign technician
api.assignTechnician(requestId, {
  assignedTo: 'AquaFix Plumbing',
  assignedToContact: {
    phone: '555-0123',
    email: 'service@aquafix.com'
  }
});

// Add comment
api.addMaintenanceComment(requestId, {
  author: 'Landlord',
  authorId: 'landlordId',
  text: 'The plumber will arrive tomorrow',
  attachments: []
});
```

### Delete
```javascript
// Delete maintenance request
api.deleteMaintenanceRequest(requestId);
```

## Filtering & Sorting

You can filter and sort maintenance requests using query parameters:

```javascript
const filters = {
  status: 'In Progress',      // Pending, In Progress, On Hold, Completed, Cancelled, All
  priority: 'High',            // Low, Medium, High, All
  property: 'propertyId',      // Specific property ID or All
  sortBy: 'createdAt',         // createdAt, updatedAt, priority, status, property
  sortOrder: 'desc'            // asc or desc
};

api.getLandlordMaintenanceRequests(landlordId, filters);
```

## Response Format

All API responses follow this format:

**Success:**
```javascript
{
  success: true,
  message: 'Operation successful', // Optional
  data: { ... },                  // Response data
  count: 10                       // For list endpoints
}
```

**Error:**
```javascript
{
  success: false,
  message: 'Error message',
  error: 'Detailed error'
}
```

## Sample Data Structure

### Maintenance Request Object
```javascript
{
  _id: '64f5a8b9c3d4e2f1a8b9c3d4',
  title: 'Kitchen Faucet Leak',
  description: 'The kitchen faucet has been dripping constantly',
  property: {
    _id: 'propertyId',
    title: 'Modern Downtown Loft #101',
    address: { ... }
  },
  propertyName: 'Modern Downtown Loft #101',
  tenant: {
    _id: 'tenantId',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '555-0100'
  },
  tenantName: 'John Doe',
  landlord: 'landlordId',
  status: 'In Progress',
  priority: 'High',
  category: 'plumbing',
  progress: 65,
  assignedTo: 'AquaFix Plumbing Services',
  assignedToContact: {
    phone: '555-0123',
    email: 'service@aquafix.com'
  },
  estimatedCost: 150,
  actualCost: 0,
  isEmergency: false,
  isUrgent: true,
  attachments: [
    {
      id: '1',
      name: 'leak_photo.jpg',
      type: 'image',
      size: '2.3 MB',
      url: '/uploads/leak_photo.jpg'
    }
  ],
  comments: [
    {
      author: 'Landlord',
      authorId: 'landlordId',
      text: 'Plumber contacted, will arrive tomorrow',
      timestamp: '2025-08-01T15:30:00Z',
      attachments: []
    }
  ],
  history: [
    {
      type: 'created',
      description: 'Request created by John Doe',
      timestamp: '2025-08-01T10:30:00Z'
    },
    {
      type: 'assignment',
      description: 'Assigned to AquaFix Plumbing Services',
      timestamp: '2025-08-01T15:00:00Z'
    }
  ],
  createdAt: '2025-08-01T10:30:00Z',
  updatedAt: '2025-08-02T14:20:00Z'
}
```

## Testing the API

You can test the API using tools like Postman or curl:

### Create a Maintenance Request
```bash
curl -X POST http://localhost:8000/api/maintenance \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Leak",
    "description": "Testing the API",
    "property": "propertyId",
    "tenant": "tenantId",
    "landlord": "landlordId",
    "priority": "High",
    "category": "plumbing"
  }'
```

### Get Landlord's Requests
```bash
curl -X GET "http://localhost:8000/api/maintenance/landlord/landlordId?status=In Progress"
```

### Update Status
```bash
curl -X PATCH http://localhost:8000/api/maintenance/requestId/status \
  -H "Content-Type: application/json" \
  -d '{"status": "Completed"}'
```

## Environment Variables

Make sure your `.env` file in the backend has:
```env
MONGODB_URI=mongodb://localhost:27017/ghar_nishchit
PORT=8000
FRONTEND_URL=http://localhost:5173
```

## Next Steps

1. **Remove Mock Data**: Remove the `useLocalStorage` hook and mock data from your component
2. **Add Loading States**: Show loading spinners while fetching data
3. **Error Handling**: Add proper error handling and user notifications
4. **Authentication**: Ensure all API calls include authentication tokens
5. **File Upload**: Implement file upload for attachments (you may need multer or similar)
6. **Real-time Updates**: Consider adding WebSocket for real-time updates

## Common Issues & Solutions

### CORS Issues
If you get CORS errors, make sure your backend `app.js` has the correct CORS configuration:
```javascript
app.use(cors({
  origin: ["http://localhost:5173"],
  credentials: true
}));
```

### 404 Errors
Ensure:
- MongoDB is running
- Backend server is running on port 8000
- Frontend is configured to use `http://localhost:8000/api`

### Data Not Showing
- Check browser console for errors
- Verify API responses in Network tab
- Ensure you're using the correct user IDs

## Support

For detailed API documentation, see `MAINTENANCE_API_DOCUMENTATION.md`
