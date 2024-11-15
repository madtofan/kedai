import { api, HydrateClient } from "~/trpc/server";
import RestaurantOrder from "./_content";
import { type TRPCError } from "@trpc/server";
import { redirect } from "next/navigation";

export interface Store {
  name: string;
  storeMenus: StoreMenus[];
}

export interface Menu {
  id: number;
  menuGroups: MenuGroups;
  menuDetails: MenuDetails;
}

export interface StoreMenus {
  id: number;
  menu: Menu;
}

export interface MenuGroups {
  name: string;
}

export interface MenuDetails {
  name: string;
  description: string | null;
  image: string | null;
  sale: string;
}

export default async function OrderPage() {
  //   {
  //   params,
  // }: {
  //   params: { storeSlug: string };
  // }
  // console.log({ params });
  // const store = await api.store.getStoreMenus({
  //   storeSlug: "test",
  // });
  // .catch((err: TRPCError) => {
  //   if (err.code === "NOT_FOUND") {
  //     redirect("/not-found");
  //   }
  //   redirect("/error");
  // });

  // if (!store) {
  //   redirect("/error");
  // }

  return (
    <HydrateClient>
      <main>{/* <RestaurantOrder menuGroups={store.storeMenus} /> */}</main>
    </HydrateClient>
  );
}
