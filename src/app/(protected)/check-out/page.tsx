"use client";

import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { CheckoutTabs } from "./components/checkout-tabs";
import { ProductSearch } from "./components/product-search";
import { CartItems } from "./components/cart-items";
import { CheckoutSidebar } from "./components/checkout-sidebar";
import { CustomerDialog } from "./components/customer-dialog";
import { ReceiptDialog } from "./components/receipt-dialog";
import { OrderQrDialog } from "./components/order-qr-dialog";
import { orderApi } from "@/lib/api/order";
import { branchApi } from "@/lib/api/branch";
import { getCachedUser } from "@/lib/auth";

interface Customer {
  id: string;
  customerCode: string;
  name: string;
  phone: string;
  address: string;
  gender: "MALE" | "FEMALE" | "OTHER";
}

interface CartItem {
  productItemId: string;
  productCode: string;
  sku: string;
  barcode: string;
  name: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  imageUrl?: string;
}

interface InvoiceState {
  id: string;
  tabName: string;
  items: CartItem[];
  selectedCustomer: Customer | null;
  discount: number;
  discountType: "cash" | "percent";
  vatPercent: number;
  paymentMethod: "CASH" | "SEPAY";
  customerPay: number;
  note: string;
}

const createNewInvoice = (id: string, name: string): InvoiceState => ({
  id,
  tabName: name,
  items: [],
  selectedCustomer: null,
  discount: 0,
  discountType: "cash",
  vatPercent: 0,
  paymentMethod: "CASH",
  customerPay: 0,
  note: "",
});

export default function CheckOutPage() {
  const [invoices, setInvoices] = useState<InvoiceState[]>([
    createNewInvoice("1", "Hóa đơn 1"),
  ]);
  const [activeTabId, setActiveTabId] = useState<string>("1");
  const [branches, setBranches] = useState<any[]>([]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await branchApi.getList({ limit: 100 });
        setBranches(response.data || []);
      } catch (err) {
        console.error("Lỗi khi tải danh sách chi nhánh:", err);
      }
    };
    fetchBranches();
  }, []);

  // Modals state
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState<any | null>(null);
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const [qrOrderData, setQrOrderData] = useState<{
    orderId: string;
    qrUrl: string;
    paymentReference: string;
    grandTotal: number;
    receiptSnapshot: any;
  } | null>(null);

  // Active invoice getter
  const activeInvoice = useMemo(() => {
    return invoices.find((inv) => inv.id === activeTabId) || invoices[0];
  }, [invoices, activeTabId]);

  // Update helper for active invoice state
  const updateActiveInvoice = (updates: Partial<InvoiceState>) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === activeTabId ? { ...inv, ...updates } : inv,
      ),
    );
  };

  // Add new tab
  const handleTabAdd = () => {
    if (invoices.length >= 10) {
      toast.warning("Hệ thống chỉ cho phép tối đa 10 hóa đơn nháp cùng lúc.");
      return;
    }
    const nextId = (
      Math.max(...invoices.map((inv) => parseInt(inv.id))) + 1
    ).toString();
    const nextName = `Hóa đơn ${nextId}`;
    const newTab = createNewInvoice(nextId, nextName);
    setInvoices((prev) => [...prev, newTab]);
    setActiveTabId(nextId);
    toast.success(`Đã mở ${nextName}`);
  };

  // Close tab
  const handleTabClose = (id: string) => {
    if (invoices.length === 1) return; // Keep at least one

    const index = invoices.findIndex((inv) => inv.id === id);
    const updated = invoices.filter((inv) => inv.id !== id);
    setInvoices(updated);

    if (activeTabId === id) {
      // Switch active tab to previous or first
      const nextActiveIndex = index > 0 ? index - 1 : 0;
      setActiveTabId(updated[nextActiveIndex].id);
    }
    toast.info("Đã xóa hóa đơn nháp.");
  };

  // Add product to cart
  const handleProductSelect = (product: any) => {
    const existingIndex = activeInvoice.items.findIndex(
      (item) => item.productItemId === product.id,
    );

    if (existingIndex > -1) {
      const updatedItems = [...activeInvoice.items];
      updatedItems[existingIndex].quantity += 1;
      updateActiveInvoice({ items: updatedItems });
      toast.success(`Đã tăng số lượng ${product.name}`);
    } else {
      const newItem: CartItem = {
        productItemId: product.id,
        productCode: product.productCode,
        sku: product.sku,
        barcode: product.barcode,
        name: product.name,
        quantity: 1,
        unitPrice: product.retailPrice,
        discountAmount: 0,
        imageUrl: product.imageUrl,
      };
      updateActiveInvoice({ items: [...activeInvoice.items, newItem] });
      toast.success(`Đã thêm ${product.name} vào giỏ hàng`);
    }
  };

  // Item modifications
  const handleItemQuantityChange = (
    productItemId: string,
    quantity: number,
  ) => {
    const updated = activeInvoice.items.map((item) =>
      item.productItemId === productItemId ? { ...item, quantity } : item,
    );
    updateActiveInvoice({ items: updated });
  };

  const handleItemUnitPriceChange = (
    productItemId: string,
    unitPrice: number,
  ) => {
    const updated = activeInvoice.items.map((item) =>
      item.productItemId === productItemId ? { ...item, unitPrice } : item,
    );
    updateActiveInvoice({ items: updated });
  };

  const handleItemDiscountChange = (
    productItemId: string,
    discountAmount: number,
  ) => {
    const updated = activeInvoice.items.map((item) =>
      item.productItemId === productItemId ? { ...item, discountAmount } : item,
    );
    updateActiveInvoice({ items: updated });
  };

  const handleItemRemove = (productItemId: string) => {
    const updated = activeInvoice.items.filter(
      (item) => item.productItemId !== productItemId,
    );
    updateActiveInvoice({ items: updated });
    toast.info("Đã xóa sản phẩm khỏi giỏ hàng.");
  };

  // Calculation details
  const subtotal = useMemo(() => {
    return activeInvoice.items.reduce(
      (acc, item) =>
        acc + item.quantity * (item.unitPrice - item.discountAmount),
      0,
    );
  }, [activeInvoice.items]);

  const grandTotal = useMemo(() => {
    const calculatedDiscount =
      activeInvoice.discountType === "cash"
        ? activeInvoice.discount
        : (subtotal * activeInvoice.discount) / 100;
    const total = Math.max(0, subtotal - calculatedDiscount);
    const vat = (total * activeInvoice.vatPercent) / 100;
    return Math.max(0, total + vat);
  }, [
    subtotal,
    activeInvoice.discount,
    activeInvoice.discountType,
    activeInvoice.vatPercent,
  ]);

  // Keep paid amount updated when grand total drops
  useEffect(() => {
    if (
      activeInvoice.paymentMethod !== "CASH" ||
      activeInvoice.customerPay < grandTotal
    ) {
      updateActiveInvoice({ customerPay: grandTotal });
    }
  }, [grandTotal]);

  // Complete checkout order
  const handleCheckoutSubmit = () => {
    if (activeInvoice.items.length === 0) {
      toast.error("Không thể thanh toán đơn hàng trống!");
      return;
    }

    if (!activeInvoice.selectedCustomer) {
      toast.error("Vui lòng chọn hoặc thêm khách hàng trước khi thanh toán!");
      return;
    }

    if (activeInvoice.paymentMethod === "CASH" && activeInvoice.customerPay < grandTotal) {
      toast.error("Số tiền khách trả phải lớn hơn hoặc bằng tổng hóa đơn!");
      return;
    }

    // Resolve branchId
    let resolvedBranchId = "";
    if (typeof window !== "undefined") {
      const activeSwitcherItemId = localStorage.getItem("activeSwitcherItemId");
      const activeSwitcherItemType = localStorage.getItem("activeSwitcherItemType");
      if (activeSwitcherItemId && activeSwitcherItemType === "branch" && activeSwitcherItemId !== "all-branches") {
        resolvedBranchId = activeSwitcherItemId;
      }
    }
    
    if (!resolvedBranchId) {
      const cachedUser = getCachedUser() as any;
      if (cachedUser?.branchId) {
        resolvedBranchId = cachedUser.branchId;
      }
    }
    
    if (!resolvedBranchId && branches.length > 0) {
      resolvedBranchId = branches[0]._id;
    }

    if (!resolvedBranchId) {
      toast.error("Không xác định được chi nhánh hoạt động. Vui lòng chọn chi nhánh!");
      return;
    }

    const payload = {
      customerId: activeInvoice.selectedCustomer.id,
      branchId: resolvedBranchId,
      paymentMethod: activeInvoice.paymentMethod,
      items: activeInvoice.items.map((item) => ({
        productItemId: item.productItemId,
        productName: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountAmount: item.discountAmount,
      })),
      grandTotal,
      customerPay: activeInvoice.customerPay,
      note: activeInvoice.note,
    };

    const buildReceipt = (createdOrder: any, orderId: string) => ({
      orderCode: createdOrder.paymentReference || `HD-${orderId.slice(-6).toUpperCase()}`,
      createdAt: createdOrder.createdAt || new Date().toISOString(),
      branchName: branches.find((b) => b._id === resolvedBranchId)?.name || "Chi nhánh chính",
      sellerName: getCachedUser()?.full_name || "Quản trị viên (Admin)",
      customer: activeInvoice.selectedCustomer,
      items: activeInvoice.items.map((item) => ({
        productName: item.name,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountAmount: item.discountAmount,
      })),
      grandTotal,
      customerPay: activeInvoice.paymentMethod === "CASH" ? activeInvoice.customerPay : grandTotal,
      change: activeInvoice.paymentMethod === "CASH"
        ? (createdOrder.change ?? Math.max(0, activeInvoice.customerPay - grandTotal))
        : 0,
      paymentMethod: activeInvoice.paymentMethod,
      note: activeInvoice.note,
    });

    const checkoutPromise = orderApi.create(payload);

    toast.promise(checkoutPromise, {
      loading: "Đang xử lý...",
      success: (response) => {
        const createdOrder = response.data.order;
        const orderId = createdOrder.id || (createdOrder as any)._id || "";
        const receipt = buildReceipt(createdOrder, orderId);

        if (activeInvoice.paymentMethod === "SEPAY" && response.data.qrUrl) {
          // SEPAY: hiện QR dialog, chờ xác nhận payment
          setQrOrderData({
            orderId,
            qrUrl: response.data.qrUrl,
            paymentReference: createdOrder.paymentReference || "",
            grandTotal,
            receiptSnapshot: receipt,
          });
          setIsQrDialogOpen(true);
          updateActiveInvoice(createNewInvoice(activeInvoice.id, activeInvoice.tabName));
          return "Đã tạo đơn! Mời khách quét mã QR.";
        }

        // CASH: hiện receipt ngay
        setReceiptOrder(receipt);
        setIsReceiptOpen(true);
        updateActiveInvoice(createNewInvoice(activeInvoice.id, activeInvoice.tabName));
        return "Thanh toán đơn hàng thành công!";
      },
      error: (err: any) => {
        console.error("Lỗi thanh toán:", err);
        return err?.response?.data?.message || err?.message || "Thanh toán đơn hàng thất bại";
      },
    });
  };

  // Reset/Cancel order cart
  const handleCancelOrder = () => {
    if (
      confirm(
        `Bạn có chắc chắn muốn hủy giỏ hàng của ${activeInvoice.tabName}?`,
      )
    ) {
      updateActiveInvoice(
        createNewInvoice(activeInvoice.id, activeInvoice.tabName),
      );
      toast.info("Đã hủy và làm trống đơn hàng.");
    }
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleShortcuts = (e: KeyboardEvent) => {
      // Ctrl + I to add a new tab
      if (e.ctrlKey && e.key.toLowerCase() === "i") {
        e.preventDefault();
        handleTabAdd();
      }
      // F9 to checkout order
      if (e.key === "F9") {
        e.preventDefault();
        handleCheckoutSubmit();
      }
      // F4 to select exact amount
      if (e.key === "F4") {
        e.preventDefault();
        updateActiveInvoice({ customerPay: grandTotal });
        toast.info("Đã cập nhật số tiền khách trả khớp với hóa đơn!");
      }
    };
    window.addEventListener("keydown", handleShortcuts);
    return () => window.removeEventListener("keydown", handleShortcuts);
  }, [activeInvoice, grandTotal]);

  return (
    <div className="h-screen w-full flex flex-col gap-4 p-4 overflow-hidden bg-background">
      {/* Main Grid: Left Column Cart + Search | Right Column Billing Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch flex-1 min-h-0">
        {/* Left Side: Search + Active Tab + Cart Items list */}
        <div className="lg:col-span-8 flex flex-col gap-4 min-h-0">
          <div className="flex flex-col gap-3 bg-card p-4 rounded-xl border shadow-sm shrink-0">
            {/* Tabs Control */}
            <CheckoutTabs
              tabs={invoices.map((inv) => ({
                id: inv.id,
                tabName: inv.tabName,
              }))}
              activeTabId={activeTabId}
              onTabChange={setActiveTabId}
              onTabAdd={handleTabAdd}
              onTabClose={handleTabClose}
            />

            {/* Product Autocomplete Lookup */}
            <ProductSearch onProductSelect={handleProductSelect} />
          </div>

          {/* Cart items list - scrollable wrapper */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <CartItems
              items={activeInvoice.items}
              onQuantityChange={handleItemQuantityChange}
              onUnitPriceChange={handleItemUnitPriceChange}
              onDiscountChange={handleItemDiscountChange}
              onItemRemove={handleItemRemove}
            />
          </div>
        </div>

        {/* Right Side: Billing details card */}
        <div className="lg:col-span-4 h-full min-h-0">
          <CheckoutSidebar
            totalQuantity={activeInvoice.items.reduce(
              (acc, item) => acc + item.quantity,
              0,
            )}
            subtotal={activeInvoice.items.reduce(
              (acc, item) => acc + item.quantity * item.unitPrice,
              0,
            )}
            discount={activeInvoice.discount}
            discountType={activeInvoice.discountType}
            vatPercent={activeInvoice.vatPercent}
            paymentMethod={activeInvoice.paymentMethod}
            customerPay={activeInvoice.customerPay}
            note={activeInvoice.note}
            selectedCustomer={activeInvoice.selectedCustomer}
            onCustomerChange={(customer) =>
              updateActiveInvoice({ selectedCustomer: customer })
            }
            onDiscountChange={(discount) => updateActiveInvoice({ discount })}
            onDiscountTypeChange={(type) =>
              updateActiveInvoice({ discountType: type })
            }
            onVatChange={(vat) => updateActiveInvoice({ vatPercent: vat })}
            onPaymentMethodChange={(method) =>
              updateActiveInvoice({ paymentMethod: method })
            }
            onCustomerPayChange={(pay) =>
              updateActiveInvoice({ customerPay: pay })
            }
            onNoteChange={(note) => updateActiveInvoice({ note })}
            onCheckout={handleCheckoutSubmit}
            onCancel={handleCancelOrder}
            onOpenNewCustomerModal={() => setIsCustomerModalOpen(true)}
          />
        </div>
      </div>

      {/* Quick modal forms */}
      <CustomerDialog
        open={isCustomerModalOpen}
        onOpenChange={setIsCustomerModalOpen}
        onCustomerAdded={(newCustomer) =>
          updateActiveInvoice({ selectedCustomer: newCustomer })
        }
      />

      <ReceiptDialog
        open={isReceiptOpen}
        onOpenChange={setIsReceiptOpen}
        order={receiptOrder}
      />

      {qrOrderData && (
        <OrderQrDialog
          open={isQrDialogOpen}
          onOpenChange={setIsQrDialogOpen}
          orderId={qrOrderData.orderId}
          qrUrl={qrOrderData.qrUrl}
          paymentReference={qrOrderData.paymentReference}
          grandTotal={qrOrderData.grandTotal}
          onPaymentConfirmed={() => {
            setReceiptOrder(qrOrderData.receiptSnapshot);
            setIsReceiptOpen(true);
            setQrOrderData(null);
          }}
        />
      )}

      {/* Interactive brand logo back button in bottom left corner */}
      <Link
        href="/dashboard"
        className="fixed bottom-6 left-6 z-30 flex items-center justify-start opacity-20 hover:opacity-100 transition-all duration-300 group cursor-pointer h-10 select-none"
        title="Quay lại Trang chủ"
      >
        <div className="relative flex items-center">
          {/* Normal State: Logo + iKiot */}
          <div className="flex items-center gap-2.5 transition-all duration-300 group-hover:scale-90 group-hover:opacity-0 group-hover:pointer-events-none">
            <Logo size={32} className="text-primary" />
            <span className="font-extrabold text-2xl tracking-widest font-sans text-foreground">iKiot</span>
          </div>

          {/* Hover State: ArrowLeft Icon + "Quay lại" */}
          <div className="scale-75 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100 absolute left-0 flex items-center gap-2 h-9 px-3 bg-primary/10 rounded-full border border-primary/20 pointer-events-none">
            <ArrowLeft className="size-5 text-primary" />
            <span className="text-sm font-semibold text-primary whitespace-nowrap">Quay lại</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
