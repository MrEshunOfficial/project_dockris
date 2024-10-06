import { connect } from '@/dbconfigue/dbConfigue';
import expenseModel from '@/models/financeModel/expenseModel';
import { NextRequest, NextResponse } from 'next/server';

// Get single expense by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connect();
    const { id } = params; // Get the id from the dynamic route
    const expense = await expenseModel.findById(id);
    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }
    return NextResponse.json(expense);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch expense' }, { status: 500 });
  }
}

// Update expense by ID
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connect();
    const body = await request.json();
    const { id } = params; // Get the id from the dynamic route

    // Validate and format body, especially handling sub-expenses if present
    if (body.subExpenses && Array.isArray(body.subExpenses)) {
      body.subExpenses = body.subExpenses.map((subExpense: { amount: any; dateSpent: string | number | Date; }) => ({
        ...subExpense,
        amount: subExpense.amount || 0, // Ensure amount is a number
        dateSpent: subExpense.dateSpent ? new Date(subExpense.dateSpent) : new Date(), // Ensure valid date
      }));
    }

    const updatedExpense = await expenseModel.findByIdAndUpdate(id, body, { new: true });
    if (!updatedExpense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }
    return NextResponse.json(updatedExpense);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 });
  }
}

// Delete expense by ID
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connect();
    const { id } = params; // Get the id from the dynamic route
    const deletedExpense = await expenseModel.findByIdAndDelete(id);
    if (!deletedExpense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
  }
}
