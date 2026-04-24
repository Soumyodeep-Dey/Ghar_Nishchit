import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI;

mongoose.connect(uri).then(async () => {
  console.log('Connected to DB');
  const Inquiry = mongoose.model('Inquiry', new mongoose.Schema({
    property: mongoose.Schema.Types.ObjectId,
    seeker: mongoose.Schema.Types.ObjectId,
    landlord: mongoose.Schema.Types.ObjectId,
    message: String,
    contactTime: Date,
    replies: Array
  }, { strict: false }));

  const inquiries = await Inquiry.find({});
  const map = new Map();

  for (let inq of inquiries) {
    const key = `${inq.seeker}_${inq.property}`;
    if (!map.has(key)) {
      map.set(key, [inq]);
    } else {
      map.get(key).push(inq);
    }
  }

  let deletedCount = 0;
  for (let [key, list] of map) {
    if (list.length > 1) {
      // sort by contactTime descending
      list.sort((a, b) => b.contactTime - a.contactTime);
      const keep = list[0];
      const toDelete = list.slice(1);
      
      for (let del of toDelete) {
        await Inquiry.deleteOne({ _id: del._id });
        deletedCount++;
      }
    }
  }

  console.log(`Deleted ${deletedCount} duplicate inquiries.`);
  process.exit(0);
}).catch(console.error);
