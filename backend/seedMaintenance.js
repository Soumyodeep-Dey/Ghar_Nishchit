// Sample data seeding script for testing Maintenance Management API
// Run this after you have properties and users in your database

import mongoose from 'mongoose';
import Maintenance from './src/models/maintenance.model.js';
import dotenv from 'dotenv';
import { getCurrentYear } from './src/utils/dateUtils.js';

dotenv.config();

const sampleMaintenanceRequests = [
    {
        title: "Kitchen Faucet Leak",
        description: "The kitchen faucet has been dripping constantly, causing water waste and potential damage to the cabinet below.",
        propertyName: "Modern Downtown Loft #101",
        tenantName: "John Doe",
        status: "In Progress",
        priority: "High",
        category: "plumbing",
        progress: 65,
        assignedTo: "AquaFix Plumbing Services",
        estimatedCost: 150,
        isEmergency: false,
        isUrgent: true,
        attachments: [
            {
                id: "1",
                name: "faucet_leak.jpg",
                type: "image",
                size: "2.3 MB",
                url: "/api/placeholder/400/300"
            }
        ],
        comments: [
            {
                author: "Landlord",
                text: "I've contacted AquaFix Plumbing and they'll be there tomorrow morning.",
                timestamp: new Date(`${getCurrentYear()}-08-01T15:30:00Z`)
            }
        ],
        history: [
            {
                type: "created",
                description: "Request created by John Doe",
                timestamp: new Date(`${getCurrentYear()}-08-01T10:30:00Z`)
            },
            {
                type: "assignment",
                description: "Assigned to AquaFix Plumbing Services",
                timestamp: new Date(`${getCurrentYear()}-08-01T15:00:00Z`)
            },
            {
                type: "status",
                description: "Status changed to In Progress",
                timestamp: new Date(`${getCurrentYear()}-08-02T09:00:00Z`)
            }
        ],
        createdAt: new Date(`${getCurrentYear()}-08-01T10:30:00Z`),
        updatedAt: new Date(`${getCurrentYear()}-08-02T14:20:00Z`)
    },
    {
        title: "Heating System Malfunction",
        description: "The heating system is not working properly. Rooms are not getting warm enough despite thermostat being set correctly.",
        propertyName: "Luxury Penthouse #505",
        tenantName: "Jane Smith",
        status: "In Progress",
        priority: "Medium",
        category: "hvac",
        progress: 50,
        assignedTo: "HVAC Solutions Inc.",
        estimatedCost: 300,
        isEmergency: false,
        isUrgent: false,
        attachments: [
            {
                id: "1",
                name: "thermostat_reading.jpg",
                type: "image",
                size: "1.5 MB",
                url: "/api/placeholder/400/300"
            }
        ],
        comments: [
            {
                author: "Landlord",
                text: "HVAC Solutions Inc. has been contacted and will inspect the system tomorrow.",
                timestamp: new Date(`${getCurrentYear()}-07-29T11:00:00Z`)
            }
        ],
        history: [
            {
                type: "created",
                description: "Request created by Jane Smith",
                timestamp: new Date(`${getCurrentYear()}-07-28T09:15:00Z`)
            },
            {
                type: "assignment",
                description: "Assigned to HVAC Solutions Inc.",
                timestamp: new Date(`${getCurrentYear()}-07-29T10:30:00Z`)
            },
            {
                type: "status",
                description: "Status changed to In Progress",
                timestamp: new Date(`${getCurrentYear()}-08-05T10:00:00Z`)
            }
        ],
        createdAt: new Date(`${getCurrentYear()}-07-28T09:15:00Z`),
        updatedAt: new Date(`${getCurrentYear()}-08-05T10:00:00Z`)
    },
    {
        title: "Electrical Outlet Not Working",
        description: "The main electrical outlet in the living room has stopped working completely. Need urgent repair as it affects multiple devices.",
        propertyName: "Cozy Studio Apartment",
        tenantName: "Robert Johnson",
        status: "Completed",
        priority: "High",
        category: "electrical",
        progress: 100,
        assignedTo: "ElectroFix Solutions",
        estimatedCost: 120,
        actualCost: 115,
        isEmergency: true,
        isUrgent: false,
        attachments: [
            {
                id: "1",
                name: "outlet_before.jpg",
                type: "image",
                size: "1.8 MB",
                url: "/api/placeholder/400/300"
            },
            {
                id: "2",
                name: "outlet_after.jpg",
                type: "image",
                size: "2.1 MB",
                url: "/api/placeholder/400/300"
            }
        ],
        comments: [
            {
                author: "ElectroFix Solutions",
                text: "Replaced the faulty outlet and checked all connections. Everything is working properly now.",
                timestamp: new Date(`${getCurrentYear()}-08-03T11:30:00Z`)
            }
        ],
        history: [
            {
                type: "created",
                description: "Emergency request created by Robert Johnson",
                timestamp: new Date(`${getCurrentYear()}-08-02T16:45:00Z`)
            },
            {
                type: "assignment",
                description: "Assigned to ElectroFix Solutions",
                timestamp: new Date(`${getCurrentYear()}-08-02T17:00:00Z`)
            },
            {
                type: "status",
                description: "Status changed to In Progress",
                timestamp: new Date(`${getCurrentYear()}-08-03T08:00:00Z`)
            },
            {
                type: "status",
                description: "Status changed to Completed",
                timestamp: new Date(`${getCurrentYear()}-08-03T11:30:00Z`)
            }
        ],
        createdAt: new Date(`${getCurrentYear()}-08-02T16:45:00Z`),
        updatedAt: new Date(`${getCurrentYear()}-08-03T11:30:00Z`),
        completedDate: new Date(`${getCurrentYear()}-08-03T11:30:00Z`)
    },
    {
        title: "Window Lock Repair",
        description: "The lock on the bedroom window is broken and won't secure properly. This is a security concern that needs attention.",
        propertyName: "Garden View Apartment",
        tenantName: "Emily Davis",
        status: "On Hold",
        priority: "Low",
        category: "security",
        progress: 25,
        assignedTo: "SecureHome Repairs",
        estimatedCost: 80,
        isEmergency: false,
        isUrgent: false,
        attachments: [],
        comments: [
            {
                author: "Landlord",
                text: "Waiting for parts to arrive. Should be completed by end of week.",
                timestamp: new Date(`${getCurrentYear()}-08-01T10:15:00Z`)
            }
        ],
        history: [
            {
                type: "created",
                description: "Request created by Emily Davis",
                timestamp: new Date(`${getCurrentYear()}-07-30T14:20:00Z`)
            },
            {
                type: "assignment",
                description: "Assigned to SecureHome Repairs",
                timestamp: new Date(`${getCurrentYear()}-07-30T15:30:00Z`)
            },
            {
                type: "status",
                description: "Status changed to On Hold",
                timestamp: new Date(`${getCurrentYear()}-08-01T10:15:00Z`),
                details: "Waiting for parts"
            }
        ],
        createdAt: new Date(`${getCurrentYear()}-07-30T14:20:00Z`),
        updatedAt: new Date(`${getCurrentYear()}-08-01T10:15:00Z`)
    },
    {
        title: "Refrigerator Not Cooling",
        description: "The refrigerator has stopped cooling properly. Food is spoiling and temperature is rising.",
        propertyName: "Downtown Studio #202",
        tenantName: "Michael Brown",
        status: "Pending",
        priority: "High",
        category: "appliance",
        progress: 0,
        estimatedCost: 200,
        isEmergency: false,
        isUrgent: true,
        attachments: [],
        comments: [],
        history: [
            {
                type: "created",
                description: "Request created by Michael Brown",
                timestamp: new Date(`${getCurrentYear()}-10-25T08:00:00Z`)
            }
        ],
        createdAt: new Date(`${getCurrentYear()}-10-25T08:00:00Z`),
        updatedAt: new Date(`${getCurrentYear()}-10-25T08:00:00Z`)
    }
];

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ghar_nishchit');
        console.log('✅ Connected to MongoDB');

        // Clear existing maintenance requests (optional - comment out if you want to keep existing data)
        await Maintenance.deleteMany({});
        console.log('🗑️  Cleared existing maintenance requests');

        // You need to fetch actual property and user IDs from your database
        // For demo purposes, I'll show how to do it:

        // Example: Get first property and user
        const Property = mongoose.model('Property');
        const User = mongoose.model('User');

        const properties = await Property.find().limit(5);
        const landlords = await User.find({ role: 'landlord' }).limit(1);
        const tenants = await User.find({ role: 'tenant' }).limit(5);

        if (properties.length === 0 || landlords.length === 0 || tenants.length === 0) {
            console.error('❌ Please create properties and users first!');
            process.exit(1);
        }

        // Map sample data to actual IDs
        const maintenanceRequestsWithIds = sampleMaintenanceRequests.map((req, index) => ({
            ...req,
            property: properties[index % properties.length]._id,
            tenant: tenants[index % tenants.length]._id,
            landlord: landlords[0]._id
        }));

        // Insert sample data
        const result = await Maintenance.insertMany(maintenanceRequestsWithIds);
        console.log(`✅ Successfully inserted ${result.length} maintenance requests`);

        // Display summary
        console.log('\n📊 Summary:');
        console.log(`Total Requests: ${result.length}`);
        console.log(`Pending: ${result.filter(r => r.status === 'Pending').length}`);
        console.log(`In Progress: ${result.filter(r => r.status === 'In Progress').length}`);
        console.log(`Completed: ${result.filter(r => r.status === 'Completed').length}`);
        console.log(`On Hold: ${result.filter(r => r.status === 'On Hold').length}`);

        console.log('\n✨ Database seeding completed successfully!');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

// Run the seeding function
seedDatabase();
