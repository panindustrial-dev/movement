import ICRC72Orchestrator "../../icrc72-orchestrator.mo/src/";
import ICRC72OrchestratorService "../../icrc72-orchestrator.mo/src/service";
import ICRC72Publisher "../../icrc72-publisher.mo/src/";
import TT "../../timerTool/src/";

import ICRC72Subscriber "../../icrc72-subscriber.mo/src/";
import ICRC72SubscriberService "../../icrc72-subscriber.mo/src/service";
import ICRC72Broadcaster "../../icrc72-broadcaster.mo/src/";
import ICRC72BroadcasterService "../../icrc72-broadcaster.mo/src/service";


import D "mo:base/Debug";
import Principal "mo:base/Principal";
import Timer "mo:base/Timer";


shared (deployer) actor class MVEvent<system>(args: ?{
  icrc72PublisherArgs : ?ICRC72Publisher.InitArgs;
  icrc72SubscriberArgs : ?ICRC72Subscriber.InitArgs;
  icrc72BroadcasterArgs : ?ICRC72Broadcaster.InitArgs;
  icrc72OrchestratorArgs : ?ICRC72Orchestrator.InitArgs;
  ttArgs : ?TT.Args;
})  = this {

  let debug_channel = {
    timerTool = true;
    icrc72Subscriber = true;
    icrc72Publisher = true;
    icrc72Orchestrator = true;
    icrc72Broadcaster = true;
    announce = true;
    init = true;
  };

  //default args
  let icrc72PublisherDefaultArgs = null;
  let icrc72OrchestratorDefaultArgs = null;
  let icrc72SubscriberDefaultArgs = null;
  let icrc72BroadcasterDefaultArgs = null;
  let ttDefaultArgs = null;

  stable var _owner = deployer.caller;

  //get args
  let icrc72PublisherInitArgs : ?ICRC72Publisher.InitArgs = switch(args){
    case(null) icrc72PublisherDefaultArgs;
    case(?args){
      switch(args.icrc72PublisherArgs){
        case(null) icrc72PublisherDefaultArgs;
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

  let icrc72OrchestratorInitArgs : ?ICRC72Orchestrator.InitArgs = switch(args){
    case(null) icrc72OrchestratorDefaultArgs;
    case(?args){
      switch(args.icrc72OrchestratorArgs){
        case(null) icrc72OrchestratorDefaultArgs;
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

  let ttInitArgs : TT.Args = switch(args){
    case(null) ttDefaultArgs;
    case(?args){
      switch(args.ttArgs){
        case(null) ttDefaultArgs;
        case(?val) val;
      };
    };
  };


  //stable storage:
  stable let icrc72SubscriberMigrationState = ICRC72Subscriber.init(ICRC72Subscriber.initialState(), #v0_1_0(#id),icrc72SubscriberInitArgs, _owner);
  stable let icrc72PublisherMigrationState = ICRC72Publisher.init(ICRC72Publisher.initialState(), #v0_1_0(#id),icrc72PublisherInitArgs, _owner);
  stable let icrc72OrchestratorMigrationState = ICRC72Orchestrator.init(ICRC72Orchestrator.initialState(), #v0_1_0(#id),icrc72OrchestratorInitArgs, _owner);
  stable let icrc72BroadcasterMigrationState = ICRC72Broadcaster.init(ICRC72Broadcaster.initialState(), #v0_1_0(#id),icrc72BroadcasterInitArgs, _owner);

  stable let timerState = TT.init(TT.initialState(),#v0_1_0(#id), ttInitArgs, deployer.caller);

  let #v0_1_0(#data(icrc72SubscriberCurrentState)) = icrc72SubscriberMigrationState;
  let #v0_1_0(#data(icrc72PublisherCurrentState)) = icrc72PublisherMigrationState;
  let #v0_1_0(#data(icrc72OrchestratorCurrentState)) = icrc72OrchestratorMigrationState;
  let #v0_1_0(#data(icrc72BroadcasterCurrentState)) = icrc72BroadcasterMigrationState;


  private var _icrc72Subscriber : ?ICRC72Subscriber.Subscriber = null;
  private var _icrc72Publisher : ?ICRC72Publisher.Publisher = null;
  private var _icrc72Orchestrator : ?ICRC72Orchestrator.Orchestrator = null;
  private var _icrc72Broadcaster : ?ICRC72Broadcaster.Broadcaster = null;

  var _timerTool : ?TT.TimerTool = null;

  private func tt<system>() : TT.TimerTool{
    switch(_timerTool){
      case(null){
        let x = TT.TimerTool(?timerState, getCanister(), getTTEnvironment());
        x.initialize<system>();
        _timerTool := ?x;
        x;
      };
      case(?val) val;
    };
  };

  private func getTTEnvironment() : TT.Environment{
    {      
      advanced = null;
      reportExecution = ?reportTTExecution;
      reportError = ?reporTTError;
      syncUnsafe = null;
      reportBatch = null;
    };
  };

  private func getICRC72OrchestratorEnv<system>() : ICRC72Orchestrator.Environment {
    debug if(debug_channel.announce) D.print("CANISTER: Getting ICRC72Orchestrator Environment");
    {
      addRecord = null;
      tt = tt<system>();
      icrc72Publisher = icrc72Publisher<system>();
    };
  };
    
  private func getICRC72SubscriberEnv<system>() : ICRC72Subscriber.Environment {
    debug if(debug_channel.announce) D.print("CANISTER: Getting ICRC72Subscriber Environment");
    {
      addRecord = null;
      generateId = null;
      icrc72OrchestratorCanister = getCanister();
      tt = tt();
      handleEventOrder = null;
      handleNotificationError = null;
    };
  };

  private func getICRC72PublisherEnv<system>() : ICRC72Publisher.Environment {
    debug if(debug_channel.announce) D.print("CANISTER: Getting ICRC72Publisher Environment");
    {
      addRecord = null;
      generateId = null;
      icrc72Subscriber = icrc72Subscriber<system>();
      icrc72OrchestratorCanister = getCanister();
      tt = tt<system>();
    };
  };

  private func getICRC72BroadcasterEnv<system>() : ICRC72Broadcaster.Environment {
    debug if(debug_channel.announce) D.print("CANISTER: Getting ICRC72Broadcaster Environment");
    {
      add_record = null;
      tt = tt<system>();
      icrc72Subscriber = icrc72Subscriber<system>();
      icrc72Publisher  = icrc72Publisher<system>();
      publicationSearch  = null;
      subscriptionSearch = null;
      subscriptionFilter = null;
      publishReturnFunction = null;
      handleConfirmation = null;
      handleEventFinalized = null;
      handleBroadcasterListening = null; //State, Environment, Namespace, Principal, Listening = True; Resigning = False
      handleBroadcasterPublishing = null; //State, Environment, Namespace, Principal, Listening = True; Resigning = False
      roundDelay = null;
      maxMessages = null;
      icrc72OrchestratorCanister = getCanister();
    };
  };

  func icrc72Subscriber<system>() : ICRC72Subscriber.Subscriber {
    switch(_icrc72Subscriber){
      case(null){
        debug if(debug_channel.announce) D.print("CANISTER: Initing Subscriber");
        let initclass : ICRC72Subscriber.Subscriber = ICRC72Subscriber.Subscriber(?icrc72SubscriberMigrationState, Principal.fromActor(this), getICRC72SubscriberEnv<system>());
        _icrc72Subscriber := ?initclass;
        ignore Timer.setTimer<system>(#nanoseconds(0), initclass.initSubscriber);
        initclass;
      };
      case(?val) val;
    };
  };

  func icrc72Broadcaster<system>() : ICRC72Broadcaster.Broadcaster {
    switch(_icrc72Broadcaster){
      case(null){
        debug if(debug_channel.announce) D.print("CANISTER: Initing Broadcaster");
        let initclass : ICRC72Broadcaster.Broadcaster = ICRC72Broadcaster.Broadcaster(?icrc72BroadcasterMigrationState, Principal.fromActor(this), getICRC72BroadcasterEnv<system>());
        _icrc72Broadcaster := ?initclass;
        ignore Timer.setTimer<system>(#nanoseconds(0), initclass.initBroadcaster);
        initclass;
      };
      case(?val) val;
    };
  };

  func icrc72Publisher<system>() : ICRC72Publisher.Publisher {
    switch(_icrc72Publisher){
      case(null){
        debug if(debug_channel.announce) D.print("CANISTER: Initing Publisher");
        let initclass : ICRC72Publisher.Publisher = ICRC72Publisher.Publisher(?icrc72PublisherMigrationState, Principal.fromActor(this), getICRC72PublisherEnv<system>());
        _icrc72Publisher := ?initclass;
        ignore Timer.setTimer<system>(#nanoseconds(0), initclass.initPublisher);
        initclass;
      };
      case(?val) val;
    };
  };

  

  func icrc72Orchestrator<system>() : ICRC72Orchestrator.Orchestrator {
    switch(_icrc72Orchestrator){
      case(null){

        debug if(debug_channel.announce) D.print("CANISTER: Initing Orchestrator");
        let initclass : ICRC72Orchestrator.Orchestrator = ICRC72Orchestrator.Orchestrator(?icrc72OrchestratorMigrationState, Principal.fromActor(this), getICRC72OrchestratorEnv<system>());
        _icrc72Orchestrator := ?initclass;

        //todo: find a way to distinguish between local
        initclass.governance :=  actor(Principal.toText(Principal.fromActor(this)));
        initclass;
      };
      case(?val) val;
    };
  };

  func q_icrc72Orchestrator() : ICRC72Orchestrator.Orchestrator {
   let ?found = _icrc72Orchestrator else D.trap("Orchestrator not initialized");
   found;
  };

  func q_icrc720Subscriber() : ICRC72Subscriber.Subscriber {
   let ?found = _icrc72Subscriber else D.trap("Subscriber not initialized");
   found;
  };

  func q_icrc720Publisher() : ICRC72Publisher.Publisher {
   let ?found = _icrc72Publisher else D.trap("Publisher not initialized");
   found;
  };

  func q_icrc72Broadcaster() : ICRC72Broadcaster.Broadcaster {
   let ?found = _icrc72Broadcaster else D.trap("Broadcaster not initialized");
   found;
  };

  var canisterId_ : ?Principal = null;

  private func getCanister() : Principal {
    switch(canisterId_){
      case(null){
        let x = Principal.fromActor(this);
        canisterId_ := ?x;
        x;
      };
      case(?val) val;
    };
  };

  private func reportTTExecution(execInfo: TT.ExecutionReport): Bool{
    debug if(debug_channel.timerTool) D.print("CANISTER: TimerTool Execution: " # debug_show(execInfo));
    return false;
  };

  private func reporTTError(errInfo: TT.ErrorReport) : ?Nat{
    debug if(debug_channel.timerTool) D.print("CANISTER: TimerTool Error: " # debug_show(errInfo));
    return null;
  };

  public shared func hello() : async Text {
    return "Hello, World!";
  };

  public shared(msg) func icrc72_handle_notification(items : [ICRC72SubscriberService.EventNotification]) : () {
    debug if(debug_channel.announce) D.print("CANISTER: Received notification: " # debug_show(items));
    return await* icrc72Subscriber<system>().icrc72_handle_notification(msg.caller, items);
  };

  public shared(msg) func icrc72_confirm_notifications(items : [Nat]) : async ICRC72BroadcasterService.ConfirmMessageResult {
    debug if(debug_channel.announce) D.print("CANISTER: Received confirm: " # debug_show(items));
    return await* icrc72Broadcaster<system>().icrc72_confirm_notifications(msg.caller, items);
  };

  public shared(msg) func icrc72_publish(messages : [ICRC72BroadcasterService.Event]) : async [?ICRC72BroadcasterService.PublishResult] {
    debug if(debug_channel.announce) D.print("CANISTER: Received publish: " # debug_show(messages));
    return await* icrc72Broadcaster<system>().icrc72_publish(msg.caller, messages);
  };

  public shared(msg) func icrc72_register_publication(request : [ICRC72OrchestratorService.PublicationRegistration]) : async [ICRC72OrchestratorService.PublicationRegisterResult] {
    debug if(debug_channel.announce) D.print("CANISTER: Publication Registration: " # debug_show(request));
    return await* icrc72Orchestrator<system>().icrc72_register_publication(msg.caller, request);
  };

  public query(msg) func get_subnet_for_canister() : async {
    #Ok : { subnet_id : ?Principal };
    #Err : Text;
  } {
    return #Ok({subnet_id = ?Principal.fromActor(this)});
  };

  public shared(msg) func icrc72_update_publication(request : [ICRC72OrchestratorService.PublicationUpdateRequest]) : async [ICRC72OrchestratorService.PublicationUpdateResult] {
    debug if(debug_channel.announce) D.print("CANISTER: Publication Update: " # debug_show(request));
    return await* icrc72Orchestrator<system>().icrc72_update_publication(msg.caller, request);
  };

  public shared(msg) func icrc72_register_subscription(request : [ICRC72OrchestratorService.SubscriptionRegistration]) : async [ICRC72OrchestratorService.SubscriptionRegisterResult] {
    debug if(debug_channel.announce) D.print("CANISTER: Subscription Registration: " # debug_show(request));
    return await* icrc72Orchestrator<system>().icrc72_register_subscription(msg.caller, request);
  };

  public shared(msg) func icrc72_update_subscription(request : [ICRC72OrchestratorService.SubscriptionUpdateRequest]) : async [ICRC72OrchestratorService.SubscriptionUpdateResult] {
    debug if(debug_channel.announce) D.print("CANISTER: Subscription Update: " # debug_show(request));
    return await* icrc72Orchestrator<system>().icrc72_update_subscription(msg.caller, request);
  };

  public shared(msg) func icrc72_get_valid_broadcaster() : async ICRC72OrchestratorService.ValidBroadcastersResponse {
    debug if(debug_channel.announce) D.print("CANISTER: Get Valid Broadcaster: " # debug_show(msg.caller));
    return await* icrc72Orchestrator<system>().icrc72_get_valid_broadcaster(msg.caller);
  };

  public query(msg) func icrc72_get_publishers(params: {
      prev: ?Principal;
      take: ?Nat;
      filter: ?ICRC72OrchestratorService.OrchestrationFilter;
    }) : async [ICRC72OrchestratorService.PublisherInfo] {
    debug if(debug_channel.announce) D.print("CANISTER: Get Publishers: " # debug_show(params));
    return q_icrc72Orchestrator().icrc72_get_publishers(msg.caller, params);
  };

  public query(msg) func icrc72_get_publications(params: {
      prev: ?Text;
      take: ?Nat;
      filter: ?ICRC72OrchestratorService.OrchestrationFilter;
    }) : async [ICRC72OrchestratorService.PublicationInfo] {
    debug if(debug_channel.announce) D.print("CANISTER: Get Publication: " # debug_show(params));
    return q_icrc72Orchestrator().icrc72_get_publications(msg.caller, params);
  };

  public query(msg) func icrc72_get_subscribers(params: {
      prev: ?Principal;
      take: ?Nat;
      filter: ?ICRC72OrchestratorService.OrchestrationFilter;
    }) : async [ICRC72OrchestratorService.SubscriberInfo] {
    debug if(debug_channel.announce) D.print("CANISTER: Get subscribers: " # debug_show(params));
    return q_icrc72Orchestrator().icrc72_get_subscribers(msg.caller, params);
  };

  public query(msg) func icrc72_get_subscriptions(params: {
      prev: ?Text;
      take: ?Nat;
      filter: ?ICRC72OrchestratorService.OrchestrationFilter;
    }) : async [ICRC72OrchestratorService.SubscriptionInfo] {
    debug if(debug_channel.announce) D.print("CANISTER: Get Subscription: " # debug_show(params));
    return q_icrc72Orchestrator().icrc72_get_subscriptions(msg.caller, params);
  };

  public query(msg) func icrc72_get_broadcasters(params: {
      prev: ?Principal;
      take: ?Nat;
      filter: ?ICRC72OrchestratorService.OrchestrationFilter;
    }) : async [ICRC72OrchestratorService.BroadcasterInfo] {
    debug if(debug_channel.announce) D.print("CANISTER: Get Broadcasters: " # debug_show(params));
    return q_icrc72Orchestrator().icrc72_get_broadcasters(msg.caller, params);
  };

  public shared(msg) func init() : async() {
    if(Principal.fromActor(this) != msg.caller){
      D.trap("Only the canister can initialize the canister");
    };
    debug if(debug_channel.init) D.print("CANISTER: ---------Initializing Canister---------");
    debug if(debug_channel.init) D.print("CANISTER: ---------Initializing tt---------");
    ignore tt<system>();
    debug if(debug_channel.init) D.print("CANISTER: ---------Initializing Orchestrator---------");
    ignore icrc72Orchestrator<system>();
    debug if(debug_channel.init) D.print("CANISTER: ---------Filing Broadcaster---------");
    ignore await* icrc72Orchestrator<system>().fileBroadcaster(Principal.fromActor(this));

    debug if(debug_channel.init) D.print("CANISTER: ---------Initializing Broadcaster---------");
    ignore icrc72Broadcaster<system>();
    debug if(debug_channel.init) D.print("CANISTER: ---------Initializing Publisher---------");
    ignore icrc72Publisher<system>();
    debug if(debug_channel.init) D.print("CANISTER: ---------Initializing Subscriber---------");
    ignore icrc72Subscriber<system>();
  };

  Timer.setTimer<system>(#nanoseconds(0), func () : async() {
    let selfActor : actor {
      init : shared () -> async ();
    } = actor(Principal.toText(Principal.fromActor(this)));
    await selfActor.init();
  });

};