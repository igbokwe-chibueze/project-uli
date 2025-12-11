// src/app/(protected)/organisations/[organisationId]/members/client.tsx
'use client';

import { useEffect, useState, useTransition } from "react";
import { CheckIcon, CopyIcon, LoaderCircleIcon, RefreshCcw, SendIcon, ShareIcon, UsersIcon } from "lucide-react";

import { InviteExpiryOption, OrgRole } from "@prisma/client";
import { expiryLabels, expiryOptions } from "@/lib/invite-utils";

import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ResponsiveModal } from "@/components/responsive-modal";
import { CardWrapper } from "@/features/auth/components/card-wrapper";

// --- Server actions
import { createAndSendBatchEmailInvitesAction, getOrCreateOrgInviteAction, resetOrgInviteAction } from "@/features/organisations/actions/orgInviteActions";

interface RoleData {
  options: OrgRole[];
  default: OrgRole;
}

interface MembersClientProps {
  id: string;
  roleData: RoleData;
}

export const MembersClient = ({ id: organisationId, roleData }: MembersClientProps) => {
    
    // State to control the guidelines modal
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    
    // Share link state
    const [shareLink, setShareLink] = useState("")
    const [expiryOption, setExpiryOption] = useState<InviteExpiryOption>("DAYS_7");
    const [linkCopied, setLinkCopied] = useState(false)
    
    // Email invite tab
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteMessage, setInviteMessage] = useState("");
    const [selectedRole, setSelectedRole] = useState(roleData.default);

    const [linkLoading, setLinkLoading] = useState(true);          // For first load skeleton
    const [loadedOnce, setLoadedOnce] = useState(false);           // Cache prevention of flicker


    const [isPending, startTransition] = useTransition();

    // Load invite Anytime modal opens
    useEffect(() => {
        if (isInviteOpen) {
            // If we already loaded once, do not show skeleton or blank
            if (loadedOnce) {
            return;
            }

            setLinkLoading(true);

            startTransition(async () => {
                try {
                    const invite = await getOrCreateOrgInviteAction(organisationId);
                    const baseUrl = window.location.origin
                    if (invite?.token) {
                        setShareLink(`${baseUrl}/organisations/${organisationId}/join/${invite.token}`)
                        //setExpiryOption(invite.expiryOption ?? "7DAYS");
                    }
                } catch (err) {
                    console.error("Failed loading invite:", err);
                } finally {
                    setLinkLoading(false);
                    setLoadedOnce(true);
                }
            });
        }
    }, [isInviteOpen, organisationId, loadedOnce]);

    // ✅ Handle copy-to-clipboard
    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareLink)
            setLinkCopied(true)
            setTimeout(() => setLinkCopied(false), 2000)
        } catch (error) {
            console.error("Error:", error)
        }
    }

    // Reset global invite link
    const handleResetInvite = () => {
        startTransition(async () => {
            try {
                const newInvite = await resetOrgInviteAction(organisationId, expiryOption);

                setShareLink(`${window.location.origin}/join/${newInvite.token}`);
            } catch (err) {
                console.error("Invite reset error:", err);
            }
        });
    };

    const handleSendEmailInvite = () => {
        startTransition(async () => {
            try {
            const emails = inviteEmail
                .split(",")
                .map((e) => e.trim().toLowerCase())
                .filter(Boolean);

            if (emails.length === 0) {
                toast.error("Please enter at least one email address.");
                return;
            }

            // Call single batch server action (one request)
            const res = await createAndSendBatchEmailInvitesAction({
                orgId: organisationId,
                emails,
                invitedRole: selectedRole as OrgRole, // if TS complains, cast to OrgRole: selectedRole as OrgRole
                message: inviteMessage || undefined,
                expiryOption, // InviteExpiryOption typed value from your component state
            });

            // res.results contains per-email outcomes
            const failed = res.results.filter((r) => !r.emailSent);
            if (failed.length > 0) {
                console.warn("Some invites failed to send:", failed);
                toast.warning(`${failed.length} of ${emails.length} invites failed to send. Check console for details.`);
            } else {
                toast.success("All invitations sent successfully!");
                setInviteEmail("");
                setInviteMessage("");
            }
            } catch (err) {
                console.error("Batch invite error:", err);
                toast.error("Failed to send invites. Please try again.");
            }
        });
    };

  return (
    <>
        <ResponsiveModal
            open={isInviteOpen}
            onOpenChange={setIsInviteOpen}
            title=""
        >
            <CardWrapper
                headerHeading="Invite New Employees"
                headerIcon={<UsersIcon className="size-6 text-blue-800" />}
                className="lg:w-[620px]"
            >
                <div>
                    <div className="flex flex-col gap-2 text-center sm:text-left">
                        <div className="text-lg leading-none font-semibold">Share Organisation</div>

                        <div className="text-muted-foreground text-sm">
                            Invite members to join the organisation using a link or email invitations.
                        </div>

                        <Tabs defaultValue="link" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="link">Share Link</TabsTrigger>
                                <TabsTrigger value="email">Email Invites</TabsTrigger>
                            </TabsList>

                            {/* ---------------------------------------- */}
                            {/* SHARE LINK TAB */}
                            {/* ---------------------------------------- */}
                            <TabsContent value="link" className="space-y-4">
                                <div>
                                    <Label htmlFor="shareLink">Invitation Link</Label>
                                    {linkLoading ? (
                                        // Skeleton shown ONLY once
                                        <Skeleton className="h-12 w-full " />
                                    ) : (
                                        <div className="flex items-center gap-2 mt-2">
                                            <Input id="shareLink" value={shareLink} readOnly className="flex-1" />
                                            <Button onClick={handleCopyLink} variant="outline">
                                                {linkCopied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
                                            </Button>
                                        </div>
                                    )}
                                    <p className="text-sm text-gray-600 mt-2">
                                        Anyone with this link can accept or reject your invite.
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="linkExpiry">Link Expiry</Label>
                                    <Select
                                        value={expiryOption}
                                        onValueChange={(v) => setExpiryOption(v as InviteExpiryOption)}
                                    >
                                        <SelectTrigger className="mt-2">
                                            <SelectValue placeholder="Select expiry" />
                                        </SelectTrigger>

                                        <SelectContent>
                                            {expiryOptions.map((opt) => (
                                                <SelectItem key={opt} value={opt}>
                                                    {expiryLabels[opt]}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                </div>

                                <Button className="w-full" onClick={handleResetInvite} disabled={isPending}>
                                    <RefreshCcw className="size-4 mr-2"/>
                                    {isPending ? "Updating..." : "Reset Invite Link"}
                                </Button>
                            </TabsContent>

                            {/* ---------------------------------------- */}
                            {/* EMAIL INVITE TAB */}
                            {/* ---------------------------------------- */}
                            <TabsContent value="email" className="space-y-4">
                                <div>
                                    <Label htmlFor="emailInvites">Email Addresses</Label>
                                    <Textarea
                                        id="emailInvites"
                                        placeholder="Enter email addresses separated by commas..."
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        className="mt-2"
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="inviteRole">Default Role</Label>
                                    <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as OrgRole)}>
                                        <SelectTrigger className="mt-2">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roleData.options.map((role) => (
                                                <SelectItem key={role} value={role}>
                                                    {role}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="inviteMessage">Personal Message (Optional)</Label>
                                    <Textarea
                                        id="inviteMessage"
                                        placeholder="Add a personal message to the invitation..."
                                        value={inviteMessage}
                                        onChange={(e) => setInviteMessage(e.target.value)}
                                        className="mt-2"
                                        rows={3}
                                    />
                                </div>

                                <Button className="w-full" onClick={handleSendEmailInvite} disabled={isPending}>
                                    {isPending ? (
                                        <>
                                            <LoaderCircleIcon className="size-4 mr-2 animate-spin" />
                                            <span>Sending...</span>
                                        </>
                                    ) : (
                                        <>
                                            <SendIcon className="size-4 mr-2"/>
                                            <span>Send Email Invite</span>
                                        </>
                                    )}
                                </Button>
                            </TabsContent>

                        </Tabs>
                    </div>
                    
                </div>
            </CardWrapper>
        </ResponsiveModal>

        {/* Later design this page properly, this is just to quickly test the invite button */}
        <div className="flex w-full gap-2">
            <Button variant="secondary" className="flex-1">
                Edit
            </Button>

            <Button variant="outline" className="flex-1"
                onClick={() => setIsInviteOpen(true)}
            >
                <ShareIcon className="size-4 mr-2"/>
                Invite New Members
            </Button>

            <Button variant="default" className="flex-1">
                Export Data
            </Button>
        </div>
    </>
  )
}
