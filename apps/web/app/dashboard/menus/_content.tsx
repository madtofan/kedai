"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import imageCompression from "browser-image-compression";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ImageOff, Plus, Trash, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "~/components/ui/form";
import Image from "next/image";
import { api } from "~/trpc/react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "~/lib/use-toast";
import { type TRPCError } from "@trpc/server";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { type RouterInputs } from "@kedai/api";
import { betterFetch } from "@better-fetch/fetch";
import { Dialog, DialogContent } from "~/components/ui/dialog";
import { Spinner } from "~/components/ui/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Skeleton } from "~/components/ui/skeleton";

const formSchema = z.object({
  menuGroupId: z.coerce.number().positive(),
  name: z.string().min(1).max(256),
  description: z.string().max(256).optional(),
  image: z
    .object({
      fileSize: z.number(),
      fileType: z.string(),
    })
    .optional(),
  sale: z.coerce.number(),
  cost: z.coerce.number(),
});

interface Menu {
  createdAt: Date;
  updatedAt: Date;
  menuGroupId: number;
  menuGroupName: string;
  menuDetailsId: number;
  id: number;
  name: string;
  sale: string;
  cost: string;
  image: string | null;
  description: string | null;
}

export default function DashboardMenuPageContent() {
  const router = useRouter();
  const { toast } = useToast();
  const [sheetOpen, setSheetOpen] = useState(false);
  const { data: selectOptions, error: menuGroupError } =
    api.menuGroup.getAllMenuGroup.useQuery();
  const {
    data: organizationMenus,
    isFetching: loadingMenus,
    error: menuError,
    refetch: refetchMenus,
  } = api.menu.getMenu.useQuery();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [resetImage, setResetImage] = useState(true);
  const [imageFile, setImageFile] = useState<File>();
  const [loadingImage, setLoadingImage] = useState(false);

  useEffect(() => {
    if (
      menuError?.data?.code === "FORBIDDEN" ||
      menuGroupError?.data?.code === "FORBIDDEN"
    ) {
      router.push("/dashboard/organization");
    }
  }, [menuError?.data?.code, menuGroupError?.data?.code, router]);

  const { mutateAsync: addMenu } = api.menu.addMenu.useMutation();

  const { mutateAsync: deleteMenu } = api.menu.deleteMenu.useMutation();

  const menuItems: Menu[] = useMemo(() => {
    if (!organizationMenus) {
      return [];
    }
    const menus = organizationMenus.flatMap((menuGroup) =>
      menuGroup.menus.map((menu) => ({
        ...menu.menuDetails,
        id: menu.id,
        menuDetailsId: menu.menuDetails.id,
        createdAt: menu.createdAt,
        updatedAt: menu.menuDetails.createdAt,
        menuGroupName: menuGroup.name,
        menuGroupId: menuGroup.id,
      })),
    );
    return menus;
  }, [organizationMenus]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      menuGroupId: undefined,
      name: "",
      description: undefined,
      image: undefined,
      sale: 0.0,
      cost: 0.0,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    let menuDetails: RouterInputs["menu"]["addMenu"] = {
      menuGroupId: values.menuGroupId,
      name: values.name,
      description: values.description,
      sale: `${values.sale}`,
      cost: `${values.cost}`,
    };
    if (values.image) {
      menuDetails = {
        ...menuDetails,
        image: values.image,
      };
    }
    addMenu(menuDetails)
      .then(async (uploadUrl) => {
        if (uploadUrl && imageFile && values.image?.fileType) {
          await betterFetch(uploadUrl, {
            method: "PUT",
            headers: {
              "Content-Type": values.image?.fileType,
            },
            body: imageFile,
          }).catch(() => {
            toast({
              title: "Error",
              description: "Failed to upload image.",
              variant: "destructive",
            });
          });
        }
        toast({
          title: "Success!",
          description: `You have successfully added a new menu ${values.name}.`,
        });
        form.reset();
        setImagePreview(null);
        setSheetOpen(false);
        await refetchMenus();
      })
      .catch((error: TRPCError) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      });
  };

  const onDeleteItem = (menuId: number) => {
    deleteMenu({
      id: menuId,
    })
      .then(async () => {
        toast({
          title: "Removed menu",
          description: "You have successfully removed the menu.",
        });
        await refetchMenus();
      })
      .catch((error: TRPCError) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      });
  };

  const renderMenus = () => {
    if (loadingMenus) {
      return (
        <div className="flex flex-wrap gap-4">
          <Skeleton className="min-w-[600px] max-w-[800px] flex-grow bg-sidebar" />
          <Skeleton className="min-w-[600px] max-w-[800px] flex-grow bg-sidebar" />
          <Skeleton className="min-w-[600px] max-w-[800px] flex-grow bg-sidebar" />
          <Skeleton className="min-w-[600px] max-w-[800px] flex-grow bg-sidebar" />
          <Skeleton className="min-w-[600px] max-w-[800px] flex-grow bg-sidebar" />
          <Skeleton className="min-w-[600px] max-w-[800px] flex-grow bg-sidebar" />
        </div>
      );
    }

    if (menuItems.length === 0) {
      return (
        <div className="flex justify-center text-center">
          Your organization currently have no menu.
        </div>
      );
    }

    return (
      <div className="flex flex-wrap gap-4">
        {menuItems.map((item) => (
          <MenuItem key={item.id} menu={item} onDeleteItem={onDeleteItem} />
        ))}
      </div>
    );
  };

  return (
    <>
      <Sheet
        open={sheetOpen}
        onOpenChange={(state) => {
          setSheetOpen(state);
        }}
      >
        <div className="mb-6 flex flex-row justify-between rounded-lg bg-sidebar p-4 shadow">
          <h2 className="text-lg font-semibold">Menu</h2>
          <div>
            <SheetTrigger asChild>
              <Button>Add New Menu</Button>
            </SheetTrigger>
          </div>
        </div>
        <SheetContent className="bg-sidebar">
          <SheetHeader>
            <SheetTitle>Add New Menu Item</SheetTitle>
            <SheetDescription>asd</SheetDescription>
          </SheetHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-background"
                        key={`${sheetOpen}`}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <FormLabel>Image</FormLabel>
                    <FormControl>
                      <div className="flex flex-col items-center gap-4">
                        {imagePreview && (
                          <div className="relative h-16 w-16 overflow-hidden rounded-sm">
                            <Image
                              src={imagePreview}
                              alt="Profile preview"
                              fill
                              style={{ objectFit: "cover" }}
                            />
                          </div>
                        )}
                        <div className="flex w-full items-center gap-2">
                          <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            key={`${sheetOpen}_${resetImage}`}
                            className="w-full"
                            onChange={(e) => {
                              setLoadingImage(true);
                              const file = e.target.files?.[0];
                              if (file) {
                                imageCompression(file, {
                                  maxSizeMB: 1,
                                  maxWidthOrHeight: 1920,
                                  useWebWorker: true,
                                })
                                  .then((compressedFile) => {
                                    const previewUrl =
                                      URL.createObjectURL(compressedFile);
                                    setImagePreview(previewUrl);
                                    setImageFile(compressedFile);
                                    form.setValue("image", {
                                      fileSize: compressedFile.size,
                                      fileType: compressedFile.type,
                                    });
                                  })
                                  .catch(() => {
                                    toast({
                                      variant: "destructive",
                                      title: "Error",
                                      description:
                                        "An error occured loading the selected image.",
                                    });
                                  })
                                  .finally(() => {
                                    setLoadingImage(false);
                                  });
                              }
                            }}
                          />
                          {field.value && (
                            <X
                              className="cursor-pointer"
                              onClick={() => {
                                form.setValue("image", undefined);
                                setImagePreview(null);
                                setResetImage((prev) => !prev);
                              }}
                            />
                          )}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sale"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sale Price</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-background"
                        key={`${sheetOpen}`}
                        type="number"
                        step={0.01}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-background"
                        key={`${sheetOpen}`}
                        type="number"
                        step={0.01}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        className="resize-none bg-background"
                        key={`${sheetOpen}`}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="menuGroupId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Menu Group</FormLabel>
                    <Select onValueChange={field.onChange} key={`${sheetOpen}`}>
                      <FormControl>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select a group for this menu" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {selectOptions?.map((item) => (
                          <SelectItem key={item.id} value={`${item.id}`}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-end"></div>
              <SheetFooter>
                <Button type="submit">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      <ScrollArea className="h-[calc(100vh-200px)] justify-center">
        {renderMenus()}
      </ScrollArea>
      <Dialog open={loadingImage}>
        <DialogContent
          disableClose={true}
          className="flex max-w-60 flex-row place-content-center items-center"
        >
          <Spinner />
          Loading Image
        </DialogContent>
      </Dialog>
    </>
  );
}

const MAX_RETRIES = 3;

function MenuItem({
  menu,
  onDeleteItem,
}: {
  menu: Menu;
  onDeleteItem: (itemId: number) => void;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [image, setImage] = useState(menu.image);
  const [retries, setRetries] = useState(0);

  const renderImage = () => {
    if (!image) {
      return (
        <div className="flex h-40 w-40 items-center justify-center rounded-md bg-primary/10 shadow">
          <ImageOff />
        </div>
      );
    }
    return (
      <>
        {isLoading && (
          <Skeleton className="absolute h-40 w-40 rounded-md object-cover shadow" />
        )}
        {/* eslint-disable-next-line @next/next/no-img-element*/}
        <img
          src={image}
          key={`${menu.id}_${retries}`}
          alt={`${menu.name} preview`}
          className="h-40 w-40 rounded-md object-cover shadow"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            if (retries >= MAX_RETRIES) {
              setImage(null);
              return;
            }
            setTimeout(function () {
              setRetries((prev) => prev + 1);
            }, 2000);
          }}
        />
      </>
    );
  };

  return (
    <Card className="min-w-[600px] max-w-[800px] flex-grow bg-sidebar">
      <CardHeader className="flex flex-row justify-between">
        <div>
          <CardTitle>{menu.name}</CardTitle>
          <CardDescription>{menu.description}</CardDescription>
        </div>
        <div className="pl-4">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDeleteItem(menu.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-row justify-between">
        <div className="flex flex-row justify-between">
          <div>
            <p>price: </p>
            <p>cost: </p>
            <p>group: </p>
          </div>
          <div className="ml-4">
            <p>{menu.sale}</p>
            <p>{menu.cost}</p>
            <p>{menu.menuGroupName}</p>
          </div>
        </div>
        <div>{renderImage()}</div>
      </CardContent>
    </Card>
  );
}
