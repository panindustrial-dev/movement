import ICRC72OrchestratorService "../../icrc72-orchestrator.mo/src/service";

import TT "../../timerTool/src/";

import ICRC72Subscriber "../../icrc72-subscriber.mo/src/";
import ICRC72SubscriberService "../../icrc72-subscriber.mo/src/service";
import ICRC72BroadcasterService "../../icrc72-broadcaster.mo/src/service";
import ICRC72Publisher "../../icrc72-publisher.mo/src/";
import ClassPlus "../../../../ICDevs/projects/ClassPlus/src/";


import Blob "mo:base/Blob";
import D "mo:base/Debug";
import Principal "mo:base/Principal";
import Timer "mo:base/Timer";
import Text "mo:base/Text";
import Error "mo:base/Error";
import Vector "mo:vector";


shared (deployer) actor class Subscriber<system>(args: ?{
  orchestrator : Principal;
  icrc72SubscriberArgs : ?ICRC72Subscriber.InitArgs;
  ttArgs : ?TT.Args;
})  = this {

  let debug_channel = {
    var timerTool = true;
    var icrc72Subscriber = true;
    var announce = true;
    var init = true;
  };

  debug if(debug_channel.init) D.print("CANISTER: Initializing Subscriber");

  let thisPrincipal = Principal.fromActor(this);

  //default args
  let BTree = ICRC72Subscriber.BTree;

  let icrc72SubscriberDefaultArgs = null;
  let ttDefaultArgs = null;

  stable var _owner = deployer.caller;

  let initManager = ClassPlus.ClassPlusInitializationManager(_owner, Principal.fromActor(this), true);

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

  let orchestratorPrincipal = switch(args){
    case(?args) args.orchestrator;
    case(null) Principal.fromActor(this);
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
    args = ttInitArgs;
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
      newClass.initialize<system>();
      //do any work here necessary for initialization
    });
    onStorageChange = func(state: TT.State) {
      tt_migration_state := state;
    }
  });

  stable var icrc72SubscriberMigrationState : ICRC72Subscriber.State = ICRC72Subscriber.Migration.migration.initialState;

  var errors : Vector.Vector<Text> = Vector.new<Text>();
  var bFoundOutOfOrder : Bool = false;

  func handleEventOrder<system>(state: ICRC72Subscriber.CurrentState, environment: ICRC72Subscriber.Environment, id: Nat, eventNotification: ICRC72Subscriber.EventNotification) : Bool {
    switch(eventNotification.headers){
      case(?header) {
        debug if(debug_channel.announce) D.print("CANISTER: Received notification and has value checking alue: " # debug_show(header));
        for(thisItem in header.vals()){
          if(thisItem.0 =="forceOutOfOrder" and bFoundOutOfOrder == false){
            bFoundOutOfOrder := true;
            
            debug if(debug_channel.announce) D.print("CANISTER: found out of order ");
            return false
          };
        };
      };
      case(null) { };
    };
    return true;
  };

  let records = Vector.new<([(Text, ICRC72Subscriber.Value)], [(Text, ICRC72Subscriber.Value)])>();

  func addRecord(trx : [(Text, ICRC72Subscriber.Value)], trxTop: ?[(Text, ICRC72Subscriber.Value)]) : Nat{
    Vector.add(records, (trx, switch(trxTop){
      case(?val) val;
      case(null) [];
    }));
    return Vector.size(records);
  };

  public query(msg) func getRecords() : async [([(Text, ICRC72Subscriber.Value)], [(Text, ICRC72Subscriber.Value)])] {
    return Vector.toArray(records);
  };

  let icrc72_subscriber = ICRC72Subscriber.Init<system>({
      manager = initManager;
      initialState = icrc72SubscriberMigrationState;
      args = icrc72SubscriberInitArgs;
      pullEnvironment = ?(func() : ICRC72Subscriber.Environment{
        {      
          var addRecord = ?addRecord;
          var icrc72OrchestratorCanister = orchestratorPrincipal;
          tt = tt();
          var handleEventOrder = ?handleEventOrder;
          var handleNotificationPrice = ?(func<system>(state: ICRC72Subscriber.CurrentState, environment: ICRC72Subscriber.Environment, eventNotification: ICRC72Subscriber.EventNotification) : Nat {
            return 0;
          }); 
          var handleNotificationError = ?(func<system>(event: ICRC72Subscriber.EventNotification, error: Error) : () {
            D.print("Error in Notification: " # debug_show(event) # " " # Error.message(error));

            Vector.add(errors, Error.message(error));
            return;
          });
        };
      });

      onInitialize = ?(func (newClass: ICRC72Subscriber.Subscriber) : async* () {
        D.print("Initializing Subscriber");
        ignore Timer.setTimer<system>(#nanoseconds(0), newClass.initializeSubscriptions);
        //do any work here necessary for initialization
      });
      onStorageChange = func(state: ICRC72Subscriber.State) {
        icrc72SubscriberMigrationState := state;
      }
    });

  public shared func hello() : async Text {
    return "Hello, World!";
  };

  public query(msg) func getErrors() : async [Text] {
    return Vector.toArray(errors);
  };

  public shared(msg) func icrc72_handle_notification(items : [ICRC72SubscriberService.EventNotification]) : () {
    debug if(debug_channel.announce) D.print("CANISTER: Received notification: " # debug_show(items));
    return await* icrc72_subscriber().icrc72_handle_notification(msg.caller, items);
  };

  public shared(msg) func simulate_notification(caller: ?Principal, items : [ICRC72SubscriberService.EventNotification]) : () {
    debug if(debug_channel.announce) D.print("CANISTER: Received notification: " # debug_show(items, caller));
    return await* icrc72_subscriber().icrc72_handle_notification(switch(caller){
      case(?val) val;
      case(null) {
        switch(icrc72_subscriber().getState().validBroadcasters){
          case(#list(val)) switch(ICRC72Subscriber.Set.peek(val)){
            case(?val) val;
            case(null) {
              throw Error.reject("No valid broadcasters");
            };
          };
          case(#icrc75(val)) val.principal;
        }
      };
    }, items);
  };

  public query(msg) func get_stats() : async ICRC72Subscriber.Stats {
    return icrc72_subscriber().stats();
  };

  public query(msg) func get_subnet_for_canister() : async {
    #Ok : { subnet_id : ?Principal };
    #Err : Text;
  } {
    return #Ok({subnet_id = ?Principal.fromActor(this)});
  };

  public shared(msg) func updateSubscription(request: [ICRC72OrchestratorService.SubscriptionUpdateRequest]) : async [ICRC72OrchestratorService.SubscriptionUpdateResult] {
    return await* icrc72_subscriber().updateSubscription( request);
  };

  //simulation end points
  public shared(msg) func checkRegisteredExecutionListener() : async Bool {
    let ?listener = BTree.get(icrc72_subscriber().getState().subscriptionsByNamespace, Text.compare, "syncListenerNamespace") else return false;

    return true;
  };

  var _registerExecutionListenerCalled : Nat = 0;

  var _registerExecutionListenerCalledAsync : Nat = 0;

  public shared(msg) func registerExecutionListenerSyncCalled() : async Nat {
    return _registerExecutionListenerCalled;
  };

  public shared(msg) func registerExecutionListenerASyncCalled() : async Nat {
    return _registerExecutionListenerCalledAsync;
  };


  func syncListenerNamespaceHandler<system>(event: ICRC72Subscriber.EventNotification) : (){
    debug if(debug_channel.announce) D.print("CANISTER: Received notification: " # debug_show(event));
    switch(event.headers){
      case(?header) {
        for(thisItem in header.vals()){
          if(thisItem.0 =="forceError"){
            D.trap("Forced Error");
            //throw Error.reject("Forced Error");
          };
        };
      };
      case(null) { };
    };
    _registerExecutionListenerCalled += 1;
  };

  func syncListenerNamespaceHandlerAsync<system>(event: ICRC72Subscriber.EventNotification) : async* (){
    debug if(debug_channel.announce) D.print("CANISTER: Received notification: " # debug_show(event));
    switch(event.headers){
      case(?header) {
        debug if(debug_channel.announce) D.print("CANISTER: Received notification and has value: " # debug_show(header));
        for(thisItem in header.vals()){
          if(thisItem.0 =="forceError"){
            debug if(debug_channel.announce) D.print("CANISTER: found force error trapping: ");
            throw Error.reject("Forced Error");
          };
        };
      };
      case(null) { };
    };
    _registerExecutionListenerCalledAsync += 1;
  };

  var counter : Nat = 0;

  func processCounterEvent<system>(event: ICRC72Subscriber.EventNotification) : (){
    debug if(debug_channel.announce) D.print("CANISTER: Received notification: " # debug_show((thisCanister, event)));
    let #Class(val) = event.data else {
      debug if(debug_channel.announce) D.print("CANISTER: Received notification: " # debug_show((thisCanister, event)));
      return;
    };
    let #Nat(count) = val[0].value else {
      debug if(debug_channel.announce) D.print("CANISTER: Received notification: " # debug_show((thisCanister, event)));
      return;
    };
    counter += count;
  };

  func processCounterEventAsync<system>(event: ICRC72Subscriber.EventNotification) : async* (){
    debug if(debug_channel.announce) D.print("CANISTER: Received notification: " # debug_show((thisCanister, event)));
    let #Class(val) = event.data else {
      debug if(debug_channel.announce) D.print("CANISTER: Received notification: " # debug_show((thisCanister, event)));
      return;
    };
    let #Nat(count) = val[0].value else {
      debug if(debug_channel.announce) D.print("CANISTER: Received notification: " # debug_show((thisCanister, event)));
      return;
    };
    counter += count;
  };

  public query(msg) func getCounter() : async Nat {
    return counter;
  };

  public shared(msg) func registerExecutionListenerSync(config : ?ICRC72Subscriber.ICRC16Map) : async [ICRC72OrchestratorService.SubscriptionRegisterResult] {
     return await* icrc72_subscriber().subscribe([{
      namespace = "syncListenerNamespace";
      config = switch(config){
        case(?val) val;
        case(null) [];
      };
      memo = null;
      listener = #Sync(syncListenerNamespaceHandler);
    }]);
  };

  public shared(msg) func registerExecutionListenerASync(config : ?ICRC72Subscriber.ICRC16Map) : async [ICRC72OrchestratorService.SubscriptionRegisterResult] {
     return await* icrc72_subscriber().subscribe([{
      namespace = "syncListenerNamespaceAsync";
      config = switch(config){
        case(?val) val;
        case(null) [];
      };
      memo = null;
      listener = #Async(syncListenerNamespaceHandlerAsync);
    }]);
  };

  public shared(msg) func simulateSubscriptionCreation(sync: Bool, namespace: Text, config : ?ICRC72Subscriber.ICRC16Map) : async [ICRC72OrchestratorService.SubscriptionRegisterResult] {

    debug if(debug_channel.announce) D.print("CANISTER: simulateSubscriptionCreation: " # debug_show(sync, namespace, config));
    if(sync){
      return await* icrc72_subscriber().subscribe([{
        namespace = namespace;
        config = switch(config){
          case(?val) val;
          case(null) [];
        };
        memo = null;
        listener = #Sync(processCounterEvent);
      }]);
    } else {
      return await* icrc72_subscriber().subscribe([{
        namespace = namespace;
        config = switch(config){
          case(?val) val;
          case(null) [];
        };
        memo = null;
        listener = #Async(processCounterEventAsync);
      }]);
    }
  };


};