import mongoose, { Schema, Document } from 'mongoose';

export interface SubExpense {
  name: string;
  amount: number;
  dateSpent: Date;
  description?: string;
  tags?: string[];
}

export interface ExpenseDocument extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  name: string;
  vendor: string;
  amount: number;
  dateSpent: Date;
  recurringExpense: boolean;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  description?: string;
  currency?: string;
  category?: string;
  tags?: string[];
  isTaxDeductible?: boolean;
  taxSavings?: number;
  netExpense?: number;
  paymentMethod?: 'cash' | 'bank_transfer' | 'credit_card' | 'debit_card' | 'cheque' | 'other';
  attachments?: string[];
  subExpenses?: SubExpense[];
  reminderDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const subExpenseSchema = new Schema<SubExpense>({
  name: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 },
  dateSpent: { type: Date, required: true },
  description: { type: String, trim: true },
  tags: { 
    type: [String], 
    validate: [arrayLimit, '{PATH} exceeds the limit of 10']
  }
}, { _id: false });

const expenseSchema = new Schema<ExpenseDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  vendor: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 }, 
  dateSpent: { type: Date, required: true }, 
  recurringExpense: { type: Boolean, default: false },
  frequency: { 
    type: String, 
    enum: ['daily', 'weekly', 'monthly', 'yearly'], 
    default: 'monthly' 
  },
  description: { type: String, trim: true },
  currency: { 
    type: String, 
    default: 'USD',
    uppercase: true, 
    maxlength: 3 
  },
  category: { type: String, trim: true },
  tags: { 
    type: [String], 
    validate: [arrayLimit, '{PATH} exceeds the limit of 10']
  },
  isTaxDeductible: { type: Boolean, default: false },
  taxSavings: { type: Number, min: 0, default: 0 },
  paymentMethod: { 
    type: String, 
    enum: ['cash', 'bank_transfer', 'credit_card', 'debit_card', 'cheque', 'other'], 
    default: 'credit_card' 
  },
  attachments: { 
    type: [String], 
    validate: {
      validator: function (v: string[]) {
        return v.every(url => /^https?:\/\//.test(url));
      },
      message: props => `${props.value} contains an invalid URL`
    }
  },
  subExpenses: { type: [subExpenseSchema] },
  reminderDate: { type: Date },  // New field for recurring reminders
}, {
  timestamps: true,
});

// Virtual field for calculating netExpense including subExpenses
expenseSchema.virtual('netExpense').get(function () {
  const mainAmount = this.amount || 0;
  const taxSavings = this.taxSavings || 0;
  const subExpensesTotal = this.subExpenses?.reduce((total: number, sub: SubExpense) => total + sub.amount, 0) || 0;
  return (mainAmount + subExpensesTotal) - taxSavings;
});

function arrayLimit(val: string[]) {
  return val.length <= 10;
}

const expenseModel = mongoose.models.Expense || mongoose.model<ExpenseDocument>('Expense', expenseSchema);

export default expenseModel;