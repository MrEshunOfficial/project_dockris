import { connect } from '@/dbconfigue/dbConfigue';
import expenseModel from '@/models/financeModel/expenseModel';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await connect();
    const expenses = await expenseModel.find({});
    return NextResponse.json(expenses);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connect();
    const body = await request.json();

    // Validate and format sub-expenses if present
    if (body.subExpenses && Array.isArray(body.subExpenses)) {
      body.subExpenses = body.subExpenses.map((subExpense: { amount: any; dateSpent: string | number | Date; }) => ({
        ...subExpense,
        amount: subExpense.amount || 0, // Ensure amount is a valid number
        dateSpent: subExpense.dateSpent ? new Date(subExpense.dateSpent) : new Date(), // Ensure dateSpent is a valid date
      }));
    }

    const newExpense = new expenseModel(body);
    const savedExpense = await newExpense.save();
    return NextResponse.json(savedExpense, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
  }
}
