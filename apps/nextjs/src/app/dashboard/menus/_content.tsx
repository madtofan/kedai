"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Plus, Trash, X } from "lucide-react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
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
import { TRPCError } from "@trpc/server";

const formSchema = z.object({
  menuGroupId: z.coerce.number().positive(),
  name: z.string().min(1).max(256),
  description: z.string().max(256).optional(),
  image: z.instanceof(File).optional(),
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
  const [resetKey, setResetKey] = useState(true);
  const [resetImage, setResetImage] = useState(true);
  const { data: selectOptions, error: menuGroupError } =
    api.menuGroup.getAllMenuGroup.useQuery();
  const {
    data: organizationMenus,
    error: menuError,
    refetch: refetchMenus,
  } = api.menu.getMenu.useQuery();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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
    addMenu({
      menuGroupId: values.menuGroupId,
      name: values.name,
      description: values.description,
      sale: `${values.sale}`,
      cost: `${values.cost}`,
    })
      .then(async () => {
        toast({
          title: "Success!",
          description: `You have successfully added a new menu ${values.name}.`,
        });
        form.reset();
        setResetKey((prev) => !prev);
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

  return (
    <>
      <div className="mb-6 rounded-lg bg-sidebar p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold">Add New Menu Item</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* className="grid grid-cols-1 gap-4 md:grid-cols-2" */}
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
                        key={`${resetKey}`}
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
                            key={`${resetKey}_${resetImage}`}
                            className="w-full"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                form.setValue("image", file);
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setImagePreview(reader.result as string);
                                };
                                reader.readAsDataURL(file);
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
                        key={`${resetKey}`}
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
                        key={`${resetKey}`}
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
                        key={`${resetKey}`}
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
                    <Select onValueChange={field.onChange} key={`${resetKey}`}>
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
              <div className="flex items-end">
                <Button type="submit">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg bg-sidebar p-6 shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Menu Group</TableHead>
              <TableHead>Sale</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menuItems.map((item) => (
              <TableRow key={item.menuDetailsId}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.menuGroupName}</TableCell>
                <TableCell>${item.sale}</TableCell>
                <TableCell>${item.cost}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {item.description}
                </TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDeleteItem(item.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
