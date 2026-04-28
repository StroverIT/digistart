import { getStripeServerClient } from "@/lib/server/stripe";

export type CheckoutInvoiceInput = {
  companyName: string;
  taxId: string;
  vatNumber?: string;
  addressLine1: string;
  mol: string;
};

export async function applyInvoiceDetailsToStripeCustomer(params: {
  stripeCustomerId: string;
  invoice: CheckoutInvoiceInput;
}) {
  const stripe = getStripeServerClient();
  const { stripeCustomerId, invoice } = params;

  await stripe.customers.update(stripeCustomerId, {
    name: invoice.companyName.trim(),
    address: {
      line1: invoice.addressLine1.trim(),
      country: "BG",
    },
    metadata: {
      mol: invoice.mol.trim(),
      eik: invoice.taxId.replace(/\s/g, ""),
    },
  });

  const eik = invoice.taxId.replace(/\s/g, "");
  try {
    await stripe.customers.createTaxId(stripeCustomerId, {
      type: "bg_uic",
      value: eik,
    });
  } catch {
    /* duplicate or invalid */
  }

  const vatRaw = invoice.vatNumber?.replace(/\s/g, "");
  if (vatRaw) {
    const value = vatRaw.toUpperCase().startsWith("BG") ? vatRaw.toUpperCase() : `BG${vatRaw}`;
    try {
      await stripe.customers.createTaxId(stripeCustomerId, {
        type: "eu_vat",
        value,
      });
    } catch {
      /* duplicate or invalid */
    }
  }
}
