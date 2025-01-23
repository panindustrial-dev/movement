
import ICRC72OrchestratorService "../../icrc72-orchestrator.mo/src/service";

import ICRC72SubscriberService "../../icrc72-subscriber.mo/src/service";
import ICRC72BroadcasterService "../../icrc72-broadcaster.mo/src/service";


import D "mo:base/Debug";
import Principal "mo:base/Principal";
import Timer "mo:base/Timer";
import Nat "mo:base/Nat";
import Vector "mo:vector";
import Text "mo:base/Text";
import Error "mo:base/Error";
import Map "mo:map/Map";
import Nat32 "mo:base/Nat32";


shared (deployer) actor class OrchestratorMock<system>()  = this {

  let debug_channel = {
    announce = true;
    cycles = true;
  };

  var scenario = "default";

  public shared(msg) func set_scenario(new_scenario : Text) : () {
    scenario := new_scenario;
  };




  let thisPrincipal = Principal.fromActor(this);

  
  var receivedNotifications = Vector.new<[ICRC72SubscriberService.EventNotification]>();

  public shared(msg) func icrc72_handle_notification(items : [ICRC72SubscriberService.EventNotification]) : () {
    debug if(debug_channel.announce) D.print("CANISTER: Received notification: " # debug_show(items));
    ignore Vector.add(receivedNotifications, items);
  };

  public query func getReceivedNotifications() : async [[ICRC72SubscriberService.EventNotification]]{
    return Vector.toArray(receivedNotifications);
  };



  let publishMessages = Vector.new<[ICRC72BroadcasterService.Event]>();

  public shared(msg) func icrc72_publish(messages : [ICRC72BroadcasterService.Event]) : async [?ICRC72BroadcasterService.PublishResult] {
    debug if(debug_channel.announce) D.print("CANISTER: Received publish: " # debug_show(messages));
    Vector.add(publishMessages, messages);

    switch(scenario){
      case("defaultPublisher"){
        return [?#Ok([1])];
      };
      case("defaultPublisherMultiSend"){
        return [?#Ok([1,2,3])];
      };
      case("errorOnNotify"){
        D.trap("No route to canister");
      };
      case(_){
        return [?#Err(#GenericError({error_code=1000;message="Not implemented"}))];
      };
    };
    
  };

  var publicationDeletes = Vector.new<[ICRC72OrchestratorService.PublicationDeleteRequest]>();

  public shared(msg) func icrc72_delete_publication(request: [ICRC72OrchestratorService.PublicationDeleteRequest]) : async [ICRC72OrchestratorService.PublicationDeleteResult] {
    debug if(debug_channel.announce) D.print("CANISTER: Delete Publication: " # debug_show(request));
    Vector.add(publicationDeletes, request);
    return [?#Ok(true)];
  };
  public query(msg) func getPublicationDeletes() : async [[ICRC72OrchestratorService.PublicationDeleteRequest]] {
    return Vector.toArray<[ICRC72OrchestratorService.PublicationDeleteRequest]>(publicationDeletes);
  };

  public query(msg) func getPublishMessages() : async [[ICRC72BroadcasterService.Event]] {
    return Vector.toArray<[ICRC72BroadcasterService.Event]>(publishMessages);
  };

  var existingPubs = false;

  public shared(msg) func icrc72_register_publication(request : [ICRC72OrchestratorService.PublicationRegistration]) : async [ICRC72OrchestratorService.PublicationRegisterResult] {
    debug if(debug_channel.announce) D.print("CANISTER: Publication Registration: " # debug_show(request));

    if(existingPubs == false){
      existingPubs := true;
     return [?#Ok(777)];
    };
    throw Error.reject("Publication already exists");
  };

  public query(msg) func get_subnet_for_canister() : async {
    #Ok : { subnet_id : ?Principal };
    #Err : Text;
  } {
    return #Ok({subnet_id = ?Principal.fromActor(this)});
  };

  public shared(msg) func simulateBroadcasterReady(orchestrator: Principal) : async () {
    let service: actor {
      broadcaster_ready() : async ();
    } = actor(Principal.toText(orchestrator));

    await service.broadcaster_ready();


    return;
  };

  var publicationUpdates = Vector.new<[ICRC72OrchestratorService.PublicationUpdateRequest]>();  

  public query(msg) func getPublicationUpdates() : async [[ICRC72OrchestratorService.PublicationUpdateRequest]] {
    return Vector.toArray<[ICRC72OrchestratorService.PublicationUpdateRequest]>(publicationUpdates);
  };
  public shared(msg) func icrc72_update_publication(request : [ICRC72OrchestratorService.PublicationUpdateRequest]) : async [ICRC72OrchestratorService.PublicationUpdateResult] {
    debug if(debug_channel.announce) D.print("CANISTER: Publication Update: " # debug_show(request));
    Vector.add(publicationUpdates, request);
    return [?#Ok(true)];
  };

  var progressiveID= 776;

  public shared(msg) func icrc72_register_subscription(request : [ICRC72OrchestratorService.SubscriptionRegistration]) : async [ICRC72OrchestratorService.SubscriptionRegisterResult] {
    debug if(debug_channel.announce) D.print("CANISTER: register subscription: " # debug_show(request));
    switch(scenario){
      case("default"){
        progressiveID := progressiveID + 1;
        return [?#Ok(progressiveID)];
      };
      case("defaultBroadcaster"){
        progressiveID := progressiveID + 1;
        return [?#Ok(progressiveID)];
      };
      case("defaultPublisher"){
        progressiveID := progressiveID + 1;
        if(Text.startsWith(request[0].namespace, #text("icrc72:publisher:sys:"))){
         
            return [?#Ok(progressiveID)];
        };
        if(Text.startsWith(request[0].namespace, #text("icrc72:subscriber:sys:"))){
          progressiveID := progressiveID + 1 + 1;
          
            return [?#Ok(progressiveID)];
        };  
        return [?#Err(#GenericBatchError("Not implemented"))];
      };
      case("testUpdateSub"){
        progressiveID := progressiveID + 1 + 1;
        return [?#Ok(progressiveID)];
      };
      case("testNotifyBroadcasterOfPublisher"){
        progressiveID := progressiveID + 1;
        return [?#Ok(progressiveID)];
      };
      case("errorOnNotify"){
        D.trap("No route to canister");
      };
      case(_){
        return [?#Err(#GenericBatchError("Not implemented"))];
      };
    };
  };

  var subscriptionUpdates : Vector.Vector<[ICRC72OrchestratorService.SubscriptionUpdateRequest]> = Vector.new<[ICRC72OrchestratorService.SubscriptionUpdateRequest]>();

  public query(msg) func getSubscriptionUpdates() : async [[ICRC72OrchestratorService.SubscriptionUpdateRequest]] {
    return Vector.toArray<[ICRC72OrchestratorService.SubscriptionUpdateRequest]>(subscriptionUpdates);
  };

  public shared(msg) func icrc72_update_subscription(request : [ICRC72OrchestratorService.SubscriptionUpdateRequest]) : async [ICRC72OrchestratorService.SubscriptionUpdateResult] {
    debug if(debug_channel.announce) D.print("CANISTER: Subscription Update: " # debug_show(request));

    Vector.add(subscriptionUpdates, request);
    debug if(debug_channel.announce) D.print("CANISTER: Subscription finished returning: " # debug_show(request));
    return [?#Ok(true)];
  };

  public shared(msg) func icrc72_get_valid_broadcaster() : async ICRC72OrchestratorService.ValidBroadcastersResponse {
    debug if(debug_channel.announce) D.print("CANISTER: Get Valid Broadcaster: " # debug_show(msg.caller));
    return #list([Principal.fromActor(this)]);
  };

  var confirmNotifications : Vector.Vector<[Nat]> = Vector.new<[Nat]>();

  //used to test confirm notification
  public shared(msg) func icrc72_confirm_notifications(items : [Nat]) : async ICRC72BroadcasterService.ConfirmMessageResult {
    debug if(debug_channel.announce) D.print("CANISTER: Received confirm: " # debug_show(items));
    Vector.add(confirmNotifications, items);
    return #allAccepted;
  };

  public query(msg) func getConfirmNotices() : async [[Nat]] {
    
    return Vector.toArray<[Nat]>(confirmNotifications);
  };

  public query(msg) func icrc72_get_publishers(params: {
      prev: ?Principal;
      take: ?Nat;
      filter: ?ICRC72OrchestratorService.OrchestrationFilter;
    }) : async [ICRC72OrchestratorService.PublisherInfo] {
    debug if(debug_channel.announce) D.print("CANISTER: Get Publishers: " # debug_show(params));
    return [{
      publisher= Principal.fromActor(this);
      stats = [];
    }]
  };

  public query(msg) func icrc72_get_publications(params: {
      prev: ?Text;
      take: ?Nat;
      filter: ?ICRC72OrchestratorService.OrchestrationFilter;
    }) : async [ICRC72OrchestratorService.PublicationInfo] {
    debug if(debug_channel.announce) D.print("CANISTER: Get Publication: " # debug_show(params));
    switch(scenario){
      case("default"){
        return [{
          namespace = "test";
          publicationId = 777;
          config = [];
          stats = [];
        }];
      };
      case("testNotifyBroadcasterOfPublisher"){
        debug if(debug_channel.announce) D.print("CANISTER: Get Publication scenario testNotifyBroadcasterOfPublisher: " # debug_show(params));
        if((do?{params.filter!.slice[0]}) == ?#ByNamespace("anamespace")){
          debug if(debug_channel.announce) D.print("CANISTER: Get Publication scenario testNotifyBroadcasterOfPublisher anamespce: " # debug_show(params));
          return [{
            namespace = "anamespace";
            publicationId = 777;
            config = [];
            stats = [];
          }];
        } else if((do?{params.filter!.slice[0]}) == ?#ByNamespace("anamespace2")){
           debug if(debug_channel.announce) D.print("CANISTER: Get Publication scenario testNotifyBroadcasterOfPublisher anamespce2: " # debug_show(params));
          return [{
            namespace = "anamespace2";
            publicationId = 778;
            config = [];
            stats = [];
          }];
        } else if((do?{params.filter!.slice[0]}) == ?#ByNamespace("anamespace3")){
          return [{
            namespace = "anamespace3";
            publicationId = 779;
            config = [];
            stats = [];
          }];
        } else if((do?{params.filter!.slice[0]}) == ?#ByNamespace("anamespace4")){
          return [{
            namespace = "anamespace4";
            publicationId = 780;
            config = [];
            stats = [];
          }];
        } else {
          D.trap("No namespace");
        };
        
      };
      case(_){
        [{
          namespace = "test";
          publicationId = 777;
          config = [];
          stats = [];
        }]
      };
    };
    
  };

  

  public query(msg) func icrc72_get_subscribers(params: {
      prev: ?Principal;
      take: ?Nat;
      filter: ?ICRC72OrchestratorService.OrchestrationFilter;
    }) : async [ICRC72OrchestratorService.SubscriberInfo] {
    debug if(debug_channel.announce) D.print("CANISTER: Get subscribers: " # debug_show(params));

    switch(scenario){
      case("default"){
        return [{
          subscriber = Principal.fromActor(this);
          config =[];
          subscriptions = null;
          stats= [];
        }];
      };
      case("testUpdateSub"){
       if(Vector.size(subscriptionUpdates) == 1){
          return [{
            subscriber = Principal.fromActor(this);
            config = [Vector.get(subscriptionUpdates ,0)[0].config];
            subscriptions = ?[];
            stats= [];
          }];
       } else {
          D.trap("No subscription updates");
       };

      };
      case("testNotifyBroadcasterOfPublisher"){
        debug if(debug_channel.announce) D.print("CANISTER: Get Subscriber scenario testNotifyBroadcasterOfPublisher: " # debug_show(params));
        if((do?{params.filter!.slice[1]}) == ?#ByNamespace("anamespace")){
          debug if(debug_channel.announce) D.print("CANISTER: Get Publication scenario testNotifyBroadcasterOfPublisher anamespce: " # debug_show(params));
          
          return [{
            subscriber = switch((do?{params.filter!.slice[2]})){
              case(?#BySubscriber(val)) val;
              case(_) D.trap("No subscriber");
            };
            subscriptions = null;
            config = [];
            stats = [];
          }];
        } else if((do?{params.filter!.slice[1]}) == ?#ByNamespace("anamespace2")){
           debug if(debug_channel.announce) D.print("CANISTER: Get Publication scenario testNotifyBroadcasterOfPublisher anamespce2: " # debug_show(params));
          return [{
            subscriber = switch((do?{params.filter!.slice[2]})){
              case(?#BySubscriber(val)) val;
              case(_) D.trap("No subscriber");
            };
            subscriptions = null;
            config = [];
            stats = [];
          }];
        } else if((do?{params.filter!.slice[1]}) == ?#ByNamespace("anamespace3")){
           return [{
            subscriber = switch((do?{params.filter!.slice[2]})){
              case(?#BySubscriber(val)) val;
              case(_) D.trap("No subscriber");
            };
            subscriptions = null;
            config = [];
            stats = [];
          }];
        } else if((do?{params.filter!.slice[1]}) == ?#ByNamespace("anamespace4")){
           return [{
            subscriber = switch((do?{params.filter!.slice[2]})){
              case(?#BySubscriber(val)) val;
              case(_) D.trap("No subscriber");
            };
            subscriptions = null;
            config = [];
            stats = [];
          }];
        } else {
          D.trap("No namespace");
        };
        
      };
      case(_){
         D.trap("Not implemented");
      };
    };
    
  };

  public query(msg) func icrc72_get_subscriptions(params: {
      prev: ?Text;
      take: ?Nat;
      filter: ?ICRC72OrchestratorService.OrchestrationFilter;
    }) : async [ICRC72OrchestratorService.SubscriptionInfo] {
    debug if(debug_channel.announce) D.print("CANISTER: Get Subscription: " # debug_show(params));

    switch(scenario){


      case("testNotifyBroadcasterOfPublisher"){
        debug if(debug_channel.announce) D.print("CANISTER: Get Subscriber scenario testNotifyBroadcasterOfPublisher: " # debug_show(params));
        if((do?{params.filter!.slice[0]}) == ?#ByNamespace("anamespace")){
          debug if(debug_channel.announce) D.print("CANISTER: Get Publication scenario testNotifyBroadcasterOfPublisher anamespce: " # debug_show(params));
          
          return [{

            subscriptionId = 777 + Nat32.toNat(Text.hash(debug_show(params)));

            namespace = "anamespace";
            config = [];
            stats = [];
          }];
        } else if((do?{params.filter!.slice[0]}) == ?#ByNamespace("anamespace2")){
          debug if(debug_channel.announce) D.print("CANISTER: Get Publication scenario testNotifyBroadcasterOfPublisher anamespce2: " # debug_show(params));
           debug if(debug_channel.announce) D.print("CANISTER: Get Publication scenario testNotifyBroadcasterOfPublisher anamespce2: " # debug_show(params));
          return [{

            subscriptionId = 778 + Nat32.toNat(Text.hash(debug_show(params)));
            namespace = "anamespace2";
            config = [];
            stats = [];
          }];
        } else if((do?{params.filter!.slice[0]}) == ?#ByNamespace("anamespace3")){
          debug if(debug_channel.announce) D.print("CANISTER: Get Publication scenario testNotifyBroadcasterOfPublisher anamespce3: " # debug_show(params));
           return [{
           
            subscriptionId = 779 + Nat32.toNat(Text.hash(debug_show(params)));
            namespace = "anamespace3";
            config = [];
            stats = [];
          }];
        } else if((do?{params.filter!.slice[0]}) == ?#ByNamespace("anamespace4")){
          debug if(debug_channel.announce) D.print("CANISTER: Get Publication scenario testNotifyBroadcasterOfPublisher anamespce4: " # debug_show(params));
           return [{
           
            subscriptionId = 780 + Nat32.toNat(Text.hash(debug_show(params)));
            namespace = "anamespace4";
            config = [];
            stats = [];
          }];
        } else {
          D.trap("No namespace");
        };
        
      };
      
      case(_){
        [{
          subscriptionId = 777;
          namespace = "test";
          config = [];
          stats =[];
        }]
      };
    };
  };

  public query(msg) func icrc72_get_broadcasters(params: {
      prev: ?Principal;
      take: ?Nat;
      filter: ?ICRC72OrchestratorService.OrchestrationFilter;
    }) : async [ICRC72OrchestratorService.BroadcasterInfo] {
    debug if(debug_channel.announce) D.print("CANISTER: Get Broadcasters: " # debug_show(params));
    [
      {
        broadcaster = Principal.fromActor(this);
        stats = [];
      }
    ]
  };

  public shared(msg) func broadcaster_ready() : async () {
    return;
  };
};