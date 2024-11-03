import { NextRequest, NextResponse } from 'next/server';
import { connect } from "@/dbconfigue/dbConfigue";
import { auth } from "@/auth";
import mongoose from 'mongoose';
import { z } from 'zod';
import webpush from 'web-push';

connect();

const PushSubscriptionSchema = new mongoose.Schema({
  userId: String,
  subscription: Object,
});

const PushSubscription = mongoose.models.PushSubscription || mongoose.model('PushSubscription', PushSubscriptionSchema);

// Zod Schema for validation
const notificationSchema = z.object({
  title: z.string(),
  body: z.string(),
  icon: z.string().optional(),
  badge: z.string().optional(),
  vibrate: z.array(z.number()).optional(),
  data: z.record(z.unknown()).optional(),
});

// Configure web-push
webpush.setVapidDetails(
  'mailto:PlanZenInc.mail.org',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Validate the notification data using Zod
    const parseResult = notificationSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: 'Invalid notification data', details: parseResult.error.errors }, { status: 400 });
    }

    const notification = parseResult.data;

    // Fetch the user's subscription
    const subscriptionDoc = await PushSubscription.findOne({ userId });
    if (!subscriptionDoc) {
      return NextResponse.json({ error: 'No subscription found for this user' }, { status: 404 });
    }

    // Send the push notification
    await webpush.sendNotification(subscriptionDoc.subscription, JSON.stringify(notification));

    return NextResponse.json({ message: 'Push notification sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error sending push notification:', error);
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 });
  }
}