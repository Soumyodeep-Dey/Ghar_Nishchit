// Test script to verify tenant API endpoint
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/user.model.js';
import Property from './src/models/property.model.js';
import Inquiry from './src/models/inquiry.model.js';

dotenv.config();

async function testTenantData() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ghar_nishchit');
        console.log('✅ Connected to MongoDB');

        // Count collections
        const userCount = await User.countDocuments();
        const propertyCount = await Property.countDocuments();
        const inquiryCount = await Inquiry.countDocuments();

        console.log('\n📊 Database Statistics:');
        console.log(`   Users: ${userCount}`);
        console.log(`   Properties: ${propertyCount}`);
        console.log(`   Inquiries: ${inquiryCount}`);

        // Find landlords (users with role 'landlord')
        const landlords = await User.find({ role: 'landlord' }).select('_id name email');
        console.log(`\n👨‍💼 Landlords found: ${landlords.length}`);

        if (landlords.length > 0) {
            const testLandlord = landlords[0];
            console.log(`\n🔍 Testing with landlord: ${testLandlord.name} (${testLandlord._id})`);

            // Find properties for this landlord
            const landlordProperties = await Property.find({ postedBy: testLandlord._id });
            console.log(`   Properties owned: ${landlordProperties.length}`);

            if (landlordProperties.length > 0) {
                landlordProperties.forEach((prop, index) => {
                    console.log(`   ${index + 1}. ${prop.title} (${prop._id})`);
                });

                const propertyIds = landlordProperties.map(p => p._id);

                // Find inquiries for these properties
                const inquiries = await Inquiry.find({ property: { $in: propertyIds } })
                    .populate('seeker', 'name email phone')
                    .populate('property', 'title price');

                console.log(`\n📧 Inquiries for landlord's properties: ${inquiries.length}`);

                if (inquiries.length > 0) {
                    inquiries.forEach((inq, index) => {
                        console.log(`   ${index + 1}. From: ${inq.seeker?.name || 'Unknown'} (${inq.seeker?._id})`);
                        console.log(`      Property: ${inq.property?.title}`);
                        console.log(`      Message: ${inq.message?.substring(0, 50)}...`);
                        console.log(`      Date: ${inq.contactTime}`);
                    });

                    // Count unique seekers
                    const uniqueSeekers = new Set(inquiries.map(i => i.seeker?._id?.toString()).filter(Boolean));
                    console.log(`\n👥 Unique tenants/prospects: ${uniqueSeekers.size}`);
                } else {
                    console.log('   ⚠️  No inquiries found for this landlord\'s properties');
                    console.log('   💡 Suggestion: Create sample inquiries using the inquiry API');
                }
            } else {
                console.log('   ⚠️  No properties found for this landlord');
                console.log('   💡 Suggestion: Create properties first');
            }
        } else {
            console.log('⚠️  No landlords found in database');
            console.log('💡 Suggestion: Register a user with role "landlord"');
        }

        // Check for inquiries without references
        const orphanInquiries = await Inquiry.find().populate('seeker property');
        const problemInquiries = orphanInquiries.filter(inq => !inq.seeker || !inq.property);

        if (problemInquiries.length > 0) {
            console.log(`\n⚠️  Found ${problemInquiries.length} inquiries with missing references:`);
            problemInquiries.forEach((inq, index) => {
                console.log(`   ${index + 1}. Inquiry ${inq._id}:`);
                console.log(`      Missing seeker: ${!inq.seeker}`);
                console.log(`      Missing property: ${!inq.property}`);
            });
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    }
}

testTenantData();
