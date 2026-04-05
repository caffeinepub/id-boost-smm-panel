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
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
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
export interface Order {
    id: bigint;
    status: OrderStatus;
    userId: UserId;
    link: string;
    createdAt: bigint;
    quantity: bigint;
    serviceId: ServiceId;
}
export interface UserInfo {
    balance: Balance;
    userId: UserId;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface http_header {
    value: string;
    name: string;
}
export type UserId = Principal;
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface PaymentRequest {
    id: bigint;
    paymentMethod: PaymentMethod;
    userId: UserId;
    approved: boolean;
    amount: Balance;
    transactionId: string;
}
export interface UserProfile {
    balance: Balance;
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
    /**
     * / HTTP outcall to SMM Panel external API
     */
    placeOrderExternal(serviceKey: string, link: string, quantity: bigint): Promise<string>;
    removeService(id: ServiceId): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateService(id: ServiceId, name: string, externalServiceId: string, pricePerThousand: number, minQty: bigint, maxQty: bigint, active: boolean): Promise<void>;
}
