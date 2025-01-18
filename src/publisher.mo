
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
import Time "mo:base/Time";
import Int "mo:base/Int";
import Vector "mo:vector";


shared (deployer) actor class Publisher<system>(args: ?{
  orchestrator : Principal;
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

  debug if(debug_channel.announce) D.print("CANISTER: Initializing Publisher " # debug_show(args));

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
      args = null;
      pullEnvironment = ?(func() : ICRC72Subscriber.Environment{
        {      
          addRecord = null;
          generateId = null;
          icrc72OrchestratorCanister = orchestratorPrincipal;
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

  var publishErrors = Vector.new<(ICRC72Publisher.NewEvent, ICRC72BroadcasterService.PublishError)>();

  private func handlePublishError<system>(event: ICRC72Publisher.NewEvent, error: ICRC72BroadcasterService.PublishError) : Bool {
    debug if(debug_channel.icrc72Publisher) D.print("CANISTER: Error publishing event: " # debug_show(event) # " Error: " # debug_show(error));
    Vector.add(publishErrors, (event, error));
    return false;
  };

  var publishedEvents = Vector.new<((ICRC72Publisher.NewEvent, ?ICRC72BroadcasterService.PublishResult))>();

  private func handlePublished<system>(event: ICRC72Publisher.NewEvent, id: ?ICRC72BroadcasterService.PublishResult) : () {
    Vector.add(publishedEvents, (event, id));
    return;
  };

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
          icrc72OrchestratorCanister = orchestratorPrincipal;
          onEventPublishError = ?handlePublishError;
          onEventPublished = ?handlePublished;
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

  public shared func hello() : async Text {
    return "Hello, World!";
  };

  public shared(msg) func icrc72_handle_notification(items : [ICRC72SubscriberService.EventNotification]) : () {
    debug if(debug_channel.announce) D.print("CANISTER: Received notification: " # debug_show(items));
    return await* icrc72_subscriber().icrc72_handle_notification(msg.caller, items);
  };

  
  public query(msg) func get_subnet_for_canister() : async {
    #Ok : { subnet_id : ?Principal };
    #Err : Text;
  } {
    return #Ok({subnet_id = ?Principal.fromActor(this)});
  };

  public query(msg) func get_stats() : async ICRC72Publisher.Stats {
    return icrc72_publisher().stats();
  };

  public shared(msg) func registerSamplePublication(publications : [ICRC72Publisher.PublicationRegistration]) : async [ICRC72OrchestratorService.PublicationRegisterResult] {
     return await* icrc72_publisher().registerPublications(publications);
  };

  public shared(msg) func simulatePublish(request : [ICRC72Publisher.NewEvent]) : async [?Nat] {
    return icrc72_publisher().publish<system>(request);
  };

  public shared(msg) func simulatePublishAsync(request : [ICRC72Publisher.NewEvent]) : async [?Nat] {
    return await icrc72_publisher().publishAsync<system>(request);
  };

  public shared(msg) func simulateBroadcastAssignment(channel: Text, target: Principal){

    icrc72_publisher().fileBroadcaster(target, channel);

  };

  public shared(msg) func simulateBroadcastRemoval(channel: Text, target: Principal){

    icrc72_publisher().removeBroadcaster(target, channel);

  };

  public shared(msg) func simulateBroadcastAssignmentEvent(channel: Text, target: Principal){

    await* icrc72_subscriber().icrc72_handle_notification(icrc72_subscriber().environment.icrc72OrchestratorCanister, [{
      id = lastId;
      eventId = lastId;
      namespace = ICRC72Subscriber.CONST.publisher.sys # Principal.toText(thisPrincipal);
      data = #Map([(ICRC72Publisher.CONST.broadcasters.publisher.broadcasters.add, #Array([#Array([#Text(channel), #Blob(Principal.toBlob(target))])]))]);
      headers = null;
      filter = null;
      prevEventId = null;
      source = icrc72_subscriber().environment.icrc72OrchestratorCanister;
      timestamp = Int.abs(Time.now());
    }]);

    lastId += 1;

  };
  var lastId = 0;

  public shared(msg) func simulateBroadcastRemovalEvent(channel: Text, target: Principal){

    await* icrc72_subscriber().icrc72_handle_notification(icrc72_subscriber().environment.icrc72OrchestratorCanister, [{
      id = lastId;
      eventId = lastId;
      namespace = ICRC72Publisher.CONST.publisher.sys # Principal.toText(thisPrincipal);
      data = #Map([(ICRC72Publisher.CONST.broadcasters.publisher.broadcasters.remove, #Array([#Array([#Text(channel), #Blob(Principal.toBlob(target))])]))]);
      headers = null;
      filter = null;
      prevEventId = null;
      source = icrc72_subscriber().environment.icrc72OrchestratorCanister;
      timestamp = Int.abs(Time.now());
    }]);
    lastId += 1;

  };


  let unhandledEvents = Vector.new<ICRC72Publisher.NewEvent>();

  private func handleUnhandledEvent(event: ICRC72Publisher.NewEvent) : () {
    Vector.add(unhandledEvents, event);
    return;
  };

  public query(msg) func getUnhandledEvents() : async [ICRC72Publisher.NewEvent] {
    return Vector.toArray(unhandledEvents);
  };

  public shared(msg) func simulatePublishWithHandler(request : [ICRC72Publisher.NewEvent]) : async [?Nat] {
    return icrc72_publisher().publishWithHandler<system>(request, handleUnhandledEvent);
  };

  

  public query(msg) func getPublishErrors() : async [(ICRC72Publisher.NewEvent, ICRC72BroadcasterService.PublishError)] {
    return Vector.toArray(publishErrors);
  };

  

  public query(msg) func getPublishedEvents() : async [(ICRC72Publisher.NewEvent, ?ICRC72BroadcasterService.PublishResult)] {
    return Vector.toArray(publishedEvents);
  };

  public shared(msg) func simulateDeletePublication(publication : Text) : async ICRC72OrchestratorService.PublicationDeleteResult {
    debug if(debug_channel.announce) D.print("CANISTER: Deleting publication: " # debug_show(publication));
    return await* icrc72_publisher().deletePublication(#namespace( publication));
  };

  public shared(msg) func simulateUpdatePublication(updates: [ICRC72OrchestratorService.PublicationUpdateRequest]) : async [ICRC72OrchestratorService.PublicationUpdateResult] {
    debug if(debug_channel.announce) D.print("CANISTER: Deleting publication: " # debug_show(updates));
    return await* icrc72_publisher().updatePublication(updates);
  };


  public shared(msg) func simulatePublicationCreation() : async [ICRC72OrchestratorService.PublicationRegisterResult] {
    let service : ICRC72OrchestratorService.Service = actor(Principal.toText(orchestratorPrincipal));
    return await service.icrc72_register_publication([{
      namespace = "com.test.counter";
      config = [
        (ICRC72OrchestratorService.CONST.publication.publishers.allowed.list, #Array([#Blob(Principal.toBlob(thisPrincipal))])),
        (ICRC72OrchestratorService.CONST.publication.controllers.list, #Array([#Blob(Principal.toBlob(thisPrincipal))]))
      ];
      memo = null;
    }]);
  };

  


};