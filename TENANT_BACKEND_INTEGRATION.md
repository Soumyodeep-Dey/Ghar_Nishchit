# Tenant Backend Integration Guide

## Overview
This document outlines the backend integration completed for all Tenant component files in the frontend application.

## Files Modified

### 1. TenantDashboard.jsx ✅
**Location:** `frontend/UI/src/components/Pages/TENANT/TenantDashboard.jsx`

**Changes Made:**
- Added API imports (`api.js`, toast utilities)
- Replaced mock data with real API calls
- Implemented `useEffect` hook to fetch dashboard data on component mount
- Fetches user profile using `api.getProfile()`
- Fetches tenant maintenance requests using `api.getTenantMaintenanceRequests(tenantId)`
- Added error handling with toast notifications
- Loading state properly managed during API calls

**API Endpoints Used:**
- `GET /api/auth/profile` - Fetch user profile
- `GET /api/maintenance/tenant/:tenantId` - Fetch tenant's maintenance requests

---

### 2. TenantProperty.jsx ✅
**Location:** `frontend/UI/src/components/Pages/TENANT/TenantProperty.jsx`

**Changes Made:**
- Added API and toast utility imports
- Removed `useLocalStorage` hook for properties (now fetched from backend)
- Implemented `useEffect` to fetch properties from backend on mount
- Fetches all properties using `api.getProperties()`
- Transforms backend data format to match frontend component expectations
- Maps property fields: `_id`, `title`, `price`, `address`, `description`, `images`, etc.
- Added placeholder image handling for properties without images
- Updated `toggleFavorite` to show success toast
- Error handling with toast notifications

**API Endpoints Used:**
- `GET /api/properties` - Fetch all available properties

**Data Transformation:**
```javascript
{
  id: prop._id || prop.id,
  title: prop.title || 'Untitled Property',
  price: `$${prop.price || 0}/month`,
  location: prop.address || 'Location not specified',
  description: prop.description || 'No description available',
  image: prop.images?.[0] || placeholder,
  bedrooms: prop.bedrooms || 0,
  bathrooms: prop.bathrooms || 0,
  favorite: false
}
```

---

### 3. TenantMaintenance.jsx ✅
**Location:** `frontend/UI/src/components/Pages/TENANT/TenantMaintenance.jsx`

**Changes Made:**
- Added API and toast utility imports
- Removed `useLocalStorage` hook for maintenance requests
- Implemented comprehensive backend integration for CRUD operations
- Added user profile state to get tenant ID

**API Integration:**

1. **Fetch Maintenance Requests (on mount):**
   - Gets user profile first
   - Fetches tenant's maintenance requests
   - Transforms data to frontend format

2. **Create New Request:**
   - Validates form inputs
   - Creates request via `api.createMaintenanceRequest()`
   - Updates local state with new request
   - Shows success/error toast

3. **Update Request:**
   - Calls `api.updateMaintenanceRequest(id, data)`
   - Updates local state
   - Shows success/error toast

4. **Delete Request:**
   - Calls `api.deleteMaintenanceRequest(id)`
   - Removes from local state
   - Shows success/error toast

**API Endpoints Used:**
- `GET /api/auth/profile` - Get user profile
- `GET /api/maintenance/tenant/:tenantId` - Fetch tenant requests
- `POST /api/maintenance` - Create maintenance request
- `PUT /api/maintenance/:id` - Update maintenance request
- `DELETE /api/maintenance/:id` - Delete maintenance request

**Data Transformation:**
```javascript
{
  id: req._id || req.id,
  title: req.title || req.issueType || 'Maintenance Request',
  description: req.description || 'No description',
  priority: req.priority || 'Medium',
  status: req.status || 'Pending',
  date: req.createdAt || req.reportedDate || new Date().toISOString()
}
```

---

### 4. TenantPayment.jsx ✅
**Location:** `frontend/UI/src/components/Pages/TENANT/TenantPayment.jsx`

**Changes Made:**
- Added Razorpay checkout integration through the shared API service
- Uses `api.createRazorpayOrder()` and `api.verifyRazorpayPayment()`
- Enhanced payment submission with success notification
- Improved receipt download with formatted content

**Enhanced Features:**
- Success toast on payment completion
- Formatted receipt download with detailed payment information
- Proper error handling structure in place

**Note:** Payment now uses the backend Razorpay flow exposed by `/api/payments/create-order`, `/api/payments/verify`, and `/api/payments/webhook`.

---

## Backend API Structure

### Available Endpoints

#### Authentication
- `GET /api/auth/profile` - Get logged-in user profile

#### Properties
- `GET /api/properties` - Get all properties
- `GET /api/properties/:id` - Get property by ID
- `GET /api/properties/user/:userId` - Get properties by user
- `POST /api/properties` - Create new property (requires auth)
- `PUT /api/properties/:id` - Update property (requires auth)
- `DELETE /api/properties/:id` - Delete property (requires auth)

#### Maintenance
- `GET /api/maintenance/tenant/:tenantId` - Get tenant's maintenance requests
- `GET /api/maintenance/landlord/:landlordId` - Get landlord's maintenance requests
- `GET /api/maintenance/:id` - Get maintenance request by ID
- `GET /api/maintenance/stats/:landlordId` - Get maintenance statistics
- `POST /api/maintenance` - Create maintenance request
- `PUT /api/maintenance/:id` - Update maintenance request
- `PATCH /api/maintenance/:id/status` - Update request status
- `POST /api/maintenance/:id/comment` - Add comment
- `DELETE /api/maintenance/:id` - Delete request

#### Tenants (for Landlords)
- `GET /api/tenants` - Get landlord's tenants
- `GET /api/tenants/:tenantId` - Get tenant details
- `GET /api/tenants/stats` - Get tenant statistics

#### Payments
- `POST /api/payments/create-order` - Create a tenant Razorpay order
- `POST /api/payments/verify` - Verify a tenant Razorpay payment
- `GET /api/payments` - Get tenant payment history
- `GET /api/payments/stats` - Get tenant payment statistics

#### Landlord Payments
- `POST /api/landlord-payments/create-order` - Create a landlord subscription order
- `POST /api/landlord-payments/verify` - Verify a landlord payment
- `GET /api/landlord-payments` - Get landlord payment history
- `GET /api/landlord-payments/stats` - Get landlord payment statistics

---

## Error Handling Strategy

All API calls follow this pattern:

```javascript
try {
  setIsLoading(true);
  const data = await api.someEndpoint();
  // Transform and set data
  setState(transformedData);
} catch (error) {
  console.error('Error details:', error);
  showErrorToast('User-friendly error message');
  // Set default/empty state
  setState([]);
} finally {
  setIsLoading(false);
}
```

---

## Toast Notifications

All components use consistent toast notifications:

- **Success**: `showSuccessToast('Operation completed')`
- **Error**: `showErrorToast('Operation failed')`
- **Info**: `showInfoToast('Information message')`

---

## Data Flow

### TenantDashboard
```
Component Mount → Fetch Profile → Fetch Maintenance → Display Stats
```

### TenantProperty
```
Component Mount → Fetch All Properties → Transform Data → Display Grid
User Action → Toggle Favorite → Show Toast
```

### TenantMaintenance
```
Component Mount → Fetch Profile → Fetch Requests → Display List
User Create → Validate → API Call → Update State → Show Toast
User Update → API Call → Update State → Show Toast
User Delete → Confirm → API Call → Update State → Show Toast
```

### TenantPayment
```
Component Mount → Load from localStorage → Display
User Payment → Process → Move to History → Show Toast
User Download → Generate Receipt → Download → Show Toast
```

---

## Next Steps

### Pending Integrations:
1. **Payment API** - Implement backend endpoints for:
   - Upcoming payments
   - Payment history
   - Payment processing
   - Receipt generation

2. **Favorites API** - Implement favorites management:
   - Save favorite properties
   - Remove favorites
   - Fetch user favorites

3. **Notifications API** - Implement notification system:
   - Fetch notifications
   - Mark as read
   - Delete notifications
   - Real-time updates (optional: WebSocket)

4. **Real-time Updates** - Consider implementing:
   - WebSocket for maintenance status updates
   - Push notifications for important events

---

## Testing Checklist

### TenantDashboard
- [ ] Profile loads correctly
- [ ] Maintenance stats display properly
- [ ] Error handling works
- [ ] Loading states show correctly

### TenantProperty
- [ ] Properties load from backend
- [ ] Property images display (or placeholder)
- [ ] Search and filter work
- [ ] Favorite toggle works
- [ ] Error handling works

### TenantMaintenance
- [ ] Requests load on mount
- [ ] Create new request works
- [ ] Edit request works
- [ ] Delete request works
- [ ] All toasts display correctly
- [ ] Error scenarios handled

### TenantPayment
- [ ] Payment history displays
- [ ] Payment submission works
- [ ] Receipt download works
- [ ] Toasts display correctly

---

## Configuration

Ensure the API base URL is configured in `.env`:

```env
VITE_API_BASE=http://localhost:3000/api
```

Or set via `window.__env.REACT_APP_API_BASE` for production builds.

---

## Authentication

All protected endpoints require a valid JWT token stored in localStorage:

```javascript
localStorage.getItem('token') || localStorage.getItem('authToken')
```

The `api.js` service automatically includes this token in request headers.

---

## Troubleshooting

### Common Issues:

1. **"Failed to load data" errors:**
   - Check backend server is running
   - Verify API base URL configuration
   - Check browser console for CORS errors
   - Ensure valid auth token exists

2. **Data not displaying:**
   - Check data transformation logic
   - Verify backend response format matches expected structure
   - Check browser console for errors

3. **CORS errors:**
   - Ensure backend has proper CORS configuration
   - Verify API base URL is correct

4. **Authentication errors:**
   - Check token exists in localStorage
   - Verify token is valid and not expired
   - Re-login if necessary

---

## Summary

✅ **Completed:**
- TenantDashboard.jsx - Backend integrated
- TenantProperty.jsx - Backend integrated
- TenantMaintenance.jsx - Full CRUD backend integrated
- TenantPayment.jsx - Enhanced with toasts (awaiting payment API)

🔄 **In Progress:**
- Payment backend API development

⏳ **Pending:**
- Favorites backend API
- Notifications backend API
- Real-time updates (optional)

---

**Date:** October 30, 2025  
**Status:** Backend integration for tenant components completed  
**Next:** Implement remaining backend APIs (payments, favorites, notifications)
