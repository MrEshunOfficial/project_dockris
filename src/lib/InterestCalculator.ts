import { PaymentScheduleEntry, RepaymentFrequency } from "@/store/type/debtTypes";

export class InterestCalculator {
  private static readonly DAYS_IN_YEAR = 365.25;
  private static readonly DAYS_IN_MONTH = 30.4375;

  // Helper method to normalize dates for comparison
  private static normalizeDate(date: Date): Date {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  }

  // Enhanced getTimePeriods with better date handling
  static getTimePeriods(frequency: RepaymentFrequency, startDate: Date, endDate: Date): number {
    // Normalize dates for comparison
    const normalizedStart = this.normalizeDate(startDate);
    const normalizedEnd = this.normalizeDate(endDate);
    
    // Handle equal dates
    if (normalizedStart.getTime() === normalizedEnd.getTime()) {
      return 0;
    }
    
    // Validate dates
    if (normalizedStart > normalizedEnd) {
      throw new Error(`Invalid date range: start date (${startDate.toISOString()}) must be before end date (${endDate.toISOString()})`);
    }
    
    const milliseconds = normalizedEnd.getTime() - normalizedStart.getTime();
    const days = milliseconds / (1000 * 60 * 60 * 24);
    
    switch (frequency) {
      case RepaymentFrequency.Daily:
        return Math.max(0, Math.floor(days));
      case RepaymentFrequency.Weekly:
        return Math.max(0, Math.floor(days / 7));
      case RepaymentFrequency.Monthly:
        return Math.max(0, Math.floor(days / this.DAYS_IN_MONTH));
      case RepaymentFrequency.Yearly:
        return Math.max(0, Math.floor(days / this.DAYS_IN_YEAR));
      default:
        throw new Error(`Unsupported frequency: ${frequency}`);
    }
  }

  static getPeriodsPerYear(frequency: RepaymentFrequency): number {
    switch (frequency) {
      case RepaymentFrequency.Daily:
        return Math.floor(this.DAYS_IN_YEAR);
      case RepaymentFrequency.Weekly:
        return 52;
      case RepaymentFrequency.Monthly:
        return 12;
      case RepaymentFrequency.Yearly:
        return 1;
      default:
        throw new Error(`Unsupported frequency: ${frequency}`);
    }
  }

  static calculateCompoundInterest(
    principal: number,
    rate: number,
    time: number,
    compoundingFrequency: RepaymentFrequency
  ): number {
    if (principal < 0 || rate < 0 || time < 0) {
      throw new Error('Invalid parameters: values must be non-negative');
    }
    
    // Handle edge case where time is 0
    if (time === 0) return 0;
    
    const n = this.getPeriodsPerYear(compoundingFrequency);
    const r = rate / 100;
    return Number((principal * Math.pow(1 + r/n, n * time) - principal).toFixed(2));
  }

  static calculateSimpleInterest(
    principal: number,
    rate: number,
    time: number
  ): number {
    if (principal < 0 || rate < 0 || time < 0) {
      throw new Error('Invalid parameters: values must be non-negative');
    }
    
    // Handle edge case where time is 0
    if (time === 0) return 0;
    
    return Number((principal * (rate / 100) * time).toFixed(2));
  }

  static calculateAmortizationSchedule(
    principal: number,
    rate: number,
    termInYears: number,
    frequency: RepaymentFrequency
  ): PaymentScheduleEntry[] {
    if (principal <= 0 || rate < 0 || termInYears <= 0) {
      throw new Error('Invalid parameters: principal and term must be positive, rate must be non-negative');
    }

    const periodsPerYear = this.getPeriodsPerYear(frequency);
    const totalPeriods = Math.floor(termInYears * periodsPerYear);
    const periodicRate = (rate / 100) / periodsPerYear;
    
    // Handle edge case of 0% interest rate
    const payment = rate === 0 
      ? Number((principal / totalPeriods).toFixed(2))
      : Number((principal * (
          periodicRate * Math.pow(1 + periodicRate, totalPeriods)
        ) / (
          Math.pow(1 + periodicRate, totalPeriods) - 1
        )).toFixed(2));

    let balance = principal;
    const schedule: PaymentScheduleEntry[] = [];
    const startDate = new Date();

    for (let period = 1; period <= totalPeriods; period++) {
      const interestPayment = Number((balance * periodicRate).toFixed(2));
      const principalPayment = Number((payment - interestPayment).toFixed(2));
      balance = Number((balance - principalPayment).toFixed(2));

      const paymentDate = new Date(startDate);
      switch (frequency) {
        case RepaymentFrequency.Daily:
          paymentDate.setDate(paymentDate.getDate() + period);
          break;
        case RepaymentFrequency.Weekly:
          paymentDate.setDate(paymentDate.getDate() + (period * 7));
          break;
        case RepaymentFrequency.Monthly:
          paymentDate.setMonth(paymentDate.getMonth() + period);
          break;
        case RepaymentFrequency.Yearly:
          paymentDate.setFullYear(paymentDate.getFullYear() + period);
          break;
      }

      schedule.push({
        date: paymentDate,
        payment,
        principalComponent: principalPayment,
        interestComponent: interestPayment,
        remainingBalance: Math.max(0, balance)
      });
    }

    return schedule;
  }

  static calculateEarlyPayoffSavings(
    currentBalance: number,
    rate: number,
    remainingTerm: number,
    frequency: RepaymentFrequency,
    earlyPayoffDate: Date,
    originalPaymentSchedule: PaymentScheduleEntry[]
  ): number {
    // Validate inputs
    if (currentBalance <= 0 || rate < 0 || remainingTerm <= 0) {
      throw new Error('Invalid parameters: currentBalance and remainingTerm must be positive, rate must be non-negative');
    }

    const totalInterestInSchedule = originalPaymentSchedule.reduce(
      (sum, payment) => sum + payment.interestComponent, 
      0
    );
    
    const earlyPayoffInterest = this.calculateCompoundInterest(
      currentBalance,
      rate,
      remainingTerm,
      frequency
    );
    
    return Number((totalInterestInSchedule - earlyPayoffInterest).toFixed(2));
  }
}