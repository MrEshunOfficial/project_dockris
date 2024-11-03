import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  MailIcon,
  GlobeIcon,
  BriefcaseIcon,
  MapPinIcon,
} from "lucide-react";
import moment from "moment";
import Link from "next/link";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import { IUserProfile } from "@/store/userProfileSlice";

interface ProfileDetailsProps {
  profile: IUserProfile;
}

const ProfileDetails: React.FC<ProfileDetailsProps> = ({ profile }) => {
  const calculateNextBirthday = (dateOfBirth: Date) => {
    const now = moment();
    const currentYear = now.year();
    let nextBirthday = moment(dateOfBirth).year(currentYear);

    // If the birthday this year has already passed, move to the next year
    if (now.isAfter(nextBirthday)) {
      nextBirthday = nextBirthday.add(1, "year");
    }

    const daysLeft = nextBirthday.diff(now, "days");

    return {
      formattedDate: nextBirthday.format("dddd, MMMM Do, YYYY"),
      daysLeft,
    };
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl border-gray-300 dark:border-gray-700">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProfileSection
              icon={<CalendarIcon className="w-5 h-5" />}
              title="Personal Info"
            >
              <ProfileField
                label="Date of Birth"
                value={moment(profile.dateOfBirth).format(
                  "dddd, MMMM Do, YYYY"
                )}
              />
              <ProfileField
                label="Next Birthday"
                value={`${
                  calculateNextBirthday(profile.dateOfBirth).formattedDate
                } (${
                  calculateNextBirthday(profile.dateOfBirth).daysLeft
                } days left)`}
              />

              <ProfileField label="Gender" value={profile.gender} />
            </ProfileSection>
            <ProfileSection
              icon={<MailIcon className="w-5 h-5" />}
              title="Contact"
            >
              <ProfileField label="Email" value={profile.email} />
              <ProfileField label="Phone" value={profile.phoneNumber} />
            </ProfileSection>
            <ProfileSection
              icon={<BriefcaseIcon className="w-5 h-5" />}
              title="Professional"
            >
              <ProfileField label="Occupation" value={profile.occupation} />
            </ProfileSection>
            <ProfileSection
              icon={<MapPinIcon className="w-5 h-5" />}
              title="Location"
            >
              <ProfileField label="Country" value={profile.country} />
            </ProfileSection>
          </div>
        </div>
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
            About Me
          </h3>
          <p className="text-gray-600 dark:text-gray-400">{profile.bio}</p>
        </div>
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Skills and Expertise
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.skills.slice(0, 5).map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-sm">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Interests & Hobbies
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.interestsHobbies.map((hobby, index) => (
              <Badge key={index} variant="outline" className="text-sm">
                {hobby}
              </Badge>
            ))}
          </div>
        </div>
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Social Media
          </h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(profile.socialMediaLinks || {}).map(
              ([platform, link]) =>
                link && (
                  <SocialLink key={platform} href={link} platform={platform} />
                )
            )}
          </div>
        </div>
        <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>
            Member since: {moment(profile.createdAt).format("MMMM Do YYYY")}
          </p>
          <p>
            Last updated:
            {moment(profile.updatedAt).format("MMMM Do YYYY, h:mm a")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

const ProfileSection: React.FC<{
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}> = ({ icon, title, children }) => (
  <div className="space-y-2">
    <div className="flex items-center space-x-2">
      {icon}
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
        {title}
      </h3>
    </div>
    {children}
  </div>
);

const ProfileField: React.FC<{
  label: string;
  value?: string;
  isLink?: boolean;
}> = ({ label, value, isLink }) => {
  if (!value) return null;
  return (
    <div className="flex flex-col">
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {label}
      </span>
      {isLink ? (
        <Link
          href={value}
          className="text-blue-600 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {value}
        </Link>
      ) : (
        <span className="text-gray-700 dark:text-gray-300">{value}</span>
      )}
    </div>
  );
};

const SocialLink: React.FC<{ href: string; platform: string }> = ({
  href,
  platform,
}) => {
  const getIconForPlatform = (platform: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      twitter: <FaTwitter size={18} />,
      facebook: <FaFacebook size={18} />,
      instagram: <FaInstagram size={18} />,
      other: <GlobeIcon size={18} />,
    };
    return icons[platform.toLowerCase()];
  };

  return (
    <Link
      href={href}
      className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      target="_blank"
      rel="noopener noreferrer"
    >
      {getIconForPlatform(platform)}
      <span>{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
    </Link>
  );
};

export default ProfileDetails;
