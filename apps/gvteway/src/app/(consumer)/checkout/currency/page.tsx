"use client";

import { useState } from "react";
import { Check, List } from "lucide-react";
import { Body, Card, Grid, DetailPage, Section, SectionHeader, Link } from "@ghxstship/ui";

const CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
];

export default function CurrencyPage() {
  const [selected, setSelected] = useState("USD");

  const tabs = [{
    id: "currency", label: "Currency", icon: <List className="size-4" />,
    content: (
      <Section>
        <SectionHeader title="Select Currency" description="Choose your preferred currency for checkout" />
        <Grid cols={3} gap={4} className="grid-cols-1 md:grid-cols-3 mt-4">
          {CURRENCIES.map((currency) => (
            <Card key={currency.code} className={`p-4 cursor-pointer transition-colors ${selected === currency.code ? "border-primary" : ""}`} onClick={() => setSelected(currency.code)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-grey-800 rounded-avatar flex items-center justify-center font-weight-bold">{currency.symbol}</div>
                  <div><Body className="font-weight-bold">{currency.code}</Body><Body size="sm" className="text-on-dark-muted">{currency.name}</Body></div>
                </div>
                {selected === currency.code && <Check className="size-5 text-primary" />}
              </div>
            </Card>
          ))}
        </Grid>
        <Link href="/checkout" className="w-full mt-6 inline-flex items-center justify-center bg-primary text-white px-4 py-2 rounded-button font-weight-medium">Continue to Checkout</Link>
      </Section>
    ),
  }];

  return <DetailPage header={{ kicker: "Checkout", title: "Currency", description: "Select your currency" }} backButton={{ label: "Cart", href: "/cart" }} tabs={tabs} />;
}
