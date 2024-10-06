import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbconfigue/dbConfigue';
import incomeModel from '@/models/financeModel/incomeModel';
import mongoose from 'mongoose';

// Ensure database connection is established
connect();

// Fetch specific income document
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Validate the provided id
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, message: 'Invalid income ID' }, { status: 400 });
    }

    const incomeData = await incomeModel.findById(params.id);
    
    if (!incomeData) {
      return NextResponse.json({ success: false, message: 'Income not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: incomeData }, { status: 200 });

  } catch (error) {
    console.error('Error fetching income:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching income', error: (error as Error).message || 'An error occurred' },
      { status: 500 }
    )
  }
}

// Update specific income document
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Validate the provided id
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, message: 'Invalid income ID' }, { status: 400 });
    }

    const data = await req.json();

    // Validate required fields
    const requiredFields = ['name', 'sources', 'amount', 'dateReceived'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ success: false, message: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    const updatedIncome = await incomeModel.findByIdAndUpdate(params.id, data, { new: true });

    if (!updatedIncome) {
      return NextResponse.json({ success: false, message: 'Income not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedIncome }, { status: 200 });

  } catch (error) {
    console.error('Error updating income:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching income', error: (error as Error).message || 'An error occurred' },
      { status: 500 }
    )
  }
}

// Delete specific income document
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Validate the provided id
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, message: 'Invalid income ID' }, { status: 400 });
    }

    const deletedIncome = await incomeModel.findByIdAndDelete(params.id);

    if (!deletedIncome) {
      return NextResponse.json({ success: false, message: 'Income not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Income deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error deleting income:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching income', error: (error as Error).message || 'An error occurred' },
      { status: 500 }
    )
  }
}
