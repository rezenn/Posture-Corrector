// src/pages/MyProfile.tsx
import React, { useLayoutEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateUserSchema } from './../schemas/updateUserSchema.ts';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "../components/ui/alert-dialog";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "../components/ui/avatar";
import SideNavbar from "../components/sidenavbar";
import { updateProfileDetails, uploadUserProfilePicture, deleteUser } from './../api/Api.ts';


const MyProfile = () => {
  const { currentUser } = useSelector((state: any) => state.user);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof updateUserSchema>>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      fullName: "",
      username: "",
      email: "",
      contact: "",
    },
  });

  useLayoutEffect(() => {
    if (currentUser) {
      setValue("fullName", currentUser.fullName);
      setValue("username", currentUser.username);
      setValue("email", currentUser.email);
      setValue("contact", currentUser.contact);
      setPreviewUrl(currentUser.avatarUrl || "");
    }
  }, [currentUser, setValue]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const onSubmit = async (data: z.infer<typeof updateUserSchema>) => {
    try {
      const formData = new FormData();
      formData.append("fullName", data.fullName);
      formData.append("username", data.username);
      formData.append("email", data.email);
      formData.append("constant", data.contact);
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      await axios.put("/api/user/profile", formData, {
        headers: {
          Authorization: `Bearer ${currentUser?.token}`,
        },
      });

      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update profile");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await axios.delete("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${currentUser?.token}`,
        },
      });
      alert("Account deleted");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete account");
    }
  };
  

  return (
    <section className="flex min-h-screen">
      <SideNavbar />

      <div className="flex-grow flex items-center justify-center bg-gray-100 px-4 py-8">
        <Card className="w-full max-w-md shadow-md border rounded-lg bg-white">
          <CardHeader>
            <CardTitle className="text-center text-xl font-semibold">My Profile</CardTitle>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-5">
              {/* Avatar */}
              <div className="flex flex-col items-center space-y-2">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={previewUrl || undefined} />
                  <AvatarFallback>
                    {currentUser?.fullName?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm font-medium">
                  Change Avatar
                </div>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full"
                />
              </div>

              {/* Full Name */}
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" {...register("fullName")} />
                {errors.fullName && (
                  <p className="text-sm text-red-500">{errors.fullName.message}</p>
                )}
              </div>

              {/* Username */}
              <div>
                <Label htmlFor="username">Username</Label>
                <Input id="username" {...register("username")} />
                {errors.username && (
                  <p className="text-sm text-red-500">{errors.username.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" {...register("email")} />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* Contact */}
              <div>
                <Label htmlFor="email">Contact</Label>
                <Input id="contact" {...register("contact")} />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Update Profile</Button>
              <Button type="button" variant="destructive" onClick={() => setOpenDeleteDialog(true)}>
                Delete Account
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Delete Dialog */}
        <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete your account?</AlertDialogTitle>
              <AlertDialogDescription>This action is irreversible.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </section>
  );
};

export default MyProfile;
