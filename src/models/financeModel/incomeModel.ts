import mongoose, { Schema, Document } from 'mongoose';

export interface IncomeDocument extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  name: string;
  sources: string;
  amount: number;
  dateReceived: Date;
  recurringIncome: boolean;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  description?: string;
  currency?: string;
  category?: string;
  tags?: string[];
  isTaxable?: boolean;
  taxDeductions?: number;
  netAmount?: number;
  paymentMethod?: 'cash' | 'bank_transfer' | 'cheque' | 'other';
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const incomeSchema = new Schema<IncomeDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },  // Reference to the user
  name: { type: String, required: true, trim: true },  // Name of the income
  sources: { type: String, required: true, trim: true },  // Source of income
  amount: { type: Number, required: true, min: 0 },  // Income amount (positive)
  dateReceived: { type: Date, required: true },  // Date the income was received
  recurringIncome: { type: Boolean, default: false },  // Recurring income flag
  frequency: { 
    type: String, 
    enum: ['daily', 'weekly', 'monthly', 'yearly'], 
    default: 'daily' 
  },  // Recurring income frequency
  description: { type: String, trim: true },  // Optional description
  currency: { 
    type: String, 
    default: 'USD',  // Default currency is USD
    uppercase: true, 
    maxlength: 3 
  },  // ISO currency code
  category: { type: String, trim: true },  // Income category (e.g., salary, freelance)
  tags: { 
    type: [String], 
    validate: [arrayLimit, '{PATH} exceeds the limit of 10']  // Limit tags to 10
  },  // Tags for easier searching
  isTaxable: { type: Boolean, default: false },  // Whether income is taxable
  taxDeductions: { type: Number, min: 0, default: 0 },  // Tax deductions (optional)
  paymentMethod: { 
    type: String, 
    enum: ['cash', 'bank_transfer', 'cheque', 'other'], 
    default: 'bank_transfer' 
  },  // Payment method
  attachments: { 
    type: [String], 
    validate: {
      validator: function (v: string[]) {
        return v.every(url => /^https?:\/\//.test(url));  // Validate URLs for attachments
      },
      message: props => `${props.value} contains an invalid URL`
    }
  },  // Attachments
}, {
  timestamps: true,
});

// Virtual field for calculating netAmount
incomeSchema.virtual('netAmount').get(function () {
  const amount = this.amount || 0;
  const taxDeductions = this.taxDeductions || 0;
  return amount - taxDeductions;
});

// Limit tags array length to a maximum of 10
function arrayLimit(val: string[]) {
  return val.length <= 10;
}

// Declare incomeModel correctly
const incomeModel = mongoose.models.Income || mongoose.model<IncomeDocument>('Income', incomeSchema);

export default incomeModel;
