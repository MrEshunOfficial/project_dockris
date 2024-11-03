import React, { useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";
import { AppDispatch } from "@/store";
import { useDispatch } from "react-redux";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createUserProfile,
  IUserProfile,
  updateUserProfile,
} from "@/store/userProfileSlice";
import { Toaster } from "@/components/ui/toaster";
import {
  Book,
  CalendarIcon,
  Globe,
  Heart,
  Loader2,
  MapPin,
  Mail,
  Phone,
  User,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import * as z from "zod";
import { profileBaseSchema } from "@/store/type/profileSchema";

type FormStep = {
  title: string;
  icon: React.ReactNode;
};

type UserProfileInput = z.infer<typeof profileBaseSchema>;

interface ProfileFormProps {
  userProfileEdit: IUserProfile | null;
  setEditForm: React.Dispatch<React.SetStateAction<boolean>>;
}

interface FormFieldProps {
  name: keyof UserProfileInput | any;
  label: string;
  icon: React.ReactNode;
  type?: string;
  control: any;
  errors: any;
  required?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  icon,
  type = "text",
  control,
  errors,
  required = false,
}) => (
  <div className="space-y-2">
    <Label htmlFor={name} className="flex items-center gap-2">
      {icon}
      {label}
      {required && <span className="text-red-500">*</span>}
    </Label>
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Input
          {...field}
          id={name}
          type={type}
          className={`w-full ${errors[name] ? "border-red-500" : ""}`}
          value={
            type === "date" && field.value instanceof Date
              ? field.value.toISOString().split("T")[0]
              : field.value || ""
          }
          onChange={(e) =>
            type === "date"
              ? field.onChange(new Date(e.target.value))
              : field.onChange(e.target.value)
          }
        />
      )}
    />
    {errors[name] && (
      <p className="text-red-500 text-sm">{errors[name].message}</p>
    )}
  </div>
);

// Steps remain the same...
const steps: FormStep[] = [
  {
    title: "Personal Info",
    icon: <User size={18} />,
  },
  {
    title: "Contact & Location",
    icon: <Phone size={18} />,
  },
  {
    title: "Professional & Interests",
    icon: <Book size={18} />,
  },
  {
    title: "Social & Additional",
    icon: <Globe size={18} />,
  },
];

const ProfileForm: React.FC<ProfileFormProps> = ({
  userProfileEdit,
  setEditForm,
}) => {
  const [currentStep, setCurrentStep] = React.useState<number>(0);
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const { toast } = useToast();
  const dispatch = useDispatch<AppDispatch>();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid, dirtyFields },
    setValue,
    reset,
    trigger,
    watch,
  } = useForm<UserProfileInput>({
    resolver: zodResolver(profileBaseSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      userId: "",
      fullName: { firstName: "", lastName: "" },
      username: "",
      dateOfBirth: new Date(),
      gender: "Prefer not to say",
      phoneNumber: "",
      country: "",
      skills: [],
      interestsHobbies: [],
      occupation: "",
      bio: "",
      socialMediaLinks: {
        twitter: "",
        facebook: "",
        instagram: "",
        other: "",
      },
    },
  });

  // Watch all required fields
  const watchedFields = watch([
    "email",
    "fullName.firstName",
    "fullName.lastName",
    "username",
    "dateOfBirth",
    "gender",
    "phoneNumber",
    "country",
    "occupation",
  ]);

  // Memoized function to check if required fields are filled
  const isRequiredFieldsFilled = React.useMemo(() => {
    return watchedFields.every((field) => {
      if (field === null || field === undefined) return false;
      if (typeof field === "object" && Object.keys(field).length === 0)
        return false;
      if (field === "") return false;
      return true;
    });
  }, [watchedFields]);

  // Effect to validate form when switching steps
  useEffect(() => {
    trigger();
  }, [currentStep, trigger]);

  // Effect to populate form when editing
  useEffect(() => {
    if (userProfileEdit) {
      const formData = {
        ...userProfileEdit,
        dateOfBirth: new Date(userProfileEdit.dateOfBirth),
        skills: userProfileEdit.skills || [],
        interestsHobbies: userProfileEdit.interestsHobbies || [],
        fullName: {
          firstName: userProfileEdit.fullName?.firstName || "",
          lastName: userProfileEdit.fullName?.lastName || "",
        },
        socialMediaLinks: {
          twitter: userProfileEdit.socialMediaLinks?.twitter || "",
          facebook: userProfileEdit.socialMediaLinks?.facebook || "",
          instagram: userProfileEdit.socialMediaLinks?.instagram || "",
          other: userProfileEdit.socialMediaLinks?.other || "",
        },
      };
      reset(formData);
    }
  }, [userProfileEdit, reset]);

  const onSubmit = async (data: UserProfileInput) => {
    try {
      if (!userId) throw new Error("User ID is not available");

      const profileData = {
        ...data,
        dateOfBirth: new Date(data.dateOfBirth),
        userId,
      };

      if (userProfileEdit) {
        // Include the _id when updating
        await dispatch(
          updateUserProfile({
            ...profileData,
            _id: userProfileEdit._id, // Make sure to include the original document ID
            userId,
          })
        ).unwrap();
      } else {
        await dispatch(createUserProfile(profileData)).unwrap();
      }

      toast({
        title: userProfileEdit ? "Profile Updated" : "Profile Added",
        description: `Your profile has been successfully ${
          userProfileEdit ? "updated" : "added"
        }.`,
        duration: 3000,
      });

      reset();
      setEditForm(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "Failed to process profile. Please try again.",
        duration: 3000,
        variant: "destructive",
      });
    }
  };

  // Field arrays remain the same...
  const {
    fields: skillFields,
    append: appendSkill,
    remove: removeSkill,
  } = useFieldArray({
    control,
    name: "skills",
  });

  const {
    fields: hobbyFields,
    append: appendHobby,
    remove: removeHobby,
  } = useFieldArray({
    control,
    name: "interestsHobbies",
  });

  // Modified renderStepContent with required field indicators
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            <FormField
              name="email"
              label="Email"
              icon={<Mail size={18} />}
              type="email"
              control={control}
              errors={errors}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                name="fullName.firstName"
                label="First Name"
                icon={<User size={18} />}
                control={control}
                errors={errors}
                required
              />
              <FormField
                name="fullName.lastName"
                label="Last Name"
                icon={<User size={18} />}
                control={control}
                errors={errors}
                required
              />
            </div>
            <FormField
              name="username"
              label="Username"
              icon={<User size={18} />}
              control={control}
              errors={errors}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="dateOfBirth"
                  className="flex items-center gap-2"
                >
                  <CalendarIcon size={18} />
                  Date of Birth
                  <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="dateOfBirth"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="date"
                      id="dateOfBirth"
                      className={`w-full ${
                        errors.dateOfBirth ? "border-red-500" : ""
                      }`}
                      value={
                        field.value instanceof Date
                          ? field.value.toLocaleString().split("T")[0]
                          : ""
                      }
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                    />
                  )}
                />
                {errors.dateOfBirth && (
                  <p className="text-red-500 text-sm">
                    {errors.dateOfBirth.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender" className="flex items-center gap-2">
                  <User size={18} />
                  Gender
                  <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Non-binary">Non-binary</SelectItem>
                        <SelectItem value="Prefer not to say">
                          Prefer not to say
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                name="phoneNumber"
                label="Phone Number"
                icon={<Phone size={18} />}
                type="tel"
                control={control}
                errors={errors}
                required
              />
              <FormField
                name="country"
                label="Country"
                icon={<MapPin size={18} />}
                control={control}
                errors={errors}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio" className="flex items-center gap-2">
                <Book size={18} />
                Bio
              </Label>
              <Controller
                name="bio"
                control={control}
                render={({ field }) => (
                  <Textarea {...field} id="bio" rows={4} className="w-full" />
                )}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <FormField
              name="occupation"
              label="Occupation"
              icon={<Book size={18} />}
              control={control}
              errors={errors}
              required
            />
            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <Book size={18} />
                Skills
              </Label>
              {skillFields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <Controller
                    name={`skills.${index}`}
                    control={control}
                    render={({ field }) => (
                      <Input {...field} className="flex-grow" />
                    )}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeSkill(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => appendSkill("")}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Skill
              </Button>
            </div>
            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <Heart size={18} />
                Interests & Hobbies
              </Label>
              {hobbyFields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <Controller
                    name={`interestsHobbies.${index}`}
                    control={control}
                    render={({ field }) => (
                      <Input {...field} className="flex-grow" />
                    )}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeHobby(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => appendHobby("")}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Hobby
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="mb-4">
              <p className="text-sm text-gray-500 italic">
                All social media links are optional
              </p>
            </div>
            <FormField
              name="socialMediaLinks.twitter"
              label="Twitter"
              icon={<Globe size={18} />}
              type="url"
              control={control}
              errors={errors}
            />
            <FormField
              name="socialMediaLinks.facebook"
              label="Facebook"
              icon={<Globe size={18} />}
              type="url"
              control={control}
              errors={errors}
            />
            <FormField
              name="socialMediaLinks.instagram"
              label="Instagram"
              icon={<Globe size={18} />}
              type="url"
              control={control}
              errors={errors}
            />
            <FormField
              name="socialMediaLinks.other"
              label="Other Social Media"
              icon={<Globe size={18} />}
              type="url"
              control={control}
              errors={errors}
            />
          </div>
        );

      default:
        return null;
    }
  };

  // Rest of the component remains the same...
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardContent className="p-6">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div key={step.title} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    index <= currentStep
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {index < currentStep ? <CheckCircle2 size={20} /> : step.icon}
                </div>
                <p
                  className={`text-sm mt-2 ${
                    index <= currentStep ? "text-blue-500" : "text-gray-500"
                  }`}
                >
                  {step.title}
                </p>
              </div>
            ))}
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderStepContent(currentStep)}
            </motion.div>
          </AnimatePresence>

          <div className="my-4 flex items-center justify-center gap-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2"
              onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button
              type="button"
              className="flex-1 flex items-center justify-center gap-2"
              onClick={() =>
                setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))
              }
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !isValid || !isRequiredFieldsFilled}
            className="w-full flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : !isRequiredFieldsFilled ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Please Fill All Required Fields
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Submit
              </>
            )}
          </Button>
        </form>
      </CardContent>
      <Toaster />
    </Card>
  );
};

export default ProfileForm;
