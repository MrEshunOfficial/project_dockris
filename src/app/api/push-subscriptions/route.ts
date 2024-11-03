// app/api/push-subscriptions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connect } from "@/dbconfigue/dbConfigue";
import { auth } from "@/auth";
import mongoose from 'mongoose';
import { z } from 'zod';

connect();

const PushSubscriptionSchema = new mongoose.Schema({
  userId: String,
  subscription: Object,
});

const PushSubscription = mongoose.models.PushSubscription || mongoose.model('PushSubscription', PushSubscriptionSchema);

// Zod Schema for validation
const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Validate the subscription data using Zod
    const parseResult = subscriptionSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: 'Invalid subscription data', details: parseResult.error.errors }, { status: 400 });
    }

    const subscription = body;
    await PushSubscription.findOneAndUpdate(
      { userId },
      { userId, subscription },
      { upsert: true, new: true }
    );

    return NextResponse.json({ message: 'Subscription saved' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await PushSubscription.deleteOne({ userId });
    return NextResponse.json({ message: 'Subscription removed' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 });
  }
}

