"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Plus, Trash } from "lucide-react";
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
import { api } from "~/trpc/react";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  menuGroupId: z.coerce.number().positive(),
  name: z.string().min(1).max(256),
  description: z.string().max(256).optional(),
  image: z.string().url().max(256).optional(),
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
  const { data: selectOptions, error: menuGroupError } =
    api.menuGroup.getAllMenuGroup.useQuery();
  const { data: organizationMenus, error: menuError } =
    api.menu.getMenu.useQuery();

  useEffect(() => {
    if (
      menuError?.data?.code === "FORBIDDEN" ||
      menuGroupError?.data?.code === "FORBIDDEN"
    ) {
      router.push("/dashboard/organization");
    }
  }, [menuError?.data?.code, menuGroupError?.data?.code, router]);

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
      menuGroupId: 0,
      name: "",
      sale: 0.0,
      cost: 0.0,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log({ values });
  };

  const onDeleteItem = (menuId: number) => {
    console.log({ menuId });
  };

  return (
    <>
      <div className="mb-6 rounded-lg bg-sidebar p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold">Add New Menu Item</h2>
        <div className="">
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
                      <Input {...field} className="bg-background" />
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={`${field.value}`}
                    >
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
