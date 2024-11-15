"use client";
import { Plus, Trash } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "~/lib/use-toast";
import { type TRPCError } from "@trpc/server";
import { type RouterInputs } from "@kedai/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

interface StoreData {
  createdAt: Date;
  updatedAt: Date | null;
  id: number;
  name: string;
  isOpen: boolean | null;
  slug: string;
  storeMenus: string[];
}

export default function DashboardStorePageContent() {
  const router = useRouter();
  const { toast } = useToast();
  const [newStoreName, setNewStoreName] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const {
    data,
    error: storeDataError,
    refetch: refetchStore,
    isFetching: fetchingStores,
  } = api.store.getAllStoreWithMenu.useQuery();

  const { mutateAsync: addStore } = api.store.addStore.useMutation();

  const { mutateAsync: deleteStore } = api.store.deleteStore.useMutation();

  useEffect(() => {
    if (storeDataError?.data?.code === "FORBIDDEN") {
      router.push("/dashboard/organization");
    }
  }, [storeDataError?.data?.code, router]);

  const storesData: StoreData[] = useMemo(() => {
    if (!data) {
      return [];
    }
    const storeData = data.map((store) => ({
      ...store,
      storeMenus: store.storeMenus.map((menu) => menu.menu.menuDetails.name),
    }));
    return storeData;
  }, [data]);

  const onAddStoreClick = () => {
    const storeDetails: RouterInputs["store"]["addStore"] = {
      name: newStoreName,
    };
    addStore(storeDetails)
      .then(async (storeData) => {
        toast({
          title: "Success!",
          description: `You have successfully added a new store ${storeData.name}.`,
        });
        setNewStoreName("");
        setPopoverOpen(false);
        await refetchStore();
      })
      .catch((error: TRPCError) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      });
  };

  const onDeleteStore = (storeId: number) => {
    deleteStore({
      id: storeId,
    })
      .then(async () => {
        toast({
          title: "Removed store",
          description: "You have successfully removed the store.",
        });
        await refetchStore();
      })
      .catch((error: TRPCError) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      });
  };

  const renderStores = () => {
    if (fetchingStores && !data) {
      return (
        <div className="flex flex-wrap gap-4">
          <Skeleton className="min-w-[600px] max-w-[800px] flex-grow bg-sidebar" />
        </div>
      );
    }

    if (data && data.length === 0) {
      return (
        <div className="flex justify-center text-center">
          Your organization currently have no store.
        </div>
      );
    }

    return (
      <div className="flex flex-wrap gap-4">
        {storesData.map((storeData) => (
          <Store
            key={storeData.id}
            storeData={storeData}
            onDeleteStore={onDeleteStore}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <Popover
        open={popoverOpen}
        onOpenChange={(value) => setPopoverOpen(value)}
      >
        <div className="mb-6 flex flex-row justify-between rounded-lg bg-sidebar p-4 shadow">
          <h2 className="text-lg font-semibold">Stores</h2>
          <PopoverTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Store
            </Button>
          </PopoverTrigger>
        </div>
        <PopoverContent className="w-80">
          <Input
            className="mb-4"
            value={newStoreName}
            onChange={(event) => setNewStoreName(event.target.value)}
          />
          <Button onClick={onAddStoreClick}>Confirm Store Name</Button>
        </PopoverContent>
      </Popover>
      <ScrollArea className="h-[calc(100vh-200px)] justify-center">
        {renderStores()}
      </ScrollArea>
    </>
  );
}

function Store({
  storeData,
  onDeleteStore,
}: {
  storeData: StoreData;
  onDeleteStore: (storeId: number) => void;
}) {
  return (
    <Card className="min-w-[600px] max-w-[800px] flex-grow bg-sidebar">
      <CardHeader className="flex flex-row justify-between">
        <div>
          <CardTitle>{storeData.name}</CardTitle>
          <CardDescription>{storeData.slug}</CardDescription>
        </div>
        <div className="pl-4">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDeleteStore(storeData.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-row justify-between">
        <div className="flex flex-row justify-between">
          <div className="ml-4">
            {storeData.storeMenus.map((menu) => (
              <p key={menu}>{menu}</p>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
