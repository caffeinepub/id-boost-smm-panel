import Map "mo:core/Map";
import Array "mo:core/Array";
import Blob "mo:core/Blob";
import Text "mo:core/Text";
import Float "mo:core/Float";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import OutCall "http-outcalls/outcall"; // HTTP outcalls

actor {
  // Initialize access control
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Type definitions
  type UserId = Principal;

  module Balance {
    public func compare(balance1 : Balance, balance2 : Balance) : Order.Order {
      Float.compare(balance1, balance2);
    };
  };
  type Balance = Float;

  type ServiceId = Nat;

  type PaymentMethod = {
    #crypto;
    #fiat;
  };

  type PaymentRequest = {
    id : Nat;
    userId : UserId;
    amount : Balance;
    paymentMethod : PaymentMethod;
    transactionId : Text;
    approved : Bool;
  };

  type Service = {
    id : ServiceId;
    name : Text;
    externalServiceId : Text;
    pricePerThousand : Float;
    minQty : Nat;
    maxQty : Nat;
    active : Bool;
  };

  type OrderStatus = {
    #pending;
    #processing;
    #completed;
    #failed;
  };

  type Order = {
    id : Nat;
    userId : UserId;
    serviceId : ServiceId;
    link : Text;
    quantity : Nat;
    status : OrderStatus;
    createdAt : Int;
  };

  type UserProfile = {
    balance : Balance;
  };

  type UserInfo = {
    userId : UserId;
    balance : Balance;
  };

  // State variables
  let userProfiles = Map.empty<Principal, UserProfile>();
  let services = Map.empty<ServiceId, Service>();
  let orders = Map.empty<Nat, Order>();
  let paymentRequests = Map.empty<Nat, PaymentRequest>();

  var nextServiceId : Nat = 5;
  var nextOrderId : Nat = 1;
  var nextPaymentId : Nat = 1;

  // Initialize default services
  private func initDefaultServices() {
    services.add(1, {
      id = 1;
      name = "Instagram Followers";
      externalServiceId = "1";
      pricePerThousand = 5.0;
      minQty = 100;
      maxQty = 10000;
      active = true;
    });
    services.add(2, {
      id = 2;
      name = "Instagram Likes";
      externalServiceId = "2";
      pricePerThousand = 3.0;
      minQty = 50;
      maxQty = 5000;
      active = true;
    });
    services.add(3, {
      id = 3;
      name = "Instagram Views";
      externalServiceId = "3";
      pricePerThousand = 2.0;
      minQty = 100;
      maxQty = 50000;
      active = true;
    });
    services.add(4, {
      id = 4;
      name = "Instagram Comments";
      externalServiceId = "4";
      pricePerThousand = 10.0;
      minQty = 10;
      maxQty = 1000;
      active = true;
    });
  };

  // Initialize on first call
  private var initialized = false;
  private func ensureInitialized() {
    if (not initialized) {
      initDefaultServices();
      initialized := true;
    };
  };

  // Helper: Get or create user profile
  private func getOrCreateUserProfile(userId : Principal) : UserProfile {
    ensureInitialized();
    switch (userProfiles.get(userId)) {
      case (?profile) { profile };
      case (null) {
        let newProfile : UserProfile = { balance = 0.0 };
        userProfiles.add(userId, newProfile);
        newProfile;
      };
    };
  };

  // User Profile Functions (required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Service Management
  public query func getServices() : async [Service] {
    ensureInitialized();
    services.values().toArray()
      .filter(func(s : Service) : Bool { s.active });
  };

  public shared ({ caller }) func addService(
    name : Text,
    externalServiceId : Text,
    pricePerThousand : Float,
    minQty : Nat,
    maxQty : Nat
  ) : async ServiceId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add services");
    };

    let id = nextServiceId;
    nextServiceId += 1;

    let service : Service = {
      id;
      name;
      externalServiceId;
      pricePerThousand;
      minQty;
      maxQty;
      active = true;
    };

    services.add(id, service);
    id;
  };

  public shared ({ caller }) func updateService(
    id : ServiceId,
    name : Text,
    externalServiceId : Text,
    pricePerThousand : Float,
    minQty : Nat,
    maxQty : Nat,
    active : Bool
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update services");
    };

    switch (services.get(id)) {
      case (null) { Runtime.trap("Service not found") };
      case (?_) {
        let service : Service = {
          id;
          name;
          externalServiceId;
          pricePerThousand;
          minQty;
          maxQty;
          active;
        };
        services.add(id, service);
      };
    };
  };

  public shared ({ caller }) func removeService(id : ServiceId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can remove services");
    };

    switch (services.get(id)) {
      case (null) { Runtime.trap("Service not found") };
      case (?service) {
        let updatedService : Service = {
          id = service.id;
          name = service.name;
          externalServiceId = service.externalServiceId;
          pricePerThousand = service.pricePerThousand;
          minQty = service.minQty;
          maxQty = service.maxQty;
          active = false;
        };
        services.add(id, updatedService);
      };
    };
  };

  // Order Management
  public shared ({ caller }) func placeOrder(
    serviceId : ServiceId,
    link : Text,
    quantity : Nat
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can place orders");
    };

    ensureInitialized();

    // Get service
    let service = switch (services.get(serviceId)) {
      case (null) { Runtime.trap("Service not found") };
      case (?s) {
        if (not s.active) { Runtime.trap("Service is not active") };
        s;
      };
    };

    // Validate quantity
    if (quantity < service.minQty or quantity > service.maxQty) {
      Runtime.trap("Quantity out of range");
    };

    // Get user profile and check balance
    let profile = getOrCreateUserProfile(caller);
    let cost = (quantity.toFloat() / 1000.0) * service.pricePerThousand;
    if (profile.balance < cost) {
      Runtime.trap("Insufficient balance");
    };

    let updatedProfile : UserProfile = {
      balance = profile.balance - cost;
    };
    userProfiles.add(caller, updatedProfile);

    // Create order
    let orderId = nextOrderId;
    nextOrderId += 1;

    let order : Order = {
      id = orderId;
      userId = caller;
      serviceId;
      link;
      quantity;
      status = #pending;
      createdAt = Time.now();
    };

    orders.add(orderId, order);

    // Note: HTTP outcall to external SMM API would be implemented here
    orderId;
  };

  public query ({ caller }) func getMyOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their orders");
    };

    orders.values().toArray()
      .filter(func(o : Order) : Bool { o.userId == caller });
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };

    orders.values().toArray();
  };

  // Payment Management
  public shared ({ caller }) func addFunds(
    amount : Balance,
    paymentMethod : PaymentMethod,
    transactionId : Text
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add funds");
    };

    ensureInitialized();
    ignore getOrCreateUserProfile(caller); // Ensure user profile exists

    let id = nextPaymentId;
    nextPaymentId += 1;

    let paymentRequest : PaymentRequest = {
      id;
      paymentMethod;
      transactionId;
      userId = caller;
      amount;
      approved = false;
    };

    paymentRequests.add(id, paymentRequest);
    id;
  };

  public shared ({ caller }) func approvePayment(paymentId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can approve payments");
    };

    let paymentRequest = switch (paymentRequests.get(paymentId)) {
      case (null) { Runtime.trap("Payment request not found") };
      case (?pr) {
        if (pr.approved) { Runtime.trap("Payment already approved") };
        pr;
      };
    };

    // Update payment request
    let updatedRequest : PaymentRequest = {
      id = paymentRequest.id;
      userId = paymentRequest.userId;
      amount = paymentRequest.amount;
      paymentMethod = paymentRequest.paymentMethod;
      transactionId = paymentRequest.transactionId;
      approved = true;
    };
    paymentRequests.add(paymentId, updatedRequest);

    // Add balance to user
    let profile = getOrCreateUserProfile(paymentRequest.userId);
    let updatedProfile : UserProfile = {
      balance = profile.balance + paymentRequest.amount;
    };
    userProfiles.add(paymentRequest.userId, updatedProfile);
  };

  public shared ({ caller }) func adjustBalance(userId : Principal, amount : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can adjust balance");
    };

    let profile = getOrCreateUserProfile(userId);
    let newBalance = profile.balance + amount;

    if (newBalance < 0.0) {
      Runtime.trap("Cannot set negative balance");
    };

    let updatedProfile : UserProfile = {
      balance = newBalance;
    };
    userProfiles.add(userId, updatedProfile);
  };

  public query ({ caller }) func getPaymentRequests() : async [PaymentRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view payment requests");
    };

    paymentRequests.values().toArray()
      .filter(func(pr : PaymentRequest) : Bool { not pr.approved });
  };

  public query ({ caller }) func getAllPaymentRequests() : async [PaymentRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all payment requests");
    };

    paymentRequests.values().toArray();
  };

  // Admin Functions
  public query ({ caller }) func getAllUsers() : async [UserInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };

    userProfiles.entries().toArray()
      .map(func((userId, profile) : (Principal, UserProfile)) : UserInfo {
        { userId; balance = profile.balance };
      });
  };

  // Helper to map service keys to external IDs
  func getServiceId(serviceKey : Text) : ?Nat {
    switch (serviceKey) {
      case ("youtube_subscribers") { ?230 };
      case ("youtube_views") { ?4568 };
      case ("instagram_followers") { ?4679 };
      case ("instagram_views") { ?1348 };
      case ("facebook_followers") { ?4070 };
      case ("facebook_views") { ?4772 };
      case (_) { null };
    };
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  /// HTTP outcall to SMM Panel external API
  public shared ({ caller }) func placeOrderExternal(serviceKey : Text, link : Text, quantity : Nat) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can place external orders");
    };

    // Validate input
    if (quantity < 100) { Runtime.trap("Minimum quantity is 100") };
    if (link.size() == 0) { Runtime.trap("Link cannot be empty") };

    // Map service key to external ID
    let externalServiceId = getServiceId(serviceKey);
    if (externalServiceId == null) {
      Runtime.trap("Invalid service key");
    };

    // Build body string as application/x-www-form-urlencoded
    let requestBody = "key=d99a3954e1ec2d10c29c74ba9a385658&action=add&service=" # externalServiceId.toText() # "&link=" # link # "&quantity=" # quantity.toText();

    // Make HTTP external call using the mixin interface
    let response = await OutCall.httpPostRequest(
      "https://apestsmmpanels.com/api/v2",
      [{
        name = "Content-Type"; value = "application/x-www-form-urlencoded";
      }],
      requestBody,
      transform,
    );

    // Response is raw JSON text from external API
    response;
  };
};
