import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PaymentMethod } from "../backend";
import { useAddFunds } from "../hooks/useQueries";

const QR_CELLS = [
  { id: "tl", filled: true },
  { id: "tm", filled: false },
  { id: "tr", filled: true },
  { id: "ml", filled: false },
  { id: "mm", filled: true },
  { id: "mr", filled: false },
  { id: "bl", filled: true },
  { id: "bm", filled: false },
  { id: "br", filled: true },
];

interface AddFundsModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddFundsModal({ open, onClose }: AddFundsModalProps) {
  const [amount, setAmount] = useState("");
  const [utrId, setUtrId] = useState("");
  const addFunds = useAddFunds();

  const handleRazorpay = async () => {
    const amt = Number.parseFloat(amount);
    if (!amt || amt <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    const txnId = `RZP_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    try {
      await addFunds.mutateAsync({
        amount: amt,
        paymentMethod: PaymentMethod.fiat,
        transactionId: txnId,
      });
      toast.success(`₹${amt} added successfully! Transaction ID: ${txnId}`);
      setAmount("");
      onClose();
    } catch {
      toast.error("Payment failed. Please try again.");
    }
  };

  const handleUPI = async () => {
    const amt = Number.parseFloat(amount);
    if (!amt || amt <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!utrId.trim()) {
      toast.error("Please enter your UTR / Transaction ID");
      return;
    }
    try {
      await addFunds.mutateAsync({
        amount: amt,
        paymentMethod: PaymentMethod.fiat,
        transactionId: utrId.trim(),
      });
      toast.success("Payment request submitted! Awaiting approval.");
      setAmount("");
      setUtrId("");
      onClose();
    } catch {
      toast.error("Submission failed. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="card-glass max-w-md"
        data-ocid="add_funds.dialog"
      >
        <DialogHeader>
          <DialogTitle className="gradient-text text-xl font-display">
            Add Funds
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="razorpay">
          <TabsList className="grid w-full grid-cols-2 bg-muted">
            <TabsTrigger value="razorpay" data-ocid="add_funds.tab">
              💳 Razorpay
            </TabsTrigger>
            <TabsTrigger value="upi" data-ocid="add_funds.tab">
              📱 UPI Manual
            </TabsTrigger>
          </TabsList>

          <TabsContent value="razorpay" className="space-y-4 mt-4">
            <div className="p-3 rounded-lg gradient-bg-soft border border-border text-sm text-muted-foreground">
              <CreditCard className="w-4 h-4 inline mr-2 text-primary" />
              Secure payment via Razorpay — India
            </div>
            <div>
              <Label htmlFor="rzp-amount">Amount (₹)</Label>
              <Input
                id="rzp-amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 bg-muted border-border"
                data-ocid="add_funds.input"
              />
            </div>
            <Button
              className="w-full btn-gradient text-white border-0"
              onClick={handleRazorpay}
              disabled={addFunds.isPending}
              data-ocid="add_funds.submit_button"
            >
              {addFunds.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Pay with Razorpay
            </Button>
          </TabsContent>

          <TabsContent value="upi" className="space-y-4 mt-4">
            <div className="p-4 rounded-lg gradient-bg-soft border border-border text-center">
              <p className="text-sm text-muted-foreground mb-1">UPI ID</p>
              <p className="font-bold text-primary text-lg">idboost@upi</p>
              <div className="mt-3 mx-auto w-32 h-32 bg-muted rounded-lg flex items-center justify-center">
                <div className="grid grid-cols-3 gap-1">
                  {QR_CELLS.map((cell) => (
                    <div
                      key={cell.id}
                      className="w-4 h-4 rounded-sm"
                      style={{
                        background: cell.filled
                          ? "linear-gradient(135deg, #00d4ff, #8b5cf6)"
                          : "transparent",
                        border: "1px solid rgba(255,255,255,0.2)",
                      }}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Scan or copy UPI ID above
              </p>
            </div>
            <div>
              <Label htmlFor="upi-amount">Amount (₹)</Label>
              <Input
                id="upi-amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 bg-muted border-border"
                data-ocid="add_funds.input"
              />
            </div>
            <div>
              <Label htmlFor="utr">UTR / Transaction ID</Label>
              <Input
                id="utr"
                placeholder="Enter UTR number from your UPI app"
                value={utrId}
                onChange={(e) => setUtrId(e.target.value)}
                className="mt-1 bg-muted border-border"
                data-ocid="add_funds.textarea"
              />
            </div>
            <Button
              className="w-full btn-gradient text-white border-0"
              onClick={handleUPI}
              disabled={addFunds.isPending}
              data-ocid="add_funds.submit_button"
            >
              {addFunds.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Submit Payment Request
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
