export function sendOrganizationInvitation({
  email,
  invitedByUsername,
  invitedByEmail,
  teamName,
  inviteLink,
}: {
  email: string;
  invitedByUsername: string;
  invitedByEmail: string;
  teamName: string;
  inviteLink: string;
}) {
  console.log("Sending invitation email", {
    email,
    invitedByUsername,
    invitedByEmail,
    teamName,
    inviteLink,
  });
  return true;
}
