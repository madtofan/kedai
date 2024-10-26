import { Plus, Send, Trash } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { api } from "~/trpc/react";
import { useMemo, useState } from "react";
import { Spinner } from "~/components/ui/spinner";
import { useToast } from "~/lib/use-toast";
import { type TRPCError } from "@trpc/server";
import { redirect } from "~/navigation";
import ConfirmationDialog from "~/components/confirmation-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Input } from "~/components/ui/input";

export default function DashboardOrganizationContent() {
  const [inviteUserEmail, setInviteUserEmail] = useState("");

  const { toast } = useToast();

  const { data: organization, isLoading: loadingOrganization } =
    api.organization.getOrganization.useQuery();

  const users = useMemo(() => {
    return (
      organization?.organizationRoles.flatMap((role) =>
        role.users.map((user) => ({ ...user, role: role.name })),
      ) ?? []
    );
  }, [organization]);

  const { mutateAsync: inviteUser } = api.user.inviteUser.useMutation();

  const { mutateAsync: deleteUser } = api.user.removeUser.useMutation();

  const { mutateAsync: deleteOrganization } =
    api.organization.deleteOrganization.useMutation();

  const handleInviteUser = (userEmail: string) => {
    inviteUser({ email: userEmail })
      .then(() => {
        toast({
          title: "Invited User",
          description: `Successfully invited ${userEmail}.`,
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

  const handleDeleteUser = (userId: number) => {
    deleteUser({ userId })
      .then(() => {
        toast({
          title: "Removed User",
          description: `Successfully removed user.`,
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

  const handleDeleteOrganization = () => {
    deleteOrganization()
      .then(() => {
        toast({
          title: "Deleted organization",
          description: `Successfully deleted organization.`,
        });
        redirect("/:locale/no-organization");
      })
      .catch((error: TRPCError) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      });
  };

  if (loadingOrganization || !organization) {
    return <Spinner />;
  }

  return (
    <>
      <div className="mb-6 rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold">{organization.name}</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2"></div>
        <div className="flex items-end">
          <Popover>
            <PopoverTrigger asChild>
              <Button className="mr-2 h-4 w-4">
                <Send className="mr-2 h-4 w-4" />
                Invite User
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <Input
                value={inviteUserEmail}
                onChange={(event) => setInviteUserEmail(event.target.value)}
              />
              <Button onClick={() => handleInviteUser(inviteUserEmail)}>
                Invite
              </Button>
            </PopoverContent>
          </Popover>
          <Button className="mr-2 h-4 w-4">
            <Plus className="mr-2 h-4 w-4" />
            Add Role
          </Button>
          <ConfirmationDialog
            title="Are you sure you want to delete this organization?"
            description="This action cannot be undone. This will permanently delete your organization and remove your data from our servers."
            onSubmit={handleDeleteOrganization}
            triggerButton={
              <Button className="mr-2 h-4 w-4">
                <Trash className="mr-2 h-4 w-4" />
                Delete Organization
              </Button>
            }
            cancelText="Cancel"
          />
        </div>
      </div>
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <h2 className="mb-4 text-lg font-semibold">Organization Members</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.userEmail}</TableCell>
                <TableCell>{user.fullName}</TableCell>
                <TableCell>${user.role}</TableCell>
                <TableCell>
                  <ConfirmationDialog
                    title="Confirm user removal?"
                    description="This action cannot be undone. This user will be removed from your and no longer associated with your organization."
                    onSubmit={() => handleDeleteUser(user.id)}
                    triggerButton={
                      <Button variant="destructive" size="sm">
                        <Trash className="h-4 w-4" />
                      </Button>
                    }
                    cancelText="Cancel"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}