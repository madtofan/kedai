"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus, Check, X } from "lucide-react";
import { useToast } from "~/lib/use-toast";
import { api } from "~/trpc/react";
import { type TRPCError } from "@trpc/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Spinner } from "~/components/ui/spinner";
import { client } from "~/lib/auth-client";

export default function NoOrganization() {
  const [organizationName, setOrganizationName] = useState("");
  const [storeName, setStoreName] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  const { mutateAsync: createOrganization } =
    api.organization.createOrganization.useMutation();

  const handleCreateOrganization = () => {
    createOrganization({
      organizationName,
      storeName,
    })
      .then(() => {
        toast({
          title: "Organization Created",
          description: `Your organization "${organizationName}" has been created successfully.`,
        });
        router.replace("/dashboard");
      })
      .catch((error: TRPCError) => {
        console.log("error", error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      });
  };

  return (
    <div className="container mx-auto max-w-3xl p-4">
      <h1 className="mb-6 text-3xl font-bold">
        Welcome to Kedai Solutions Point of Sale System
      </h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create Your Organization</CardTitle>
          <CardDescription>
            Start managing your restaurant by creating an organization.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="organizationName">Organization Name</Label>
            <Input
              id="organizationName"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
            />
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="storeName">Store Name</Label>
            <Input
              id="storeName"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleCreateOrganization}>
            <Plus className="mr-2 h-4 w-4" /> Create Organization
          </Button>
        </CardFooter>
      </Card>
      <Separator className="my-8" />
      <InvitationCard />
    </div>
  );
}

function InvitationCard() {
  const router = useRouter();
  const { toast } = useToast();

  const { data: invitations } = api.user.getAllInvitations.useQuery();

  const { data: userInformation } = api.user.getCurrentUser.useQuery();

  const { mutateAsync: acceptInvitation } =
    api.user.acceptInvitation.useMutation();

  const { mutateAsync: declineInvitation } =
    api.user.declineInvitation.useMutation();

  useEffect(() => {
    if (userInformation?.activeOrganizationId) {
      router.replace("/dashboard");
    }
  }, [router, userInformation?.organizationRole]);

  const handleAcceptInvitation = (invitationId: string) => {
    acceptInvitation({
      invitationId,
    })
      .then(() => {
        toast({
          title: "Invitation Accepted",
          description: "You have successfully joined the organization.",
        });
        router.replace("/dashboard");
      })
      .catch((error: TRPCError) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      });
  };

  const handleDeclineInvitation = (invitationId: number) => {
    declineInvitation({
      invitationId,
    })
      .then(() => {
        toast({
          title: "Invitation Declined",
          description: "You have declined the organization invitation.",
        });
      })
      .catch((error: TRPCError) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      });
  };

  if (invitations === undefined) {
    return <Spinner />;
  }

  return (
    <>
      <h2 className="mb-4 text-2xl font-semibold">Organization Invitations</h2>
      {invitations.length > 0 ? (
        <div className="space-y-4">
          {invitations.map((invitation) => (
            <Card key={invitation.id}>
              <CardHeader>
                <CardTitle>{invitation.organization.name}</CardTitle>
                <CardDescription>
                  Invited by {invitation.createdBy.fullName}
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handleDeclineInvitation(invitation.id)}
                >
                  <X className="mr-2 h-4 w-4" /> Decline
                </Button>
                <Button onClick={() => handleAcceptInvitation(invitation.id)}>
                  <Check className="mr-2 h-4 w-4" /> Accept
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-6 text-center">
            <p className="text-muted-foreground">
              You have no pending invitations.
            </p>
          </CardContent>
        </Card>
      )}
    </>
  );
}
