"use client";
import { useState } from "react";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { type StoreMenus } from "./page";

// TODO - Replace Mock menu data
const menuItems = {
  main: [
    {
      id: 1,
      name: "Margherita Pizza",
      price: 12.99,
      description: "Classic tomato and mozzarella",
    },
    {
      id: 2,
      name: "Chicken Alfredo",
      price: 15.99,
      description: "Creamy pasta with grilled chicken",
    },
    {
      id: 3,
      name: "Cheeseburger",
      price: 10.99,
      description: "Beef patty with cheddar cheese",
    },
    {
      id: 4,
      name: "Fish and Chips",
      price: 13.99,
      description: "Battered cod with french fries",
    },
  ],
  desserts: [
    {
      id: 5,
      name: "Chocolate Cake",
      price: 6.99,
      description: "Rich chocolate layer cake",
    },
    {
      id: 6,
      name: "Cheesecake",
      price: 7.99,
      description: "New York style cheesecake",
    },
    {
      id: 7,
      name: "Ice Cream Sundae",
      price: 5.99,
      description: "Vanilla ice cream with toppings",
    },
  ],
  beverages: [
    { id: 8, name: "Soda", price: 2.49, description: "Assorted flavors" },
    { id: 9, name: "Iced Tea", price: 2.99, description: "Freshly brewed" },
    { id: 10, name: "Coffee", price: 2.99, description: "Regular or decaf" },
  ],
};

interface RestaurantOrderProps {
  menuGroups: StoreMenus[];
}

export default function RestaurantOrder({ menuGroups }: RestaurantOrderProps) {
  // const [cart, setCart] = useState({});

  // const addToCart = (item) => {
  //   setCart((prevCart) => ({
  //     ...prevCart,
  //     [item.id]: (prevCart[item.id] || 0) + 1,
  //   }));
  // };

  // const removeFromCart = (item) => {
  //   setCart((prevCart) => {
  //     const newCart = { ...prevCart };
  //     if (newCart[item.id] > 1) {
  //       newCart[item.id]--;
  //     } else {
  //       delete newCart[item.id];
  //     }
  //     return newCart;
  //   });
  // };

  // const getTotalPrice = () => {
  //   return Object.entries(cart).reduce((total, [itemId, quantity]) => {
  //     const item = Object.values(menuItems)
  //       .flat()
  //       .find((i) => i.id === parseInt(itemId));
  //     return total + item.price * quantity;
  //   }, 0);
  // };

  // const renderMenuItem = (item) => (
  //   <Card key={item.id} className="mb-4">
  //     <CardHeader>
  //       <CardTitle>{item.name}</CardTitle>
  //       <CardDescription>{item.description}</CardDescription>
  //     </CardHeader>
  //     <CardContent>
  //       <p className="text-2xl font-bold">${item.price.toFixed(2)}</p>
  //     </CardContent>
  //     <CardFooter className="flex justify-between">
  //       <Button
  //         variant="outline"
  //         size="icon"
  //         onClick={() => removeFromCart(item)}
  //       >
  //         <Minus className="h-4 w-4" />
  //       </Button>
  //       <span className="text-xl font-bold">{cart[item.id] || 0}</span>
  //       <Button variant="outline" size="icon" onClick={() => addToCart(item)}>
  //         <Plus className="h-4 w-4" />
  //       </Button>
  //     </CardFooter>
  //   </Card>
  // );

  return (
    <div className="container mx-auto max-w-3xl p-4">
      <h1 className="mb-6 text-3xl font-bold">Restaurant Menu</h1>
      {/* <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-8">
          <section>
            <h2 className="mb-4 text-2xl font-semibold">Main Courses</h2>
            {menuItems.main.map(renderMenuItem)}
          </section>
          <section>
            <h2 className="mb-4 text-2xl font-semibold">Desserts</h2>
            {menuItems.desserts.map(renderMenuItem)}
          </section>
          <section>
            <h2 className="mb-4 text-2xl font-semibold">Beverages</h2>
            {menuItems.beverages.map(renderMenuItem)}
          </section>
        </div>
      </ScrollArea>
      <Separator className="my-6" />
      <div className="sticky bottom-0 bg-background pt-4">
        <div className="mb-4 flex items-center justify-between text-xl font-bold">
          <span>Total:</span>
          <span>${getTotalPrice().toFixed(2)}</span>
        </div>
        <Button className="w-full" disabled={Object.keys(cart).length === 0}>
          <ShoppingCart className="mr-2 h-4 w-4" /> View Cart
        </Button>
      </div> */}
    </div>
  );
}
