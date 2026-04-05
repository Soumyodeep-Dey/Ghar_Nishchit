# Maintenance Management API Documentation

## Base URL
```
http://localhost:8000/api/maintenance
```

## Endpoints

### 1. Create Maintenance Request
**POST** `/`

Create a new maintenance request.

**Request Body:**
```json
{
  "title": "Kitchen Faucet Leak",
  "description": "The kitchen faucet has been dripping constantly",
  "property": "property_id_here",
  "tenant": "tenant_id_here",
  "landlord": "landlord_id_here",
  "priority": "High",
  "category": "plumbing",
  "isEmergency": false,
  "isUrgent": true,
  "attachments": [
    {
      "id": "1",
      "name": "leak_photo.jpg",
      "type": "image",
      "size": "2.3 MB",
      "url": "/uploads/leak_photo.jpg"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Maintenance request created successfully",
  "data": {
    "_id": "request_id",
    "title": "Kitchen Faucet Leak",
    "status": "Pending",
    "progress": 0,
    ...
  }
}
```

---

### 2. Get Landlord's Maintenance Requests
**GET** `/landlord/:landlordId`

Get all maintenance requests for a specific landlord with optional filters.

**Query Parameters:**
- `status` (optional): Filter by status (Pending, In Progress, On Hold, Completed, Cancelled, All)
- `priority` (optional): Filter by priority (Low, Medium, High, All)
- `property` (optional): Filter by property ID
- `sortBy` (optional): Sort field (default: createdAt)
- `sortOrder` (optional): Sort order (asc, desc - default: desc)

**Example:**
```
GET /landlord/64f5a8b9c3d4e2f1a8b9c3d4?status=In Progress&priority=High&sortBy=priority&sortOrder=desc
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "request_id",
      "title": "Kitchen Faucet Leak",
      "status": "In Progress",
      "priority": "High",
      "property": {
        "_id": "property_id",
        "title": "Modern Downtown Loft #101"
      },
      "tenant": {
        "_id": "tenant_id",
        "name": "John Doe",
        "email": "john@example.com"
      },
      ...
    }
  ]
}
```

---

### 3. Get Tenant's Maintenance Requests
**GET** `/tenant/:tenantId`

Get all maintenance requests created by a specific tenant.

**Query Parameters:** Same as landlord endpoint (except property filter)

---

### 4. Get Single Maintenance Request
**GET** `/:id`

Get detailed information about a specific maintenance request.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "request_id",
    "title": "Kitchen Faucet Leak",
    "description": "The kitchen faucet has been dripping constantly",
    "status": "In Progress",
    "priority": "High",
    "progress": 65,
    "property": {
      "_id": "property_id",
      "title": "Modern Downtown Loft #101",
      "address": {...}
    },
    "tenant": {
      "_id": "tenant_id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "landlord": {
      "_id": "landlord_id",
      "name": "Jane Smith"
    },
    "assignedTo": "AquaFix Plumbing Services",
    "comments": [...],
    "history": [...],
    "attachments": [...],
    "createdAt": "2025-08-01T10:30:00Z",
    "updatedAt": "2025-08-02T14:20:00Z"
  }
}
```

---

### 5. Update Maintenance Request
**PUT** `/:id`

Update a maintenance request (full update).

**Request Body:**
```json
{
  "status": "In Progress",
  "priority": "High",
  "progress": 50,
  "estimatedCost": 150,
  "actualCost": 120,
  "assignedTo": "AquaFix Plumbing Services",
  "assignedToContact": {
    "phone": "555-0123",
    "email": "service@aquafix.com"
  }
}
```

---

### 6. Update Status Only
**PATCH** `/:id/status`

Update only the status of a maintenance request.

**Request Body:**
```json
{
  "status": "Completed"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Status updated successfully",
  "data": {
    "_id": "request_id",
    "status": "Completed",
    "progress": 100,
    ...
  }
}
```

---

### 7. Add Comment
**POST** `/:id/comment`

Add a comment to a maintenance request.

**Request Body:**
```json
{
  "author": "Landlord",
  "authorId": "landlord_id_here",
  "text": "I've contacted AquaFix Plumbing and they'll be there tomorrow morning.",
  "attachments": [
    {
      "id": "2",
      "name": "invoice.pdf",
      "type": "file",
      "size": "0.5 MB",
      "url": "/uploads/invoice.pdf"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "_id": "request_id",
    "comments": [
      {
        "author": "Landlord",
        "text": "I've contacted AquaFix Plumbing...",
        "timestamp": "2025-08-01T15:30:00Z",
        ...
      }
    ]
  }
}
```

---

### 8. Assign Technician
**PATCH** `/:id/assign`

Assign a technician or service provider to a maintenance request.

**Request Body:**
```json
{
  "assignedTo": "AquaFix Plumbing Services",
  "assignedToContact": {
    "phone": "555-0123",
    "email": "service@aquafix.com"
  }
}
```

---

### 9. Delete Maintenance Request
**DELETE** `/:id`

Delete a maintenance request.

**Response:**
```json
{
  "success": true,
  "message": "Maintenance request deleted successfully"
}
```

---

### 10. Get Maintenance Statistics
**GET** `/stats/:landlordId`

Get maintenance statistics for a landlord's dashboard.

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 15,
    "pending": 3,
    "inProgress": 5,
    "completed": 7,
    "highPriority": 4,
    "avgResponseTime": 2.4,
    "totalCost": 1250,
    "completionRate": 47
  }
}
```

---

### 11. Get Maintenance by Property
**GET** `/property/:propertyId`

Get all maintenance requests for a specific property.

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "request_id",
      "title": "Kitchen Faucet Leak",
      "status": "In Progress",
      "tenant": {
        "_id": "tenant_id",
        "name": "John Doe"
      },
      ...
    }
  ]
}
```

---

## Status Values
- `Pending` - Request has been created but not yet started
- `In Progress` - Work is being done
- `On Hold` - Work is paused temporarily
- `Completed` - Work is finished
- `Cancelled` - Request has been cancelled

## Priority Values
- `Low` - Can be addressed at convenience
- `Medium` - Should be addressed soon
- `High` - Requires urgent attention

## Category Values
- `plumbing` - Water-related issues
- `electrical` - Electrical problems
- `hvac` - Heating/cooling issues
- `appliance` - Appliance repairs
- `structural` - Building structure issues
- `security` - Security concerns
- `general` - General maintenance

## Progress Calculation
The progress field is automatically updated based on status:
- `Pending`: 0%
- `In Progress`: 25% (or current value if higher)
- `Completed`: 100%
- Others: Keep current value

## Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Missing required fields"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Maintenance request not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Error creating maintenance request",
  "error": "Detailed error message"
}
```

---

## Frontend Integration Example

```javascript
// services/maintenanceApi.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/maintenance';

// Get all maintenance requests for landlord
export const getLandlordMaintenance = async (landlordId, filters = {}) => {
  try {
    const params = new URLSearchParams(filters).toString();
    const response = await axios.get(
      `${API_BASE_URL}/landlord/${landlordId}?${params}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching maintenance requests:', error);
    throw error;
  }
};

// Create new maintenance request
export const createMaintenance = async (data) => {
  try {
    const response = await axios.post(API_BASE_URL, data);
    return response.data;
  } catch (error) {
    console.error('Error creating maintenance request:', error);
    throw error;
  }
};

// Update status
export const updateStatus = async (id, status) => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/${id}/status`,
      { status }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating status:', error);
    throw error;
  }
};

// Add comment
export const addComment = async (id, comment) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/${id}/comment`,
      comment
    );
    return response.data;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

// Get statistics
export const getMaintenanceStats = async (landlordId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/stats/${landlordId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching statistics:', error);
    throw error;
  }
};
```

## Usage in React Component

```javascript
import { useEffect, useState } from 'react';
import { 
  getLandlordMaintenance, 
  updateStatus, 
  addComment 
} from '../services/maintenanceApi';

const LandlordMaintenance = () => {
  const [requests, setRequests] = useState([]);
  const landlordId = 'your_landlord_id'; // Get from auth context

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await getLandlordMaintenance(landlordId, {
        status: 'All',
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      setRequests(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      await updateStatus(requestId, newStatus);
      fetchRequests(); // Refresh the list
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAddComment = async (requestId, commentData) => {
    try {
      await addComment(requestId, commentData);
      fetchRequests(); // Refresh the list
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    // Your JSX here
  );
};
```
