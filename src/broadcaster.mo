
import ICRC72OrchestratorService "../../icrc72-orchestrator.mo/src/service";

import TT "../../timerTool/src/";

import ICRC72Subscriber "../../icrc72-subscriber.mo/src/";
import ICRC72SubscriberService "../../icrc72-subscriber.mo/src/service";
import ICRC72Broadcaster "../../icrc72-broadcaster.mo/src/";
import ICRC72BroadcasterService "../../icrc72-broadcaster.mo/src/service";
import ICRC72Publisher "../../icrc72-publisher.mo/src/";
import ClassPlus "../../../../ICDevs/projects/ClassPlus/src/";


import D "mo:base/Debug";
import Principal "mo:base/Principal";
import Timer "mo:base/Timer";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Time "mo:base/Time";
import Buffer "mo:base/Buffer";


shared (deployer) actor class MVEvent<system>(args: ?{
  orchestrator : Principal;
  icrc72BroadcasterArgs : ?ICRC72Broadcaster.InitArgs;
  icrc72SubscriberArgs : ?ICRC72Subscriber.InitArgs;
  icrc72PublisherArgs : ?ICRC72Publisher.InitArgs;
  ttArgs : ?TT.Args;
})  = this {


  let debug_channel = {
    var timerTool = true;
    var icrc72Subscriber = true;
    var icrc72Broadcaster = true;
    var icrc72Publisher = true;
    var announce = true;
    var init = true;
  };

  let thisPrincipal = Principal.fromActor(this);
  let orchestratorPrincipal = switch(args){
    case(?args){
      args.orchestrator;
    };
    case(null) thisPrincipal;
  }; 

  type ReadyService = actor {
    broadcaster_ready: () -> async ()
  }; 

  let readyService : ReadyService = actor(Principal.toText(orchestratorPrincipal));

  //default args

  let icrc72PublisherDefaultArgs = null;
  let icrc72SubscriberDefaultArgs = null;
  let icrc72BroadcasterDefaultArgs = null;
  let ttDefaultArgs = null;

  stable var _owner = deployer.caller;

  let initManager = ClassPlus.ClassPlusInitializationManager(_owner, Principal.fromActor(this), true);

  let icrc72PublisherInitArgs : ?ICRC72Publisher.InitArgs = switch(args){
    case(null) icrc72PublisherDefaultArgs;
    case(?args){
      switch(args.icrc72PublisherArgs){
        case(null) icrc72PublisherDefaultArgs;
        case(?val) ?val;
      };
    };
  };

  let icrc72BroadcasterInitArgs : ?ICRC72Broadcaster.InitArgs = switch(args){
    case(null) icrc72BroadcasterDefaultArgs;
    case(?args){
      switch(args.icrc72BroadcasterArgs){
        case(null) icrc72BroadcasterDefaultArgs;
        case(?val) ?val;
      };
    };
  };

  let icrc72SubscriberInitArgs : ?ICRC72Subscriber.InitArgs = switch(args){
    case(null) icrc72SubscriberDefaultArgs;
    case(?args){
      switch(args.icrc72SubscriberArgs){
        case(null) icrc72SubscriberDefaultArgs;
        case(?val) ?val;
      };
    };
  };

  let ttInitArgs : TT.Args = switch(args){
    case(null) ttDefaultArgs;
    case(?args){
      switch(args.ttArgs){
        case(null) ttDefaultArgs;
        case(?val) val;
      };
    };
  };

  private func reportTTExecution(execInfo: TT.ExecutionReport): Bool{
    debug if(debug_channel.timerTool) D.print("CANISTER: TimerTool Execution: " # debug_show(execInfo));
    return false;
  };

  private func reportTTError(errInfo: TT.ErrorReport) : ?Nat{
    debug if(debug_channel.timerTool) D.print("CANISTER: TimerTool Error: " # debug_show(errInfo));
    return null;
  };

  stable var tt_migration_state: TT.State = TT.Migration.migration.initialState;

  let thisCanister = Principal.fromActor(this);

  let tt  = TT.Init<system>({
    manager = initManager;
    initialState = tt_migration_state;
    args = null;
    pullEnvironment = ?(func() : TT.Environment {
      {      
        advanced = null;
        reportExecution = ?reportTTExecution;
        reportError = ?reportTTError;
        syncUnsafe = null;
        reportBatch = null;
      };
    });

    onInitialize = ?(func (newClass: TT.TimerTool) : async* () {
      D.print("Initializing TimerTool");
      
      //do any work here necessary for initialization
    });
    onStorageChange = func(state: TT.State) {
      tt_migration_state := state;
    }
  });

  stable var icrc72SubscriberMigrationState : ICRC72Subscriber.State = ICRC72Subscriber.Migration.migration.initialState;

  let icrc72_subscriber = ICRC72Subscriber.Init<system>({
      manager = initManager;
      initialState = icrc72SubscriberMigrationState;
      args = icrc72SubscriberInitArgs;
      pullEnvironment = ?(func() : ICRC72Subscriber.Environment{
        {      
          advanced = null;
          var addRecord = null;
          var generateId = null;
          var icrc72OrchestratorCanister = orchestratorPrincipal;
          tt = tt();
          var handleEventOrder = null;
          var handleNotificationError = null;
          var handleNotificationPrice = null;
          var onSubscriptionReady = null;
        };
      });

      onInitialize = ?(func (newClass: ICRC72Subscriber.Subscriber) : async* () {
        D.print("Initializing Subscriber");
        //ignore Timer.setTimer<system>(#nanoseconds(0), newClass.initializeSubscriptions);
        //do any work here necessary for initialization
      });
      onStorageChange = func(state: ICRC72Subscriber.State) {
        icrc72SubscriberMigrationState := state;
      }
    });


  stable var icrc72PublisherMigrationState : ICRC72Publisher.State = ICRC72Publisher.Migration.migration.initialState;

  let icrc72_publisher = ICRC72Publisher.Init<system>(
    {
      manager = initManager;
      initialState = icrc72PublisherMigrationState;
      args = icrc72PublisherInitArgs;
      pullEnvironment = ?(func() : ICRC72Publisher.Environment{
        {      
          var addRecord = null;
          var generateId = null;
          icrc72Subscriber = icrc72_subscriber();
          var icrc72OrchestratorCanister = orchestratorPrincipal;
          var onEventPublishError = null;
          var onEventPublished = null;
          var onPublisherReady = null;
          var willPublsh = null;
          advanced = null;
          tt = tt();
        };
      });

      onInitialize = ?(func (newClass: ICRC72Publisher.Publisher) : async* () {
        D.print("Initializing Publisher");
        
        //do any work here necessary for initialization
      });
      onStorageChange = func(state: ICRC72Publisher.State) {
        icrc72PublisherMigrationState := state;
      }
    }); 

  //stable storage:
  stable var icrc72BroadcasterMigrationState : ICRC72Broadcaster.State = ICRC72Broadcaster.Migration.migration.initialState;

  let handledNotifications = Buffer.Buffer<(ICRC72Broadcaster.EventNotificationRecordShared, ICRC72Broadcaster.EventRecordShared)>(1);

  private func handleEventNotification<system>(state: ICRC72Broadcaster.CurrentState, env: ICRC72Broadcaster.Environment, notification: ICRC72Broadcaster.EventNotificationRecord, event: ICRC72Broadcaster.EventRecord) : Bool{
    handledNotifications.add((ICRC72Broadcaster.eventNotificationRecordToShared(notification), ICRC72Broadcaster.eventRecordToShared(event)));
    return true;
  };

  let icrc72_broadcaster = ICRC72Broadcaster.Init<system>({
      manager = initManager;
      initialState = icrc72BroadcasterMigrationState;
      args = icrc72BroadcasterInitArgs;
      pullEnvironment = ?(func() : ICRC72Broadcaster.Environment{
        {      
          var add_record = null;
          tt = tt();
          icrc72Subscriber = icrc72_subscriber();
          icrc72Publisher  = icrc72_publisher();
          var publicationSearch  = null;
          var subscriptionSearch = null;
          var subscriptionFilter = null;
          var publishReturnFunction = null;
          var handleConfirmation = ?handleEventNotification;
          var handleEventFinalized = null;
          var handleBroadcasterListening = null; //State, Environment, Namespace, Principal, Listening = True; Resigning = False
          var handleBroadcasterPublishing = null; //State, Environment, Namespace, Principal, Listening = True; Resigning = False
          var willPublish = null;
          var roundDelay = null;
          var maxMessages = null;
          var icrc72OrchestratorCanister = orchestratorPrincipal;
        };
      });

      onInitialize = ?(func (newClass: ICRC72Broadcaster.Broadcaster) : async* () {
        D.print("Initializing Broadcaster");

       
        //do any work here necessary for initialization
      });
      onStorageChange = func(state: ICRC72Broadcaster.State) {
        icrc72BroadcasterMigrationState := state;
      }
    });

  public shared func hello() : async Text {
    return "Hello, World!";
  };


  

  public query(msg) func getHandledNotifications() : async [(ICRC72Broadcaster.EventNotificationRecordShared, ICRC72Broadcaster.EventRecordShared)] {
    return Buffer.toArray(handledNotifications);
  };

  let recievedNotifications = Buffer.Buffer<(Principal, [ICRC72SubscriberService.EventNotification])>(1);

  public shared(msg) func icrc72_handle_notification(items : [ICRC72SubscriberService.EventNotification]) : () {
    debug if(debug_channel.announce) D.print("CANISTER: Received notification: " # debug_show(msg.caller, items));
    recievedNotifications.add((msg.caller, items));
    return await* icrc72_subscriber().icrc72_handle_notification(msg.caller, items);
  };

  public query(msg) func getRecievedNotifications() : async [(Principal, [ICRC72SubscriberService.EventNotification])] {
    return Buffer.toArray(recievedNotifications);
  };


  public query(msg) func get_subnet_for_canister() : async {
    #Ok : { subnet_id : ?Principal };
    #Err : Text;
  } {
    return #Ok({subnet_id = ?Principal.fromActor(this)});
  };

  let receivedConfirmations = Buffer.Buffer<(Principal, [Nat])>(1);

  public shared(msg) func icrc72_confirm_notifications(items : [Nat]) : async ICRC72BroadcasterService.ConfirmMessageResult {
    debug if(debug_channel.announce) D.print("CANISTER: Received confirm: " # debug_show(msg.caller, items));
    receivedConfirmations.add((msg.caller, items));
    return await* icrc72_broadcaster().icrc72_confirm_notifications(msg.caller, items);
  };

  public query(msg) func getRecievedConfirmations() : async [(Principal, [Nat])] {
    return Buffer.toArray(receivedConfirmations);
  };


  let receivedPublishes = Buffer.Buffer<(Principal, [ICRC72BroadcasterService.Event])>(1);

  public shared(msg) func icrc72_publish(messages : [ICRC72BroadcasterService.Event]) : async [?ICRC72BroadcasterService.PublishResult] {
    debug if(debug_channel.announce) D.print("CANISTER: Received publish: " # debug_show(msg.caller, messages));
    receivedPublishes.add((msg.caller, messages));
    return await* icrc72_broadcaster().icrc72_publish(msg.caller, messages);
  };

  public query(msg) func getReceivedPublishes() : async [(Principal, [ICRC72BroadcasterService.Event])] {
    return Buffer.toArray(receivedPublishes);
  };

  public query(msg) func get_stats() : async ICRC72Broadcaster.Stats {
    return icrc72_broadcaster().stats();
  };

  public shared func simulatePublisherAssignment(namespace: Text, id: Nat, principal: Principal) : async () {
    await* icrc72_subscriber().icrc72_handle_notification(
      icrc72_broadcaster().getEnvironment().icrc72OrchestratorCanister, [
        {
          notificationId = id;
          eventId = id;
          prevEventId = null;
          timestamp = Int.abs(Time.now());
          filter = null;
          headers = null;
          source = icrc72_broadcaster().getEnvironment().icrc72OrchestratorCanister;
          namespace = ICRC72Broadcaster.CONST.broadcasters.sys # Principal.toText(thisPrincipal);
          data = #Map([
            (ICRC72Broadcaster.CONST.broadcasters.publisher.add, #Array([
              #Array(
                [
                  #Text(namespace),
                  #Blob(Principal.toBlob(principal))
                ]
              )
            ]))
          ])
        }
      ]);
  };


  public shared func simulatePublisherRemoval(namespace: Text, id: Nat, principal: Principal) : async () {
    await* icrc72_subscriber().icrc72_handle_notification(
      icrc72_broadcaster().getEnvironment().icrc72OrchestratorCanister, [
        {
          notificationId = id;
          eventId = id;
          prevEventId = null;
          timestamp = Int.abs(Time.now());
          filter = null;
          headers = null;
          source = icrc72_broadcaster().getEnvironment().icrc72OrchestratorCanister;
          namespace = ICRC72Broadcaster.CONST.broadcasters.sys # Principal.toText(thisPrincipal);
          data = #Map([
            (ICRC72Broadcaster.CONST.broadcasters.publisher.remove, #Array([
              #Array(
                [
                  #Text(namespace),
                  #Blob(Principal.toBlob(principal))
                ]
              )
            ]))
          ])
        }
      ]);
  };

  public shared func simulateSubscriberAssignment(namespace: Text, id: Nat, principal: Principal) : async () {
    await* icrc72_subscriber().icrc72_handle_notification(
      icrc72_broadcaster().getEnvironment().icrc72OrchestratorCanister, [
        {
          notificationId = id;
          eventId = id;
          prevEventId = null;
          timestamp = Int.abs(Time.now());
          filter = null;
          headers = null;
          source = icrc72_broadcaster().getEnvironment().icrc72OrchestratorCanister;
          namespace = ICRC72Broadcaster.CONST.broadcasters.sys # Principal.toText(thisPrincipal);
          data = #Map([
            (ICRC72Broadcaster.CONST.broadcasters.subscriber.add, #Array([
              #Array(
                [
                  #Text(namespace),
                  #Blob(Principal.toBlob(principal))
                ]
              )
            ]))
          ])
        }
      ]);
  };


  public shared func simulateSubscriberRemoval(namespace: Text, id: Nat, principal: Principal) : async () {
    await* icrc72_subscriber().icrc72_handle_notification(
      icrc72_broadcaster().getEnvironment().icrc72OrchestratorCanister, [
        {
          notificationId = id;
          eventId = id;
          prevEventId = null;
          timestamp = Int.abs(Time.now());
          filter = null;
          headers = null;
          source = icrc72_broadcaster().getEnvironment().icrc72OrchestratorCanister;
          namespace = ICRC72Broadcaster.CONST.broadcasters.sys # Principal.toText(thisPrincipal);
          data = #Map([
            (ICRC72Broadcaster.CONST.broadcasters.subscriber.remove, #Array([
              #Array(
                [
                  #Text(namespace),
                  #Blob(Principal.toBlob(principal))
                ]
              )
            ]))
          ])
        }
      ]);
  };

  public shared func simulateRelayAssignment(namespace: Text, id: Nat, principal: Principal) : async () {
    await* icrc72_subscriber().icrc72_handle_notification(
      icrc72_broadcaster().getEnvironment().icrc72OrchestratorCanister, [
        {
          notificationId = id;
          eventId = id;
          prevEventId = null;
          timestamp = Int.abs(Time.now());
          filter = null;
          headers = null;
          source = icrc72_broadcaster().getEnvironment().icrc72OrchestratorCanister;
          namespace = ICRC72Broadcaster.CONST.broadcasters.sys # Principal.toText(thisPrincipal);
          data = #Map([
            (ICRC72Broadcaster.CONST.broadcasters.relay.add, #Array([
              #Array(
                [
                  #Text(namespace),
                  #Blob(Principal.toBlob(principal))
                ]
              )
            ]))
          ])
        }
      ]);
  };


  public shared func simulateRelayRemoval(namespace: Text, id: Nat, principal: Principal) : async () {
    await* icrc72_subscriber().icrc72_handle_notification(
      icrc72_broadcaster().getEnvironment().icrc72OrchestratorCanister, [
        {
          notificationId = id;
          eventId = id;
          prevEventId = null;
          timestamp = Int.abs(Time.now());
          filter = null;
          headers = null;
          source = icrc72_broadcaster().getEnvironment().icrc72OrchestratorCanister;
          namespace = ICRC72Broadcaster.CONST.broadcasters.sys # Principal.toText(thisPrincipal);
          data = #Map([
            (ICRC72Broadcaster.CONST.broadcasters.relay.remove, #Array([
              #Array(
                [
                  #Text(namespace),
                  #Blob(Principal.toBlob(principal))
                ]
              )
            ]))
          ])
        }
      ]);
  };

  public shared func simulatePublish(id: Nat, namespace: Text, data: Nat, sender: Principal) : async [?ICRC72BroadcasterService.PublishResult] {
    return await* icrc72_broadcaster().icrc72_publish(
      sender, [
        {
          eventId = id;
          prevEventId = null;
          timestamp = Int.abs(Time.now());
          filter = null;
          headers = null;
          source = icrc72_broadcaster().getEnvironment().icrc72OrchestratorCanister;
          namespace = namespace;
          data = #Map([("data", #Nat(data))])
        }
      ]);
  };

  //we will let the orchestrator know we are ready and then intialize where all the subscriptions and publications are created
  public shared func initialize() : async (){
    tt().initialize<system>();
    await readyService.broadcaster_ready();

    debug if(debug_channel.init) D.print("CANISTER: Initializing - broadcaster ready");

    await icrc72_broadcaster().initializeSubscriptions();
    return;
  };


};