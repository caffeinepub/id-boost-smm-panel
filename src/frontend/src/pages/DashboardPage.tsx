import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ListOrdered,
  Loader2,
  Plus,
  Rocket,
  ShoppingCart,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { OrderStatus, type Service } from "../backend";
import { AddFundsModal } from "../components/AddFundsModal";
import { useAppContext } from "../context/AppContext";
import { useMyOrders, usePlaceOrder, useServices } from "../hooks/useQueries";

function StatusBadge({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, { label: string; className: string }> = {
    [OrderStatus.pending]: {
      label: "Pending",
      className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    },
    [OrderStatus.processing]: {
      label: "Processing",
      className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    },
    [OrderStatus.completed]: {
      label: "Completed",
      className: "bg-green-500/20 text-green-400 border-green-500/30",
    },
    [OrderStatus.failed]: {
      label: "Failed",
      className: "bg-red-500/20 text-red-400 border-red-500/30",
    },
  };
  const { label, className } = map[status] || map[OrderStatus.pending];
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}

export function DashboardPage() {
  const {
    userProfile,
    isLoading: profileLoading,
    refetchProfile,
  } = useAppContext();
  const { data: services, isLoading: servicesLoading } = useServices();
  const { data: orders, isLoading: ordersLoading } = useMyOrders();
  const placeOrder = usePlaceOrder();

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState("");
  const [addFundsOpen, setAddFundsOpen] = useState(false);

  const cost =
    selectedService && quantity
      ? (
          (Number.parseFloat(quantity) / 1000) *
          selectedService.pricePerThousand
        ).toFixed(2)
      : null;

  const handlePlaceOrder = async () => {
    if (!selectedService) {
      toast.error("Please select a service");
      return;
    }
    if (!link.trim()) {
      toast.error("Please enter a link");
      return;
    }
    const qty = Number.parseInt(quantity);
    if (
      !qty ||
      qty < Number(selectedService.minQty) ||
      qty > Number(selectedService.maxQty)
    ) {
      toast.error(
        `Quantity must be between ${selectedService.minQty} and ${selectedService.maxQty}`,
      );
      return;
    }
    if (cost && userProfile && Number.parseFloat(cost) > userProfile.balance) {
      toast.error("Insufficient balance. Please add funds.");
      return;
    }
    try {
      await placeOrder.mutateAsync({
        serviceId: selectedService.id,
        link: link.trim(),
        quantity: BigInt(qty),
      });
      toast.success("Order placed successfully!");
      setLink("");
      setQuantity("");
      setSelectedService(null);
      refetchProfile();
    } catch {
      toast.error("Failed to place order. Please try again.");
    }
  };

  return (
    <main className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display font-black text-3xl lg:text-4xl gradient-text">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your orders and wallet
          </p>
        </motion.div>

        {/* Wallet Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-6 lg:p-8 mb-6 relative overflow-hidden"
          data-ocid="dashboard.card"
          style={{
            background:
              "linear-gradient(135deg, rgba(0,212,255,0.15), rgba(139,92,246,0.2), rgba(236,72,153,0.15))",
            border: "1px solid rgba(0,212,255,0.2)",
            boxShadow: "0 0 40px rgba(139,92,246,0.1)",
          }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="w-5 h-5" style={{ color: "#00d4ff" }} />
                <span className="text-muted-foreground text-sm font-medium">
                  Wallet Balance
                </span>
              </div>
              {profileLoading ? (
                <Skeleton className="h-12 w-40" />
              ) : (
                <div className="font-display font-black text-5xl gradient-text">
                  ₹{userProfile?.balance?.toFixed(2) ?? "0.00"}
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                className="btn-gradient text-white border-0"
                onClick={() => setAddFundsOpen(true)}
                data-ocid="dashboard.primary_button"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Funds
              </Button>
              <Button
                variant="outline"
                className="border-border hover:bg-muted"
                data-ocid="dashboard.secondary_button"
              >
                <ListOrdered className="w-4 h-4 mr-1" /> View Orders
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* New Order Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 card-glass rounded-xl p-6"
          >
            <h2 className="font-display font-bold text-xl mb-5 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" style={{ color: "#00d4ff" }} />
              <span className="gradient-text">New Order</span>
            </h2>

            <div className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground mb-1 block">
                  Service
                </Label>
                {servicesLoading ? (
                  <Skeleton
                    className="h-10 w-full"
                    data-ocid="order.loading_state"
                  />
                ) : (
                  <Select
                    onValueChange={(val) => {
                      const svc = services?.find(
                        (s) => s.id.toString() === val,
                      );
                      setSelectedService(svc ?? null);
                    }}
                  >
                    <SelectTrigger
                      className="bg-muted border-border"
                      data-ocid="order.select"
                    >
                      <SelectValue placeholder="Select service..." />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {(services ?? [])
                        .filter((s) => s.active)
                        .map((svc) => (
                          <SelectItem
                            key={svc.id.toString()}
                            value={svc.id.toString()}
                          >
                            {svc.name}
                          </SelectItem>
                        ))}
                      {(services ?? []).length === 0 && (
                        <SelectItem value="none" disabled>
                          No services available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
                {selectedService && (
                  <p className="text-xs text-muted-foreground mt-1">
                    ₹{selectedService.pricePerThousand}/1000 • Min:{" "}
                    {selectedService.minQty.toString()} • Max:{" "}
                    {selectedService.maxQty.toString()}
                  </p>
                )}
              </div>

              <div>
                <Label className="text-sm text-muted-foreground mb-1 block">
                  Profile / Post Link
                </Label>
                <Input
                  placeholder="https://instagram.com/..."
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="bg-muted border-border"
                  data-ocid="order.input"
                />
              </div>

              <div>
                <Label className="text-sm text-muted-foreground mb-1 block">
                  Quantity
                </Label>
                <Input
                  type="number"
                  placeholder="Enter quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="bg-muted border-border"
                  data-ocid="order.input"
                />
                {cost && (
                  <div className="mt-2 px-3 py-2 rounded-lg gradient-bg-soft border border-border">
                    <span className="text-sm text-muted-foreground">
                      Cost:{" "}
                    </span>
                    <span className="font-bold gradient-text">₹{cost}</span>
                  </div>
                )}
              </div>

              <Button
                className="w-full btn-gradient text-white border-0"
                onClick={handlePlaceOrder}
                disabled={placeOrder.isPending}
                data-ocid="order.submit_button"
              >
                {placeOrder.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Rocket className="mr-2 w-4 h-4" />
                )}
                {placeOrder.isPending ? "Placing Order..." : "Place Order"}
              </Button>
            </div>
          </motion.div>

          {/* Order History */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="lg:col-span-3 card-glass rounded-xl p-6"
          >
            <h2 className="font-display font-bold text-xl mb-5 flex items-center gap-2">
              <ListOrdered className="w-5 h-5" style={{ color: "#8b5cf6" }} />
              <span className="gradient-text">Order History</span>
            </h2>

            {ordersLoading ? (
              <div className="space-y-3" data-ocid="orders.loading_state">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (orders ?? []).length === 0 ? (
              <div
                className="text-center py-12 text-muted-foreground"
                data-ocid="orders.empty_state"
              >
                <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No orders yet</p>
                <p className="text-sm mt-1">
                  Place your first order using the form
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table data-ocid="orders.table">
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">
                        Service
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Link
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Qty
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Status
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Date
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(orders ?? []).map((order, idx) => {
                      const svc = services?.find(
                        (s) => s.id === order.serviceId,
                      );
                      const date = new Date(
                        Number(order.createdAt) / 1_000_000,
                      ).toLocaleDateString();
                      return (
                        <TableRow
                          key={order.id.toString()}
                          className="border-border hover:bg-muted/50"
                          data-ocid={`orders.row.${idx + 1}`}
                        >
                          <TableCell className="font-medium text-sm">
                            {svc?.name ?? `Service #${order.serviceId}`}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs max-w-[120px] truncate">
                            {order.link}
                          </TableCell>
                          <TableCell>{order.quantity.toString()}</TableCell>
                          <TableCell>
                            <StatusBadge status={order.status} />
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs">
                            {date}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <AddFundsModal
        open={addFundsOpen}
        onClose={() => setAddFundsOpen(false)}
      />
    </main>
  );
}
