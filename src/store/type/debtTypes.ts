import { Document, Model } from 'mongoose';

export enum RepaymentFrequency {
  Daily = 'daily',
  Weekly = 'weekly',
  Monthly = 'monthly',
  Yearly = 'yearly'
}

export enum DebtStatus {
  Paid = 'paid',
  Unpaid = 'unpaid',
  Defaulted = 'defaulted',
  Restructured = 'restructured'
}

export enum Priority {
  Lowest = 'lowest',
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Highest = 'highest'
}

export enum InterestType {
  Simple = 'simple',
  Compound = 'compound'
}

export enum PaymentMethod {
  Cash = 'cash',
  BankTransfer = 'bank_transfer',
  Check = 'check',
  CreditCard = 'credit_card',
  DebitCard = 'debit_card',
  Other = 'other'
}

export interface PaymentScheduleEntry {
  date: Date;
  payment: number;
  principalComponent: number;
  interestComponent: number;
  remainingBalance: number;
}

export interface DebtSummary {
  totalPrincipal: number;
  totalRemaining: number;
  totalInterestAccrued: number;
  totalPaid: number;
  projectedPayoffDate?: Date;
}

export interface PayoffCalculation {
  asOf: Date;
  principalRemaining: number;
  interestToPayoff: number;
  totalPayoffAmount: number;
  projectedSavings?: number;
}

export interface DebtRepayment {
  id: string;
  repaymentDate: Date;
  amountPaid: number;
  paymentMethod: PaymentMethod;
  attachment?: string;
  appliedToInterest: number;
  appliedToPrincipal: number;
  notes: string;
}

// Base interface for debt properties
export interface DebtBase {
  userId: string;
  nameOfCreditor: string;
  nameOfDebtor: string;
  debtDescription?: string;
  debtType: string;
  principalAmount: number;
  interestRate: number;
  interestType: InterestType;
  compoundingFrequency?: RepaymentFrequency;
  initialPayment?: number;
  termOfDebt: number;
  priority: Priority;
  debtRepayment?: DebtRepayment[];
  repaymentFrequency: RepaymentFrequency;
  debtStatus: DebtStatus;
  dateToBeginPayment: Date;
  currency: string;
  
  remainingBalance: number;
  totalPaid: number;
  interestAccrued: number;
  principalPaid: number;
  interestPaid: number;
  
  nextPaymentDate?: Date;
  nextPaymentAmount?: number;
  paymentSchedule?: PaymentScheduleEntry[];
}

// Interface for instance methods
export interface DebtMethods {
  makePayment(
    amount: number,
    paymentMethod: PaymentMethod,
    paymentDate?: Date,
    attachment?: string,
    notes?: string
  ): Promise<DebtRepayment>;
  
  calculatePayoffAmount(payoffDate?: Date): PayoffCalculation;
  recalculateSchedule(): PaymentScheduleEntry[];
}

// Interface for static methods
export interface DebtStaticMethods extends Model<DebtDocument, {}, DebtMethods> {
  calculateTotalDebtsByUser(userId: string): Promise<DebtSummary>;
  getUpcomingPayments(userId: string, daysAhead?: number): Promise<PaymentScheduleEntry[]>;
  getDebtsByPriority(userId: string): Promise<DebtDocument[]>;
}

// Combined document interface
export interface DebtDocument extends Document, DebtBase, DebtMethods {}

// Export the model type
export type DebtModel = Model<DebtDocument, {}, DebtMethods> & DebtStaticMethods;