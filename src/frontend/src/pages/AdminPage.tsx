import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navigate } from "@tanstack/react-router";
import {
  CheckCircle,
  CreditCard,
  Edit,
  ListOrdered,
  Loader2,
  Plus,
  Settings,
  Shield,
  Trash2,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { OrderStatus, type Service } from "../backend";
import { useAppContext } from "../context/AppContext";
import {
  useAddService,
  useAdjustBalance,
  useAllOrders,
  useAllPaymentRequests,
  useAllUsers,
  useApprovePayment,
  useRemoveService,
  useServices,
  useUpdateService,
} from "../hooks/useQueries";
import {
  type RefundRequest,
  type RefundStatus,
  useRefunds,
} from "../hooks/useRefunds";

type BlueTickOrder = {
  id: number;
  username: string;
  submittedAt: string;
  status: string;
};

function OrderStatusBadge({ status }: { status: OrderStatus }) {
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

export function AdminPage() {
  const { isAdmin, isLoading } = useAppContext();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2
          className="w-8 h-8 animate-spin"
          style={{ color: "#00d4ff" }}
        />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  return <AdminContent />;
}

function AdminContent() {
  const { data: users, isLoading: usersLoading } = useAllUsers();
  const { data: orders, isLoading: ordersLoading } = useAllOrders();
  const [blueTickOrders, setBlueTickOrders] = useState<BlueTickOrder[]>([]);
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("blueTickOrders") || "[]");
    setBlueTickOrders(stored);
  }, []);

  type PendingUTR = {
    id: number;
    utr: string;
    amount: number;
    bonus: number;
    time: string;
    status: string;
  };
  const [pendingUTRList, setPendingUTRList] = useState<PendingUTR[]>([]);
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("pendingUTR") || "[]");
    setPendingUTRList(stored);
  }, []);
  const handleUTRApprove = (id: number) => {
    const updated = pendingUTRList.map((o) =>
      o.id === id ? { ...o, status: "approved" } : o,
    );
    const item = pendingUTRList.find((o) => o.id === id);
    if (item) {
      // Credit balance + bonus to localStorage
      const KEY = "localBalance";
      const cur = Number.parseFloat(localStorage.getItem(KEY) || "0");
      localStorage.setItem(KEY, String(cur + item.amount + item.bonus));
    }
    setPendingUTRList(updated);
    localStorage.setItem("pendingUTR", JSON.stringify(updated));
    toast.success("Payment approved! Balance + bonus credited.");
  };
  const handleUTRReject = (id: number) => {
    const updated = pendingUTRList.map((o) =>
      o.id === id ? { ...o, status: "rejected" } : o,
    );
    setPendingUTRList(updated);
    localStorage.setItem("pendingUTR", JSON.stringify(updated));
    toast.error("Payment rejected.");
  };
  const handleBlueTickApprove = (id: number) => {
    const updated = blueTickOrders.map((o) =>
      o.id === id ? { ...o, status: "approved" } : o,
    );
    setBlueTickOrders(updated);
    localStorage.setItem("blueTickOrders", JSON.stringify(updated));
    toast.success("Blue Tick approved!");
  };
  const handleBlueTickReject = (id: number) => {
    const updated = blueTickOrders.map((o) =>
      o.id === id ? { ...o, status: "rejected" } : o,
    );
    setBlueTickOrders(updated);
    localStorage.setItem("blueTickOrders", JSON.stringify(updated));
    toast.error("Blue Tick rejected.");
  };
  const { data: payments, isLoading: paymentsLoading } =
    useAllPaymentRequests();
  const { data: services, isLoading: servicesLoading } = useServices();

  const approvePayment = useApprovePayment();
  const adjustBalance = useAdjustBalance();
  const addService = useAddService();
  const removeService = useRemoveService();
  const updateService = useUpdateService();

  const [adjustAmounts, setAdjustAmounts] = useState<Record<string, string>>(
    {},
  );
  const [newSvc, setNewSvc] = useState({
    name: "",
    externalServiceId: "",
    pricePerThousand: "",
    minQty: "",
    maxQty: "",
  });
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editSvc, setEditSvc] = useState({
    name: "",
    externalServiceId: "",
    pricePerThousand: "",
    minQty: "",
    maxQty: "",
    active: true,
  });

  const handleAdjust = async (userId: any, userKey: string) => {
    const amt = Number.parseFloat(adjustAmounts[userKey]);
    if (Number.isNaN(amt)) {
      toast.error("Enter a valid amount");
      return;
    }
    try {
      await adjustBalance.mutateAsync({ userId, amount: amt });
      toast.success(`Balance adjusted by ₹${amt}`);
      setAdjustAmounts((prev) => ({ ...prev, [userKey]: "" }));
    } catch {
      toast.error("Failed to adjust balance");
    }
  };

  const handleApprove = async (paymentId: bigint) => {
    try {
      await approvePayment.mutateAsync(paymentId);
      toast.success("Payment approved");
    } catch {
      toast.error("Failed to approve payment");
    }
  };

  const handleAddService = async () => {
    if (!newSvc.name || !newSvc.externalServiceId || !newSvc.pricePerThousand) {
      toast.error("Fill all required fields");
      return;
    }
    try {
      await addService.mutateAsync({
        name: newSvc.name,
        externalServiceId: newSvc.externalServiceId,
        pricePerThousand: Number.parseFloat(newSvc.pricePerThousand),
        minQty: BigInt(newSvc.minQty || "100"),
        maxQty: BigInt(newSvc.maxQty || "100000"),
      });
      toast.success("Service added");
      setNewSvc({
        name: "",
        externalServiceId: "",
        pricePerThousand: "",
        minQty: "",
        maxQty: "",
      });
    } catch {
      toast.error("Failed to add service");
    }
  };

  const handleRemoveService = async (id: bigint) => {
    try {
      await removeService.mutateAsync(id);
      toast.success("Service removed");
    } catch {
      toast.error("Failed to remove service");
    }
  };

  const startEdit = (svc: Service) => {
    setEditingService(svc);
    setEditSvc({
      name: svc.name,
      externalServiceId: svc.externalServiceId,
      pricePerThousand: svc.pricePerThousand.toString(),
      minQty: svc.minQty.toString(),
      maxQty: svc.maxQty.toString(),
      active: svc.active,
    });
  };

  const handleUpdateService = async () => {
    if (!editingService) return;
    try {
      await updateService.mutateAsync({
        id: editingService.id,
        name: editSvc.name,
        externalServiceId: editSvc.externalServiceId,
        pricePerThousand: Number.parseFloat(editSvc.pricePerThousand),
        minQty: BigInt(editSvc.minQty),
        maxQty: BigInt(editSvc.maxQty),
        active: editSvc.active,
      });
      toast.success("Service updated");
      setEditingService(null);
    } catch {
      toast.error("Failed to update service");
    }
  };

  const serviceFormFields = [
    { key: "name", label: "Name", placeholder: "e.g. Instagram Followers" },
    {
      key: "externalServiceId",
      label: "External Service ID",
      placeholder: "SMM API service ID",
    },
    {
      key: "pricePerThousand",
      label: "Price per 1000 (₹)",
      placeholder: "e.g. 0.99",
    },
    { key: "minQty", label: "Min Quantity", placeholder: "e.g. 100" },
    { key: "maxQty", label: "Max Quantity", placeholder: "e.g. 100000" },
  ];

  return (
    <main className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8" style={{ color: "#00d4ff" }} />
            <h1 className="font-display font-black text-3xl lg:text-4xl gradient-text">
              Admin Panel
            </h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Manage users, orders, payments, and services
          </p>
        </motion.div>

        <Tabs defaultValue="users" data-ocid="admin.tab">
          <TabsList className="bg-muted grid grid-cols-7 mb-6 w-full max-w-2xl">
            <TabsTrigger value="users" data-ocid="admin.tab">
              <Users className="w-4 h-4 mr-1" />
              Users
            </TabsTrigger>
            <TabsTrigger value="orders" data-ocid="admin.tab">
              <ListOrdered className="w-4 h-4 mr-1" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="payments" data-ocid="admin.tab">
              <CreditCard className="w-4 h-4 mr-1" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="services" data-ocid="admin.tab">
              <Settings className="w-4 h-4 mr-1" />
              Services
            </TabsTrigger>
            <TabsTrigger value="bluetick" data-ocid="admin.tab">
              💎 Blue Tick
            </TabsTrigger>
            <TabsTrigger value="utrdeposits" data-ocid="admin.tab">
              💰 UTR
            </TabsTrigger>
            <TabsTrigger value="refunds" data-ocid="admin.tab">
              ↩ Refunds
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <div className="card-glass rounded-xl p-6" data-ocid="users.table">
              <h2 className="font-bold text-lg mb-4">All Users</h2>
              {usersLoading ? (
                <div className="space-y-2" data-ocid="users.loading_state">
                  {["u1", "u2", "u3"].map((k) => (
                    <Skeleton key={k} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead>User ID</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Adjust Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(users ?? []).map((user, idx) => {
                        const userKey = user.userId.toString();
                        const shortId = `${userKey.slice(0, 8)}...${userKey.slice(-4)}`;
                        return (
                          <TableRow
                            key={userKey}
                            className="border-border hover:bg-muted/50"
                            data-ocid={`users.row.${idx + 1}`}
                          >
                            <TableCell className="font-mono text-xs">
                              {shortId}
                            </TableCell>
                            <TableCell className="font-bold gradient-text">
                              ₹{user.balance.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Input
                                  type="number"
                                  placeholder="Amount"
                                  className="w-28 h-8 text-xs bg-muted border-border"
                                  value={adjustAmounts[userKey] ?? ""}
                                  onChange={(e) =>
                                    setAdjustAmounts((prev) => ({
                                      ...prev,
                                      [userKey]: e.target.value,
                                    }))
                                  }
                                  data-ocid="users.input"
                                />
                                <Button
                                  size="sm"
                                  className="btn-gradient text-white border-0 h-8"
                                  onClick={() =>
                                    handleAdjust(user.userId, userKey)
                                  }
                                  disabled={adjustBalance.isPending}
                                  data-ocid={`users.save_button.${idx + 1}`}
                                >
                                  Apply
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  {(users ?? []).length === 0 && (
                    <div
                      className="text-center py-8 text-muted-foreground"
                      data-ocid="users.empty_state"
                    >
                      No users found
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <div className="card-glass rounded-xl p-6" data-ocid="orders.table">
              <h2 className="font-bold text-lg mb-4">All Orders</h2>
              {ordersLoading ? (
                <div className="space-y-2" data-ocid="orders.loading_state">
                  {["o1", "o2", "o3"].map((k) => (
                    <Skeleton key={k} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead>User</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Link</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
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
                        const userShort = `${order.userId.toString().slice(0, 8)}...`;
                        return (
                          <TableRow
                            key={order.id.toString()}
                            className="border-border hover:bg-muted/50"
                            data-ocid={`orders.row.${idx + 1}`}
                          >
                            <TableCell className="font-mono text-xs">
                              {userShort}
                            </TableCell>
                            <TableCell className="text-sm">
                              {svc?.name ?? `#${order.serviceId}`}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">
                              {order.link}
                            </TableCell>
                            <TableCell>{order.quantity.toString()}</TableCell>
                            <TableCell>
                              <OrderStatusBadge status={order.status} />
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {date}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  {(orders ?? []).length === 0 && (
                    <div
                      className="text-center py-8 text-muted-foreground"
                      data-ocid="orders.empty_state"
                    >
                      No orders found
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <div className="card-glass rounded-xl p-6">
              <h2 className="font-bold text-lg mb-4">Payment Requests</h2>
              {paymentsLoading ? (
                <div className="space-y-2" data-ocid="payments.loading_state">
                  {["p1", "p2", "p3"].map((k) => (
                    <Skeleton key={k} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead>User</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(payments ?? []).map((p, idx) => (
                        <TableRow
                          key={p.id.toString()}
                          className="border-border hover:bg-muted/50"
                          data-ocid={`payments.row.${idx + 1}`}
                        >
                          <TableCell className="font-mono text-xs">{`${p.userId.toString().slice(0, 8)}...`}</TableCell>
                          <TableCell className="font-bold gradient-text">
                            ₹{p.amount}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{p.paymentMethod}</Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {p.transactionId}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                p.approved
                                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                                  : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                              }
                            >
                              {p.approved ? "Approved" : "Pending"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {!p.approved && (
                              <Button
                                size="sm"
                                className="btn-gradient text-white border-0 h-8"
                                onClick={() => handleApprove(p.id)}
                                disabled={approvePayment.isPending}
                                data-ocid={`payments.confirm_button.${idx + 1}`}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" /> Approve
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {(payments ?? []).length === 0 && (
                    <div
                      className="text-center py-8 text-muted-foreground"
                      data-ocid="payments.empty_state"
                    >
                      No payment requests
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services">
            <div className="space-y-6">
              <div className="card-glass rounded-xl p-6">
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                  {editingService ? (
                    <Edit className="w-4 h-4" style={{ color: "#8b5cf6" }} />
                  ) : (
                    <Plus className="w-4 h-4" style={{ color: "#00d4ff" }} />
                  )}
                  {editingService ? "Edit Service" : "Add New Service"}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {serviceFormFields.map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <Label className="text-sm text-muted-foreground mb-1 block">
                        {label}
                      </Label>
                      <Input
                        placeholder={placeholder}
                        value={
                          editingService
                            ? (editSvc as any)[key]
                            : (newSvc as any)[key]
                        }
                        onChange={(e) => {
                          if (editingService)
                            setEditSvc((prev) => ({
                              ...prev,
                              [key]: e.target.value,
                            }));
                          else
                            setNewSvc((prev) => ({
                              ...prev,
                              [key]: e.target.value,
                            }));
                        }}
                        className="bg-muted border-border"
                        data-ocid="services.input"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-4">
                  <Button
                    className="btn-gradient text-white border-0"
                    onClick={
                      editingService ? handleUpdateService : handleAddService
                    }
                    disabled={addService.isPending || updateService.isPending}
                    data-ocid="services.submit_button"
                  >
                    {addService.isPending || updateService.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {editingService ? "Update Service" : "Add Service"}
                  </Button>
                  {editingService && (
                    <Button
                      variant="outline"
                      className="border-border"
                      onClick={() => setEditingService(null)}
                      data-ocid="services.cancel_button"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>

              <div
                className="card-glass rounded-xl p-6"
                data-ocid="services.table"
              >
                <h2 className="font-bold text-lg mb-4">All Services</h2>
                {servicesLoading ? (
                  <div className="space-y-2" data-ocid="services.loading_state">
                    {["s1", "s2", "s3"].map((k) => (
                      <Skeleton key={k} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border">
                          <TableHead>Name</TableHead>
                          <TableHead>External ID</TableHead>
                          <TableHead>Price/1000</TableHead>
                          <TableHead>Min/Max</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(services ?? []).map((svc, idx) => (
                          <TableRow
                            key={svc.id.toString()}
                            className="border-border hover:bg-muted/50"
                            data-ocid={`services.row.${idx + 1}`}
                          >
                            <TableCell className="font-medium">
                              {svc.name}
                            </TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              {svc.externalServiceId}
                            </TableCell>
                            <TableCell className="gradient-text font-bold">
                              ₹{svc.pricePerThousand}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {svc.minQty.toString()} / {svc.maxQty.toString()}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  svc.active
                                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                                    : "bg-red-500/20 text-red-400 border-red-500/30"
                                }
                              >
                                {svc.active ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 border-border"
                                  onClick={() => startEdit(svc)}
                                  data-ocid={`services.edit_button.${idx + 1}`}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 border-red-500/30 text-red-400 hover:bg-red-500/10"
                                  onClick={() => handleRemoveService(svc.id)}
                                  disabled={removeService.isPending}
                                  data-ocid={`services.delete_button.${idx + 1}`}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {(services ?? []).length === 0 && (
                      <div
                        className="text-center py-8 text-muted-foreground"
                        data-ocid="services.empty_state"
                      >
                        No services yet
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          {/* Blue Tick Orders Tab */}
          <TabsContent value="bluetick">
            <div className="card-glass rounded-xl p-6">
              <h2 className="font-bold text-lg mb-4">💎 Blue Tick Orders</h2>
              {blueTickOrders.length === 0 ? (
                <div
                  className="text-center py-8 text-muted-foreground"
                  data-ocid="bluetick_orders.empty_state"
                >
                  No Blue Tick submissions yet
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead>Instagram Username</TableHead>
                        <TableHead>Submitted At</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {blueTickOrders.map((order, idx) => (
                        <TableRow
                          key={order.id}
                          className="border-border hover:bg-muted/50"
                          data-ocid={`bluetick_orders.row.${idx + 1}`}
                        >
                          <TableCell className="font-mono text-sm font-bold">
                            @{order.username}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(order.submittedAt).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                order.status === "approved"
                                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                                  : order.status === "rejected"
                                    ? "bg-red-500/20 text-red-400 border-red-500/30"
                                    : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                              }
                            >
                              {order.status === "approved"
                                ? "✅ Approved"
                                : order.status === "rejected"
                                  ? "❌ Rejected"
                                  : "⏳ Pending"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {order.status === "pending" && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  className="btn-gradient text-white border-0 h-8"
                                  onClick={() =>
                                    handleBlueTickApprove(order.id)
                                  }
                                  data-ocid={`bluetick_orders.approve_button.${idx + 1}`}
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />{" "}
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-8"
                                  onClick={() => handleBlueTickReject(order.id)}
                                  data-ocid={`bluetick_orders.reject_button.${idx + 1}`}
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>
          {/* UTR Deposits Tab */}
          <TabsContent value="utrdeposits">
            <div className="card-glass rounded-xl p-6">
              <h2 className="font-bold text-lg mb-4">
                💰 UTR Deposit Requests
              </h2>
              {pendingUTRList.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No UTR submissions yet
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead>UTR / Ref No</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Bonus</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingUTRList.map((item, idx) => (
                        <TableRow
                          key={item.id}
                          className="border-border hover:bg-muted/50"
                        >
                          <TableCell className="font-mono text-sm font-bold">
                            {item.utr}
                          </TableCell>
                          <TableCell className="text-green-400 font-bold">
                            ₹{item.amount}
                          </TableCell>
                          <TableCell className="text-yellow-400">
                            +₹{item.bonus}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {item.time}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                item.status === "approved"
                                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                                  : item.status === "rejected"
                                    ? "bg-red-500/20 text-red-400 border-red-500/30"
                                    : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                              }
                            >
                              {item.status === "approved"
                                ? "✅ Approved"
                                : item.status === "rejected"
                                  ? "❌ Rejected"
                                  : "⏳ Pending"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {item.status === "pending" && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  className="btn-gradient text-white border-0 h-8"
                                  onClick={() => handleUTRApprove(item.id)}
                                  data-ocid={`utr_deposits.approve_button.${idx + 1}`}
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />{" "}
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-8"
                                  onClick={() => handleUTRReject(item.id)}
                                  data-ocid={`utr_deposits.reject_button.${idx + 1}`}
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="refunds">
            <RefundsAdminTab />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

function RefundsAdminTab() {
  const { refunds, updateStatus } = useRefunds();

  return (
    <div className="card-glass rounded-xl p-6" data-ocid="refunds.table">
      <h2 className="font-bold text-lg mb-4">Refund Requests</h2>
      {refunds.length === 0 ? (
        <div className="text-center py-8" data-ocid="refunds.empty_state">
          <p className="text-muted-foreground text-sm">
            No refund requests yet.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead>ID</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {refunds.map((r: RefundRequest, idx: number) => (
                <TableRow
                  key={r.id}
                  className="border-border"
                  data-ocid={`refunds.row.${idx + 1}`}
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {r.id.slice(0, 16)}…
                  </TableCell>
                  <TableCell className="font-medium">{r.fullName}</TableCell>
                  <TableCell>₹{r.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    {r.method === "upi" ? "UPI" : "Bank Transfer"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        r.status === "approved"
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : r.status === "rejected"
                            ? "bg-red-500/20 text-red-400 border-red-500/30"
                            : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                      }
                    >
                      {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(r.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    {r.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white border-0 h-8"
                          onClick={() =>
                            updateStatus(r.id, "approved" as RefundStatus)
                          }
                          data-ocid={`refunds.confirm_button.${idx + 1}`}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8"
                          onClick={() =>
                            updateStatus(r.id, "rejected" as RefundStatus)
                          }
                          data-ocid={`refunds.delete_button.${idx + 1}`}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
