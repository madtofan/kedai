import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Check, CreditCard, BarChart, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { SignInButton } from "~/components/sign-in-button";

export default function Home() {
  return (
    <main>
      <div className="flex min-h-[100dvh] flex-col">
        <header className="flex h-14 items-center gap-4 px-4 sm:gap-6 lg:px-6">
          <Link className="flex items-center justify-center" href="#">
            <CreditCard className="h-6 w-6" />
            <span className="sr-only">Swift POS</span>
          </Link>
          <Link
            className="text-sm font-medium underline-offset-4 hover:underline"
            href="#features"
          >
            Features
          </Link>
          <Link
            className="text-sm font-medium underline-offset-4 hover:underline"
            href="#pricing"
          >
            Pricing
          </Link>
          <Link
            className="text-sm font-medium underline-offset-4 hover:underline"
            href="#contact"
          >
            Contact
          </Link>
          <nav className="ml-auto flex">
            <SignInButton />
          </nav>
        </header>
        <main className="flex-1">
          <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
            <div className="container px-4 md:px-6">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                    SwiftPOS: Revolutionize Your Business
                  </h1>
                  <p className="mx-auto max-w-[700px] text-gray-500 dark:text-gray-400 md:text-xl">
                    Streamline your sales, inventory, and customer management
                    with our cutting-edge Point of Sale system.
                  </p>
                </div>
                <div className="space-x-4">
                  <Button>Get Started</Button>
                  <Button variant="outline">Learn More</Button>
                </div>
              </div>
            </div>
          </section>
          <section
            id="features"
            className="w-full bg-gray-100 py-12 dark:bg-gray-800 md:py-24 lg:py-32"
          >
            <div className="container px-4 md:px-6">
              <h2 className="mb-12 text-center text-3xl font-bold tracking-tighter sm:text-5xl">
                Key Features
              </h2>
              <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Easy Transactions</CardTitle>
                    <ShoppingCart className="mb-2 h-8 w-8" />
                  </CardHeader>
                  <CardContent>
                    <p>
                      Process sales quickly and efficiently with our intuitive
                      interface.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Inventory Management</CardTitle>
                    <BarChart className="mb-2 h-8 w-8" />
                  </CardHeader>
                  <CardContent>
                    <p>
                      Keep track of your stock in real-time with automated
                      updates.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Reporting & Analytics</CardTitle>
                    <BarChart className="mb-2 h-8 w-8" />
                  </CardHeader>
                  <CardContent>
                    <p>
                      Gain valuable insights with comprehensive sales and
                      inventory reports.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
          <section id="pricing" className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
              <h2 className="mb-12 text-center text-3xl font-bold tracking-tighter sm:text-5xl">
                Pricing Plans
              </h2>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic</CardTitle>
                    <CardDescription>For small businesses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold">$29/mo</p>
                    <ul className="mt-4 space-y-2">
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4" />
                        Up to 1,000 transactions/month
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4" />
                        Basic reporting
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4" />1 user account
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">Choose Plan</Button>
                  </CardFooter>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Pro</CardTitle>
                    <CardDescription>For growing businesses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold">$79/mo</p>
                    <ul className="mt-4 space-y-2">
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4" />
                        Unlimited transactions
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4" />
                        Advanced reporting & analytics
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4" />
                        Up to 5 user accounts
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">Choose Plan</Button>
                  </CardFooter>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Enterprise</CardTitle>
                    <CardDescription>For large operations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold">Custom</p>
                    <ul className="mt-4 space-y-2">
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4" />
                        Unlimited everything
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4" />
                        Custom integrations
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4" />
                        Dedicated support
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">Contact Sales</Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </section>
          <section
            id="contact"
            className="w-full bg-gray-100 py-12 dark:bg-gray-800 md:py-24 lg:py-32"
          >
            <div className="container px-4 md:px-6">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                    Ready to Get Started?
                  </h2>
                  <p className="mx-auto max-w-[600px] text-gray-500 dark:text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Transform your business with SwiftPOS. Contact us today for
                    a free demo.
                  </p>
                </div>
                <div className="w-full max-w-sm space-y-2">
                  <form className="flex flex-col gap-2">
                    <Input placeholder="Enter your email" type="email" />
                    <Button type="submit">Request a Demo</Button>
                  </form>
                </div>
              </div>
            </div>
          </section>
        </main>
        <footer className="flex w-full shrink-0 flex-col items-center gap-2 border-t px-4 py-6 sm:flex-row md:px-6">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © 2024 SwiftPOS Inc. All rights reserved.
          </p>
          <nav className="flex gap-4 sm:ml-auto sm:gap-6">
            <Link
              className="text-xs underline-offset-4 hover:underline"
              href="#"
            >
              Terms of Service
            </Link>
            <Link
              className="text-xs underline-offset-4 hover:underline"
              href="#"
            >
              Privacy
            </Link>
          </nav>
        </footer>
      </div>
    </main>
  );
}
