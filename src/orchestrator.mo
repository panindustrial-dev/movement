import ICRC72Orchestrator "../../icrc72-orchestrator.mo/src/";
import ICRC72OrchestratorService "../../icrc72-orchestrator.mo/src/service";

import TT "../../timerTool/src/";

import ICRC72Subscriber "../../icrc72-subscriber.mo/src/";
import ICRC72SubscriberService "../../icrc72-subscriber.mo/src/service";
import ICRC72BroadcasterService "../../icrc72-broadcaster.mo/src/service";
import ICRC72Publisher "../../icrc72-publisher.mo/src/";
import ClassPlus "../../../../ICDevs/projects/ClassPlus/src/";


import D "mo:base/Debug";
import Principal "mo:base/Principal";
import Timer "mo:base/Timer";


shared (deployer) actor class MVEvent<system>(args: ?{
  icrc72OrchestratorArgs : ?ICRC72Orchestrator.InitArgs;
  icrc72SubscriberArgs : ?ICRC72Subscriber.InitArgs;
  icrc72PublisherArgs : ?ICRC72Publisher.InitArgs;
  
  ttArgs : ?TT.Args;
})  = this {



  let debug_channel = {
    var timerTool = true;
    var icrc72Subscriber = true;
    var icrc72Orchestrator = true;
    var icrc72Publisher = true;
    var announce = true;
    var init = true;
  };

  let thisPrincipal = Principal.fromActor(this);

  //default args

  let icrc72PublisherDefaultArgs = null;
  let icrc72SubscriberDefaultArgs = null;
  let icrc72OrchestratorDefaultArgs = null;
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

  let icrc72OrchestratorInitArgs : ?ICRC72Orchestrator.InitArgs = switch(args){
    case(null) icrc72OrchestratorDefaultArgs;
    case(?args){
      switch(args.icrc72OrchestratorArgs){
        case(null) icrc72OrchestratorDefaultArgs;
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
      newClass.initialize<system>();
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
          addRecord = null;
          generateId = null;
          icrc72OrchestratorCanister = thisPrincipal;
          tt = tt();
          handleEventOrder = null;
          handleNotificationError = null;
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


  stable var icrc72PublisherMigrationState : ICRC72Publisher.State = ICRC72Publisher.Migration.migration.initialState;

  let icrc72_publisher = ICRC72Publisher.Init<system>(
    {
      manager = initManager;
      initialState = icrc72PublisherMigrationState;
      args = icrc72PublisherInitArgs;
      pullEnvironment = ?(func() : ICRC72Publisher.Environment{
        {      
          addRecord = null;
          generateId = null;
          icrc72Subscriber = icrc72_subscriber();
          icrc72OrchestratorCanister = thisPrincipal;
          onEventPublishError = null;
          onEventPublished = null;
          tt = tt();
        };
      });

      onInitialize = ?(func (newClass: ICRC72Publisher.Publisher) : async* () {
        D.print("Initializing Publisher");
        ignore Timer.setTimer<system>(#nanoseconds(0), newClass.initializeSubscriptions);
        //do any work here necessary for initialization
      });
      onStorageChange = func(state: ICRC72Publisher.State) {
        icrc72PublisherMigrationState := state;
      }
    }); 

  //stable storage:
  stable var icrc72OrchestratorMigrationState : ICRC72Orchestrator.State = ICRC72Orchestrator.Migration.migration.initialState;

  let icrc72_orchestrator = ICRC72Orchestrator.Init<system>({
      manager = initManager;
      initialState = icrc72OrchestratorMigrationState;
      args = icrc72OrchestratorInitArgs;
      pullEnvironment = ?(func() : ICRC72Orchestrator.Environment{
        {      
          addRecord = null;
          generateId = null;
          icrc72Subscriber = icrc72_subscriber();
          icrc72Publisher = icrc72_publisher();
          tt = tt();
        };
      });

      onInitialize = ?(func (newClass: ICRC72Orchestrator.Orchestrator) : async* () {
        D.print("Initializing Orchestrator");
        //todo: find a way to distinguish between localy running DFX and deployed to the IC.
        newClass.governance :=  actor(Principal.toText(Principal.fromActor(this)));
        ignore await* newClass.fileBroadcaster(Principal.fromActor(this));
        //do any work here necessary for initialization
      });
      onStorageChange = func(state: ICRC72Orchestrator.State) {
        icrc72OrchestratorMigrationState := state;
      }
    });



  public shared func hello() : async Text {
    return "Hello, World!";
  };

  public shared(msg) func icrc72_handle_notification(items : [ICRC72SubscriberService.EventNotification]) : () {
    debug if(debug_channel.announce) D.print("CANISTER: Received notification: " # debug_show(items));
    return await* icrc72_subscriber().icrc72_handle_notification(msg.caller, items);
  };

  public shared(msg) func icrc72_register_publication(request : [ICRC72OrchestratorService.PublicationRegistration]) : async [ICRC72OrchestratorService.PublicationRegisterResult] {
    debug if(debug_channel.announce) D.print("CANISTER: Publication Registration: " # debug_show((request,msg.caller)));
    return await* icrc72_orchestrator().icrc72_register_publication(msg.caller, request);
  };

  public query(msg) func get_subnet_for_canister() : async {
    #Ok : { subnet_id : ?Principal };
    #Err : Text;
  } {
    return #Ok({subnet_id = ?Principal.fromActor(this)});
  };

  public shared(msg) func icrc72_update_publication(request : [ICRC72OrchestratorService.PublicationUpdateRequest]) : async [ICRC72OrchestratorService.PublicationUpdateResult] {
    debug if(debug_channel.announce) D.print("CANISTER: Publication Update: " # debug_show(request));
    return await* icrc72_orchestrator().icrc72_update_publication(msg.caller, request);
  };

  public shared(msg) func icrc72_register_subscription(request : [ICRC72OrchestratorService.SubscriptionRegistration]) : async [ICRC72OrchestratorService.SubscriptionRegisterResult] {
    debug if(debug_channel.announce) D.print("CANISTER: Subscription Registration: " # debug_show(request));
    return await* icrc72_orchestrator().icrc72_register_subscription(msg.caller, request);
  };

  public shared(msg) func icrc72_update_subscription(request : [ICRC72OrchestratorService.SubscriptionUpdateRequest]) : async [ICRC72OrchestratorService.SubscriptionUpdateResult] {
    debug if(debug_channel.announce) D.print("CANISTER: Subscription Update: " # debug_show(request));
    return await* icrc72_orchestrator().icrc72_update_subscription(msg.caller, request);
  };

  public shared(msg) func icrc72_get_valid_broadcaster() : async ICRC72OrchestratorService.ValidBroadcastersResponse {
    debug if(debug_channel.announce) D.print("CANISTER: Get Valid Broadcaster: " # debug_show(msg.caller));
    return await* icrc72_orchestrator().icrc72_get_valid_broadcaster(msg.caller);
  };

  public query(msg) func icrc72_get_publishers(params: {
      prev: ?Principal;
      take: ?Nat;
      filter: ?ICRC72OrchestratorService.OrchestrationFilter;
    }) : async [ICRC72OrchestratorService.PublisherInfo] {
    debug if(debug_channel.announce) D.print("CANISTER: Get Publishers: " # debug_show(params));
    return icrc72_orchestrator().icrc72_get_publishers(msg.caller, params);
  };

  public query(msg) func icrc72_get_publications(params: {
      prev: ?Text;
      take: ?Nat;
      filter: ?ICRC72OrchestratorService.OrchestrationFilter;
    }) : async [ICRC72OrchestratorService.PublicationInfo] {
    debug if(debug_channel.announce) D.print("CANISTER: Get Publication: " # debug_show(params));
    return icrc72_orchestrator().icrc72_get_publications(msg.caller, params);
  };

  public query(msg) func icrc72_get_subscribers(params: {
      prev: ?Principal;
      take: ?Nat;
      filter: ?ICRC72OrchestratorService.OrchestrationFilter;
    }) : async [ICRC72OrchestratorService.SubscriberInfo] {
    debug if(debug_channel.announce) D.print("CANISTER: Get subscribers: " # debug_show(params));
    return icrc72_orchestrator().icrc72_get_subscribers(msg.caller, params);
  };

  public query(msg) func icrc72_get_subscriptions(params: {
      prev: ?Text;
      take: ?Nat;
      filter: ?ICRC72OrchestratorService.OrchestrationFilter;
    }) : async [ICRC72OrchestratorService.SubscriptionInfo] {
    debug if(debug_channel.announce) D.print("CANISTER: Get Subscription: " # debug_show(params));
    return icrc72_orchestrator().icrc72_get_subscriptions(msg.caller, params);
  };

  public query(msg) func icrc72_get_broadcasters(params: {
      prev: ?Principal;
      take: ?Nat;
      filter: ?ICRC72OrchestratorService.OrchestrationFilter;
    }) : async [ICRC72OrchestratorService.BroadcasterInfo] {
    debug if(debug_channel.announce) D.print("CANISTER: Get Broadcasters: " # debug_show(params));
    return icrc72_orchestrator().icrc72_get_broadcasters(msg.caller, params);
  };

  public query func get_stats() : async ICRC72Orchestrator.Stats {
    return icrc72_orchestrator().stats();
  };


};