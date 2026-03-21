import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type ServiceId = bigint;
export type UserId = Principal;
export type Balance = number;
export interface Service {
    id: ServiceId;
    pricePerThousand: number;
    active: boolean;
    name: string;
    minQty: bigint;
    maxQty: bigint;
    externalServiceId: string;
}
export interface PaymentRequest {
    id: bigint;
    paymentMethod: PaymentMethod;
    userId: UserId;
    approved: boolean;
    amount: Balance;
    transactionId: string;
}
export interface UserInfo {
    balance: Balance;
    userId: UserId;
}
export interface UserProfile {
    balance: Balance;
}
export interface Order {
    id: bigint;
    status: OrderStatus;
    userId: UserId;
    link: string;
    createdAt: bigint;
    quantity: bigint;
    serviceId: ServiceId;
}
export enum OrderStatus {
    pending = "pending",
    completed = "completed",
    processing = "processing",
    failed = "failed"
}
export enum PaymentMethod {
    fiat = "fiat",
    crypto = "crypto"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addFunds(amount: Balance, paymentMethod: PaymentMethod, transactionId: string): Promise<bigint>;
    addService(name: string, externalServiceId: string, pricePerThousand: number, minQty: bigint, maxQty: bigint): Promise<ServiceId>;
    adjustBalance(userId: Principal, amount: number): Promise<void>;
    approvePayment(paymentId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllOrders(): Promise<Array<Order>>;
    getAllPaymentRequests(): Promise<Array<PaymentRequest>>;
    getAllUsers(): Promise<Array<UserInfo>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMyOrders(): Promise<Array<Order>>;
    getPaymentRequests(): Promise<Array<PaymentRequest>>;
    getServices(): Promise<Array<Service>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(serviceId: ServiceId, link: string, quantity: bigint): Promise<bigint>;
    removeService(id: ServiceId): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateService(id: ServiceId, name: string, externalServiceId: string, pricePerThousand: number, minQty: bigint, maxQty: bigint, active: boolean): Promise<void>;
}
