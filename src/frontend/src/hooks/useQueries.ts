import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Order, PaymentRequest, Service, UserInfo } from "../backend";
import type { PaymentMethod } from "../backend";
import { useActor } from "./useActor";

export function useServices() {
  const { actor, isFetching } = useActor();
  return useQuery<Service[]>({
    queryKey: ["services"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getServices();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMyOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["myOrders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["allOrders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllUsers() {
  const { actor, isFetching } = useActor();
  return useQuery<UserInfo[]>({
    queryKey: ["allUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllPaymentRequests() {
  const { actor, isFetching } = useActor();
  return useQuery<PaymentRequest[]>({
    queryKey: ["allPayments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPaymentRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      serviceId,
      link,
      quantity,
    }: { serviceId: bigint; link: string; quantity: bigint }) => {
      if (!actor) throw new Error("Not connected");
      return actor.placeOrder(serviceId, link, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myOrders"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

export function useAddFunds() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      amount,
      paymentMethod,
      transactionId,
    }: {
      amount: number;
      paymentMethod: PaymentMethod;
      transactionId: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addFunds(amount, paymentMethod, transactionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      queryClient.invalidateQueries({ queryKey: ["allPayments"] });
    },
  });
}

export function useApprovePayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (paymentId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.approvePayment(paymentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allPayments"] });
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
}

export function useAdjustBalance() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, amount }: { userId: any; amount: number }) => {
      if (!actor) throw new Error("Not connected");
      return actor.adjustBalance(userId, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
}

export function useAddService() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      externalServiceId,
      pricePerThousand,
      minQty,
      maxQty,
    }: {
      name: string;
      externalServiceId: string;
      pricePerThousand: number;
      minQty: bigint;
      maxQty: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addService(
        name,
        externalServiceId,
        pricePerThousand,
        minQty,
        maxQty,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
}

export function useRemoveService() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.removeService(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
}

export function useUpdateService() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      externalServiceId,
      pricePerThousand,
      minQty,
      maxQty,
      active,
    }: {
      id: bigint;
      name: string;
      externalServiceId: string;
      pricePerThousand: number;
      minQty: bigint;
      maxQty: bigint;
      active: boolean;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateService(
        id,
        name,
        externalServiceId,
        pricePerThousand,
        minQty,
        maxQty,
        active,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
}
