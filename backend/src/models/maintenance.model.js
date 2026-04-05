import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    author: { type: String, required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    attachments: [{
        id: String,
        name: String,
        type: { type: String, enum: ['image', 'file'] },
        size: String,
        url: String
    }]
});

const historySchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['created', 'status', 'assignment', 'comment', 'update'],
        required: true
    },
    description: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    details: { type: String }
});

const attachmentSchema = new mongoose.Schema({
    id: { type: String },
    name: { type: String, required: true },
    type: { type: String, enum: ['image', 'file'], required: true },
    size: { type: String },
    url: { type: String, required: true }
});

const maintenanceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true
    },
    propertyName: {
        type: String,
        required: true
    },
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tenantName: {
        type: String,
        required: true
    },
    landlord: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'On Hold', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    category: {
        type: String,
        enum: ['plumbing', 'electrical', 'hvac', 'appliance', 'structural', 'security', 'general'],
        default: 'general'
    },
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    assignedTo: {
        type: String,
        default: null
    },
    assignedToContact: {
        phone: { type: String },
        email: { type: String }
    },
    estimatedCost: {
        type: Number,
        default: 0
    },
    actualCost: {
        type: Number,
        default: 0
    },
    isEmergency: {
        type: Boolean,
        default: false
    },
    isUrgent: {
        type: Boolean,
        default: false
    },
    attachments: [attachmentSchema],
    comments: [commentSchema],
    history: [historySchema],
    scheduledDate: {
        type: Date
    },
    completedDate: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for faster queries
maintenanceSchema.index({ landlord: 1, status: 1 });
maintenanceSchema.index({ property: 1 });
maintenanceSchema.index({ tenant: 1 });
maintenanceSchema.index({ createdAt: -1 });

// Middleware to update progress based on status
maintenanceSchema.pre('save', function (next) {
    if (this.isModified('status')) {
        switch (this.status) {
            case 'Pending':
                this.progress = 0;
                break;
            case 'In Progress':
                if (this.progress === 0) this.progress = 25;
                break;
            case 'On Hold':
                // Keep current progress
                break;
            case 'Completed':
                this.progress = 100;
                this.completedDate = new Date();
                break;
            case 'Cancelled':
                // Keep current progress
                break;
        }
    }
    next();
});

export default mongoose.model('Maintenance', maintenanceSchema);
