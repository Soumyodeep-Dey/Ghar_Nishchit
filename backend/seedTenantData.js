import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './src/models/user.model.js';
import Property from './src/models/property.model.js';
import Inquiry from './src/models/inquiry.model.js';

dotenv.config();

async function seedTenantData() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ghar_nishchit');
        console.log('✅ Connected to MongoDB');

        // Clear existing data (optional - comment out if you want to keep existing data)
        // await User.deleteMany({});
        // await Property.deleteMany({});
        // await Inquiry.deleteMany({});
        // console.log('🗑️  Cleared existing data');

        // Create a landlord user
        const hashedPassword = await bcrypt.hash('password123', 10);
        const landlord = await User.create({
            name: 'John Landlord',
            email: 'landlord@example.com',
            password: hashedPassword,
            role: 'landlord',
            phone: '+1234567890',
            profilePicture: 'https://ui-avatars.com/api/?name=John+Landlord&background=0D8ABC&color=fff'
        });
        console.log('✅ Created landlord:', landlord.name);

        // Create some tenant users
        const tenant1 = await User.create({
            name: 'Alice Tenant',
            email: 'alice@example.com',
            password: hashedPassword,
            role: 'tenant',
            phone: '+1234567891',
            profilePicture: 'https://ui-avatars.com/api/?name=Alice+Tenant&background=FF5733&color=fff'
        });

        const tenant2 = await User.create({
            name: 'Bob Seeker',
            email: 'bob@example.com',
            password: hashedPassword,
            role: 'tenant',
            phone: '+1234567892',
            profilePicture: 'https://ui-avatars.com/api/?name=Bob+Seeker&background=33FF57&color=fff'
        });

        const tenant3 = await User.create({
            name: 'Carol Prospect',
            email: 'carol@example.com',
            password: hashedPassword,
            role: 'tenant',
            phone: '+1234567893',
            profilePicture: 'https://ui-avatars.com/api/?name=Carol+Prospect&background=5733FF&color=fff'
        });

        console.log('✅ Created 3 tenant users');

        // Create properties for the landlord
        const property1 = await Property.create({
            title: 'Modern Downtown Loft',
            description: 'Stunning modern loft in the heart of downtown with city views',
            price: 2500,
            address: '123 Main St, Downtown',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            bedrooms: 2,
            bathrooms: 2,
            area: 1200,
            propertyType: 'apartment',
            amenities: ['WiFi', 'Parking', 'Gym', 'Pool'],
            images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'],
            postedBy: landlord._id,
            isAvailable: true
        });

        const property2 = await Property.create({
            title: 'Luxury Penthouse Suite',
            description: 'Exclusive penthouse with panoramic views and premium finishes',
            price: 4500,
            address: '456 Park Ave, Uptown',
            city: 'New York',
            state: 'NY',
            zipCode: '10022',
            bedrooms: 3,
            bathrooms: 3,
            area: 2500,
            propertyType: 'apartment',
            amenities: ['WiFi', 'Parking', 'Gym', 'Pool', 'Concierge', 'Rooftop'],
            images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'],
            postedBy: landlord._id,
            isAvailable: true
        });

        const property3 = await Property.create({
            title: 'Cozy Studio Apartment',
            description: 'Perfect starter apartment with all necessities',
            price: 1500,
            address: '789 Oak St, Midtown',
            city: 'New York',
            state: 'NY',
            zipCode: '10018',
            bedrooms: 1,
            bathrooms: 1,
            area: 600,
            propertyType: 'apartment',
            amenities: ['WiFi', 'Laundry'],
            images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
            postedBy: landlord._id,
            isAvailable: true
        });

        console.log('✅ Created 3 properties');

        // Create inquiries from tenants
        const inquiry1 = await Inquiry.create({
            property: property1._id,
            seeker: tenant1._id,
            message: 'Hi! I\'m very interested in this loft. Can we schedule a viewing this week?',
            contactTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
        });

        const inquiry2 = await Inquiry.create({
            property: property2._id,
            seeker: tenant2._id,
            message: 'This penthouse looks amazing! I\'d like to know more about the lease terms and move-in date.',
            contactTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
        });

        const inquiry3 = await Inquiry.create({
            property: property3._id,
            seeker: tenant3._id,
            message: 'Is this studio still available? I\'m looking to move in next month.',
            contactTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
        });

        // Create additional inquiry from same tenant for different property
        const inquiry4 = await Inquiry.create({
            property: property1._id,
            seeker: tenant2._id,
            message: 'I\'m also interested in the downtown loft as an alternative.',
            contactTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
        });

        console.log('✅ Created 4 inquiries');

        console.log('\n📊 Summary:');
        console.log(`   Landlord: ${landlord.email} / password123`);
        console.log(`   Tenants: 3 users created`);
        console.log(`   Properties: 3 listings`);
        console.log(`   Inquiries: 4 inquiries (3 unique seekers)`);
        console.log('\n💡 You can now log in as the landlord and see the tenant list!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    }
}

seedTenantData();
