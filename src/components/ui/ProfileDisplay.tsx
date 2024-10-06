import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { LoadingPageSkeleton } from "./LoadingContent";

const ProfileDisplay: React.FC = () => {
  const { currentUser } = useSelector((state: RootState) => state.auth);
  console.log(currentUser);
  if (!currentUser) {
    return <LoadingPageSkeleton />;
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-3">Profile Information</h1>
      <Tabs defaultValue="personal" className="p-0">
        <TabsList>
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="address">Address</TabsTrigger>
          <TabsTrigger value="social">Social Links</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card className="border-none h-[60vh]">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <p>{currentUser.profile?.firstName || currentUser?.name}</p>
                </div>
                <div>
                  <Label>Last Name</Label>
                  <p>{currentUser.profile?.lastName || currentUser?.email}</p>
                </div>
              </div>
              <div>
                <Label>Bio</Label>
                <p>{currentUser.profile?.bio || "No bio provided"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Phone Number</Label>
                  <p>{currentUser.profile?.phoneNumber || "Not provided"}</p>
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <p>
                    {currentUser.profile?.dateOfBirth
                      ? format(new Date(currentUser.profile.dateOfBirth), "PPP")
                      : "Not provided"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="address">
          <Card className="border-none h-[60vh]">
            <CardHeader>
              <CardTitle>Address Information</CardTitle>
              <CardDescription>Your address details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Street Address</Label>
                <p>{currentUser.profile?.address?.street || "Not provided"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>City</Label>
                  <p>{currentUser.profile?.address?.city || "Not provided"}</p>
                </div>
                <div>
                  <Label>State</Label>
                  <p>{currentUser.profile?.address?.state || "Not provided"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Country</Label>
                  <p>
                    {currentUser.profile?.address?.country || "Not provided"}
                  </p>
                </div>
                <div>
                  <Label>Zip Code</Label>
                  <p>
                    {currentUser.profile?.address?.zipCode || "Not provided"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card className="border-none h-[60vh]">
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
              <CardDescription>
                Your connected social media accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Twitter</Label>
                <p>
                  {currentUser.profile?.socialLinks?.twitter || "Not connected"}
                </p>
              </div>
              <div>
                <Label>LinkedIn</Label>
                <p>
                  {currentUser.profile?.socialLinks?.linkedin ||
                    "Not connected"}
                </p>
              </div>
              <div>
                <Label>GitHub</Label>
                <p>
                  {currentUser.profile?.socialLinks?.github || "Not connected"}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card className="border-none h-[60vh]">
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>
                Your notification and communication preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Newsletter</Label>
                <p>
                  {currentUser.profile?.preferences?.newsletter
                    ? "Subscribed"
                    : "Not subscribed"}
                </p>
              </div>
              <div>
                <Label>Notifications</Label>
                <p>
                  {currentUser.profile?.preferences?.notifications
                    ? "Enabled"
                    : "Disabled"}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default ProfileDisplay;
