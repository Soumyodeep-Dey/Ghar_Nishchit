# Maintenance Management System - Complete Backend Implementation

## Overview
A complete backend implementation for the Maintenance Management system with MongoDB database, Express API, and frontend integration.

## 📁 Files Created/Modified

### Backend Files

#### 1. **Model** - `backend/src/models/maintenance.model.js`
- Complete MongoDB schema for maintenance requests
- Sub-schemas for comments, history, and attachments
- Automatic progress calculation based on status
- Indexes for optimized queries

**Features:**
- Status tracking (Pending, In Progress, On Hold, Completed, Cancelled)
- Priority levels (Low, Medium, High)
- Categories (plumbing, electrical, hvac, appliance, structural, security, general)
- Comments with attachments
- Complete history tracking
- Technician assignment
- Cost tracking (estimated and actual)
- Emergency and urgent flags

---

#### 2. **Controller** - `backend/src/controllers/maintenance.controller.js`
Complete business logic with 11 functions:

| Function | Description |
|----------|-------------|
| `createMaintenanceRequest` | Create new maintenance request |
| `getLandlordMaintenanceRequests` | Get all requests for landlord with filters |
| `getTenantMaintenanceRequests` | Get all requests for tenant |
| `getMaintenanceRequestById` | Get single request details |
| `updateMaintenanceRequest` | Update request (full update) |
| `updateStatus` | Update status only |
| `addComment` | Add comment to request |
| `assignTechnician` | Assign service provider |
| `deleteMaintenanceRequest` | Delete request |
| `getMaintenanceStats` | Get statistics for dashboard |
| `getMaintenanceByProperty` | Get requests by property |

**Features:**
- Advanced filtering (status, priority, property)
- Sorting (any field, asc/desc)
- Automatic history tracking
- Population of related data (property, tenant, landlord)
- Error handling with proper status codes
- Statistics calculation

---

#### 3. **Routes** - `backend/src/routes/maintenance.routes.js`
RESTful API endpoints:

```
POST   /api/maintenance                           - Create request
GET    /api/maintenance/landlord/:landlordId      - Get landlord's requests
GET    /api/maintenance/tenant/:tenantId          - Get tenant's requests
GET    /api/maintenance/stats/:landlordId         - Get statistics
GET    /api/maintenance/property/:propertyId      - Get by property
GET    /api/maintenance/:id                       - Get single request
PUT    /api/maintenance/:id                       - Update request
PATCH  /api/maintenance/:id/status                - Update status
POST   /api/maintenance/:id/comment               - Add comment
PATCH  /api/maintenance/:id/assign                - Assign technician
DELETE /api/maintenance/:id                       - Delete request
```

---

#### 4. **App Configuration** - `backend/src/app.js` (Modified)
- Added maintenance routes to the Express app
- Route: `/api/maintenance`

---

### Frontend Files

#### 5. **API Service** - `frontend/UI/src/services/api.js` (Modified)
Added 11 new methods for maintenance management:

```javascript
// Create
api.createMaintenanceRequest(data)

// Read
api.getLandlordMaintenanceRequests(landlordId, filters)
api.getTenantMaintenanceRequests(tenantId, filters)
api.getMaintenanceRequestById(id)
api.getMaintenanceByProperty(propertyId)
api.getMaintenanceStats(landlordId)

// Update
api.updateMaintenanceRequest(id, data)
api.updateMaintenanceStatus(id, status)
api.assignTechnician(id, assignmentData)
api.addMaintenanceComment(id, comment)

// Delete
api.deleteMaintenanceRequest(id)
```

---

### Documentation Files

#### 6. **API Documentation** - `backend/MAINTENANCE_API_DOCUMENTATION.md`
- Complete API reference with examples
- Request/response formats
- Error handling
- Frontend integration examples
- Status codes and error messages

#### 7. **Integration Guide** - `frontend/MAINTENANCE_INTEGRATION_GUIDE.md`
- Step-by-step integration guide
- Code examples for React components
- Filtering and sorting examples
- Testing instructions
- Troubleshooting guide

---

## 🚀 Quick Start

### 1. Install Dependencies (if needed)
```bash
cd backend
npm install mongoose express cors dotenv
```

### 2. Start MongoDB
```bash
mongod
```

### 3. Start Backend Server
```bash
cd backend
npm start
```
Server will run on `http://localhost:8000`

### 4. Update Frontend Component

Replace mock data in `LandlordMaintenance.jsx`:

```javascript
import { useState, useEffect } from 'react';
import api from '../../../services/api';

const LandlordMaintenance = () => {
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const landlordId = localStorage.getItem('userId');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await api.getLandlordMaintenanceRequests(landlordId);
      if (response.success) {
        setMaintenanceRequests(response.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      await api.updateMaintenanceStatus(requestId, newStatus);
      fetchData(); // Refresh list
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // ... rest of your component
};
```

---

## 📊 Database Schema

### Maintenance Collection
```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String (required),
  property: ObjectId (ref: Property),
  propertyName: String,
  tenant: ObjectId (ref: User),
  tenantName: String,
  landlord: ObjectId (ref: User),
  status: Enum (Pending, In Progress, On Hold, Completed, Cancelled),
  priority: Enum (Low, Medium, High),
  category: Enum (plumbing, electrical, hvac, appliance, structural, security, general),
  progress: Number (0-100),
  assignedTo: String,
  assignedToContact: { phone, email },
  estimatedCost: Number,
  actualCost: Number,
  isEmergency: Boolean,
  isUrgent: Boolean,
  attachments: [{ id, name, type, size, url }],
  comments: [{ author, authorId, text, timestamp, attachments }],
  history: [{ type, description, timestamp, details }],
  scheduledDate: Date,
  completedDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎯 Key Features

### 1. **Smart Status Management**
- Automatic progress calculation
- Status history tracking
- Completion date tracking

### 2. **Advanced Filtering**
- Filter by status, priority, property
- Sort by any field (date, priority, status)
- Multi-parameter queries

### 3. **Complete History**
- Track all changes (status, assignments, comments)
- Timestamp all actions
- Maintain audit trail

### 4. **Comments System**
- Add comments with attachments
- Track comment authors
- Threaded conversation support

### 5. **Assignment Management**
- Assign technicians/service providers
- Store contact information
- Track assignment history

### 6. **Statistics Dashboard**
- Total, pending, in progress, completed counts
- High priority count
- Average response time
- Total cost tracking
- Completion rate calculation

### 7. **Property Integration**
- Link to existing properties
- Filter by property
- View all maintenance for a property

---

## 📝 API Usage Examples

### Create Maintenance Request
```javascript
const newRequest = await api.createMaintenanceRequest({
  title: 'Kitchen Faucet Leak',
  description: 'Water is dripping constantly',
  property: 'propertyId',
  tenant: 'tenantId',
  landlord: 'landlordId',
  priority: 'High',
  category: 'plumbing',
  isEmergency: false,
  isUrgent: true
});
```

### Get Filtered Requests
```javascript
const requests = await api.getLandlordMaintenanceRequests(landlordId, {
  status: 'In Progress',
  priority: 'High',
  sortBy: 'createdAt',
  sortOrder: 'desc'
});
```

### Update Status
```javascript
await api.updateMaintenanceStatus(requestId, 'Completed');
```

### Add Comment
```javascript
await api.addMaintenanceComment(requestId, {
  author: 'Landlord',
  authorId: landlordId,
  text: 'Plumber will arrive tomorrow at 10 AM',
  attachments: []
});
```

### Get Statistics
```javascript
const stats = await api.getMaintenanceStats(landlordId);
// Returns: { total, pending, inProgress, completed, highPriority, avgResponseTime, totalCost, completionRate }
```

---

## 🔧 Configuration

### Environment Variables (.env)
```env
MONGODB_URI=mongodb://localhost:27017/ghar_nishchit
PORT=8000
FRONTEND_URL=http://localhost:5173
```

### CORS Configuration
Already configured in `app.js`:
```javascript
app.use(cors({
  origin: [process.env.FRONTEND_URL, "http://localhost:5173"],
  credentials: true
}));
```

---

## ✅ Testing

### Using Postman/Thunder Client

**Create Request:**
```http
POST http://localhost:8000/api/maintenance
Content-Type: application/json

{
  "title": "Test Leak",
  "description": "Testing API",
  "property": "64f5a8b9c3d4e2f1a8b9c3d4",
  "tenant": "64f5a8b9c3d4e2f1a8b9c3d5",
  "landlord": "64f5a8b9c3d4e2f1a8b9c3d6",
  "priority": "High",
  "category": "plumbing"
}
```

**Get Requests:**
```http
GET http://localhost:8000/api/maintenance/landlord/64f5a8b9c3d4e2f1a8b9c3d6?status=In Progress
```

**Update Status:**
```http
PATCH http://localhost:8000/api/maintenance/64f5a8b9c3d4e2f1a8b9c3d7/status
Content-Type: application/json

{
  "status": "Completed"
}
```

---

## 🎨 Frontend Integration Checklist

- [ ] Remove `useLocalStorage` mock data from component
- [ ] Add `useEffect` to fetch data on mount
- [ ] Implement `fetchData` function using API
- [ ] Update `handleStatusChange` to call API
- [ ] Update `handleAddComment` to call API
- [ ] Update `handleDeleteRequest` to call API
- [ ] Fetch statistics using `getMaintenanceStats`
- [ ] Add loading states while fetching
- [ ] Add error handling with notifications
- [ ] Test all CRUD operations
- [ ] Implement filters and sorting
- [ ] Add authentication headers if needed

---

## 📈 Next Steps & Enhancements

### Immediate
1. Remove mock data from frontend
2. Test all API endpoints
3. Add proper error notifications
4. Implement loading states

### Future Enhancements
1. **File Upload**: Implement multer for attachment uploads
2. **Real-time Updates**: Add WebSocket for live updates
3. **Email Notifications**: Send emails on status changes
4. **SMS Alerts**: Send SMS for high priority requests
5. **Scheduling**: Add calendar integration for scheduled maintenance
6. **Analytics**: Add charts and graphs for maintenance trends
7. **Mobile App**: Create mobile version using React Native
8. **PDF Reports**: Generate PDF reports for completed maintenance
9. **Payment Integration**: Track payments for maintenance work
10. **Vendor Management**: Create vendor/technician database

---

## 🐛 Troubleshooting

### Issue: CORS Error
**Solution:** Ensure backend CORS is properly configured and frontend URL matches

### Issue: 404 Not Found
**Solution:** 
- Check MongoDB is running
- Verify backend server is running on correct port
- Check API base URL in frontend

### Issue: Data Not Showing
**Solution:**
- Check browser console for errors
- Verify API responses in Network tab
- Ensure correct user IDs are being used

### Issue: Schema Validation Error
**Solution:** Ensure all required fields are provided when creating requests

---

## 📚 Additional Resources

- **MongoDB Documentation**: https://docs.mongodb.com/
- **Express.js Guide**: https://expressjs.com/
- **Mongoose Documentation**: https://mongoosejs.com/docs/
- **REST API Best Practices**: https://restfulapi.net/

---

## 👥 Support & Contribution

For issues, questions, or contributions:
1. Check the API documentation
2. Review the integration guide
3. Test with Postman first
4. Check console logs for errors

---

## 📄 License

This implementation is part of the Ghar_Nishchit project.

---

**Last Updated:** October 26, 2025
**Version:** 1.0.0
**Author:** Backend Development Team
