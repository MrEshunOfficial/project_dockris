//api/features/financial/income
import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbconfigue/dbConfigue';
import incomeModel, { IncomeDocument } from '@/models/financeModel/incomeModel';

// Ensure database connection is established
connect();

// Helper function to validate income request body
function validateIncomeData(data: Partial<IncomeDocument>) {
  // Define the required fields as an array of keys from IncomeDocument
  const requiredFields: (keyof IncomeDocument)[] = [
    'userId', 'name', 'sources', 'amount', 'dateReceived'
  ];

  // Iterate over the required fields and check if they're missing
  for (const field of requiredFields) {
    if (!data[field]) {
      return `Missing required field: ${field}`;
    }
  }

  // Check for other specific validation
  if (data.amount && data.amount < 0) {
    return 'Amount must be a positive number';
  }

  return null; // No errors
}


// GET Route Handler
export async function GET(request: NextRequest) {
  try {
    const incomeData = await incomeModel.find();
    return NextResponse.json({ success: true, data: incomeData });
  } catch (error) {
    console.error('GET Income Error:', error);  // Log the error for debugging
    return NextResponse.json({ success: false, message: 'Failed to retrieve income data' }, { status: 500 });
  }
}

// POST Route Handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    const validationError = validateIncomeData(body);
    if (validationError) {
      return NextResponse.json({ success: false, message: validationError }, { status: 422 });
    }

    // Create new income entry
    const newIncome = new incomeModel(body);
    await newIncome.save();

    return NextResponse.json({ success: true, data: newIncome }, { status: 201 });
  } catch (error) {
    console.error('POST Income Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to create income entry' }, { status: 500 });
  }
}
