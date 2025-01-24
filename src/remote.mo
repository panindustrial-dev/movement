import ICRC72OrchestratorService "../../icrc72-orchestrator.mo/src/service";
import ICRC72Publisher "../../icrc72-publisher.mo/src/";
import TT "../../timerTool/src/";
import ICRC72Subscriber "../../icrc72-subscriber.mo/src/";
import ICRC72SubscriberService "../../icrc72-subscriber.mo/src/service";
import ICRC72BroadcasterService "../../icrc72-broadcaster.mo/src/service";


import ClassPlus "../../../../ICDevs/projects/ClassPlus/src/";


import D "mo:base/Debug";
import Principal "mo:base/Principal";
import Timer "mo:base/Timer";


shared (deployer) actor class MVEvent<system>(args: ?{
  icrc72PublisherArgs : ?ICRC72Publisher.InitArgs;
  icrc72SubscriberArgs : ?ICRC72Subscriber.InitArgs;
  ttArgs : ?TT.Args;
})  = this {

  //todo: centralized constants
  let CONST = {
    broadcasters = {
      sys = "icrc72:broadcaster:sys:";
      publisher = {
        broadcasters = {
          add = "icrc72:broadcaster:publisher:broadcaster:add";
          remove = "icrc72:broadcaster:publisher:broadcaster:remove";
        };
        add = "icrc72:broadcaster:publisher:add";
        remove = "icrc72:broadcaster:publisher:remove";
      };
      subscriber = {
        add = "icrc72:broadcaster:subscriber:add";
        remove = "icrc72:broadcaster:subscriber:remove";
      };
      relay = {
        add = "icrc72:broadcaster:relay:add";
        remove = "icrc72:broadcaster:relay:remove";
      };
      relayer = {
        add = "icrc72:broadcaster:relayer:add";
        remove = "icrc72:broadcaster:relayer:remove";
      };
    };
    subscription = {
      filter = "icrc72:subscription:filter";
      filter_update = "icrc72:subscription:filter:update";
      filter_remove = "icrc72:subscription:filter:remove";
      stopped = "icrc72:subscription:stopped";
      skip = "icrc72:subscription:skip";
      skip_update = "icrc72:subscription:skip:update";
      skip_remove = "icrc72:subscription:skip:remove";
      controllers = {
        list = "icrc72:subscription:controllers";
        list_add = "icrc72:subscription:controllers:list:add";
        list_remove = "icrc72:subscription:controllers:list:remove";
      };
    };

    publication = {
      actions = {
        canAssignBroadcaster = "icrc72:canAssignBroadcaster";
        assignBroadcasterToSubscriber = "icrc72:assignBroadcasterToSubscriber";
      };
      controllers = {
        list = "icrc72:publication:controllers";
        list_add = "icrc72:publication:controllers:list:add";
        list_remove = "icrc72:publication:controllers:list:remove";
      };
      publishers = {
        allowed = {
          list_add = "icrc72:publication:publishers:allowed:list:add";
          list_remove = "icrc72:publication:publishers:allowed:list:remove";
          list = "icrc72:publication:publishers:allowed:list";
          icrc75 = "icrc72:publication:publishers:allowed:icrc75";
          icrc75_remove = "icrc72:publication:publishers:allowed:icrc75:remove";
          icrc75_update = "icrc72:publication:publishers:allowed:icrc75:update";
        };
        disallowed = {
          list_add = "icrc72:publication:publishers:disallowed:list:add";
          list_remove = "icrc72:publication:publishers:disallowed:list:remove";
          list = "icrc72:publication:publishers:disallowed:list";
          icrc75 = "icrc72:publication:publishers:disallowed:icrc75";
          icrc75_remove = "icrc72:publication:publishers:disallowed:icrc75:remove";
          icrc75_update = "icrc72:publication:publishers:disallowed:icrc75:update";
        };
      };
      subscribers = {
        
        allowed = {
          list_add = "icrc72:publication:subscribers:allowed:list:add";
          list_remove = "icrc72:publication:subscribers:allowed:list:remove";
          list = "icrc72:publication:subscribers:allowed:list";
          icrc75 = "icrc72:publication:subscribers:allowed:icrc75";
          icrc75_remove = "icrc72:publication:subscribers:allowed:icrc75:remove";
          icrc75_update = "icrc72:publication:subscribers:allowed:icrc75:update";
        };
        disallowed = {
          list_add = "icrc72:publication:subscribers:disallowed:list:add";
          list_remove = "icrc72:publication:subscribers:disallowed:list:remove";
          list = "icrc72:publication:subscribers:disallowed:list";
          icrc75 = "icrc72:publication:subscribers:disallowed:icrc75";
          icrc75_remove = "icrc72:publication:subscribers:disallowed:icrc75:remove";
          icrc75_update = "icrc72:publication:subscribers:disallowed:icrc75:update";
        };
      };
      broadcasters = {
        sys = "icrc72:broadcaster:sys:";
        publisher = {
          add = "icrc72:broadcaster:publisher:add";
          remove = "icrc72:broadcaster:publisher:remove";
        };
        subscriber = {
          add = "icrc72:broadcaster:subscriber:add";
          remove = "icrc72:broadcaster:subscriber:remove";
        };
        relay = {
          add = "icrc72:broadcaster:relay:add";
          remove = "icrc72:broadcaster:relay:remove";
        };
        relayer = {
          add = "icrc72:broadcaster:relayer:add";
          remove = "icrc72:broadcaster:relayer:remove";
        };
      };
      created = "icrc72:publication:created";
    };
    publishers = {
      sys = "icrc72:publisher:sys:";
    };
    
    subscribers = {
      sys = "icrc72:subscriber:sys:";
    }
  };

  let debug_channel = {
    timerTool = true;
    icrc72Subscriber = true;
    icrc72Publisher = true;
    announce = true;
    init = true;
  };

  //default args
  let icrc72PublisherDefaultArgs = null;
  let icrc72SubscriberDefaultArgs = null;
  let ttDefaultArgs = null;

  stable var _owner = deployer.caller;

  //get args
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

  private func getOrchestrator() : Principal {
    return Principal.fromText("bkyz2-fmaaa-aaaaa-qaaaq-cai");
  };

  stable var icrc72SubscriberMigrationState : ICRC72Subscriber.State = ICRC72Subscriber.Migration.migration.initialState;

  let icrc72_subscriber = ICRC72Subscriber.Init<system>({
      manager = initManager;
      initialState = icrc72SubscriberMigrationState;
      args = icrc72SubscriberInitArgs;
      pullEnvironment = ?(func() : ICRC72Subscriber.Environment{
        {      
          var addRecord = null;
          generateId = null;
          var icrc72OrchestratorCanister = getOrchestrator();
          tt = tt();
          var handleEventOrder = null;
          var handleNotificationError = null;
          var handleNotificationPrice = null;
          var onSubscriptionReady = null;
          advanced = null;
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
          var addRecord = null;
          var generateId = null;
          icrc72Subscriber = icrc72_subscriber();
          var icrc72OrchestratorCanister = getOrchestrator();
          var onEventPublishError = null;
          var onEventPublished = null;
          var onPublisherReady = null;
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

  

  public shared func hello() : async Text {
    return "Hello, World!";
  };

  public shared(msg) func icrc72_handle_notification(items : [ICRC72SubscriberService.EventNotification]) : () {
    debug if(debug_channel.announce) D.print("REMOTE: Received notification: " # debug_show(items));
    return await* icrc72_subscriber().icrc72_handle_notification(msg.caller, items);
  };

  public shared(msg) func send(amount : Nat) : async [?Nat] {
    debug if(debug_channel.announce) D.print("REMOTE: sending: " # debug_show((amount)));
    let result = icrc72_publisher().publish<system>([{
      namespace = "counter";
      data = #Map([("amount", #Nat(amount))]);
      headers = null;
    }]);

    debug if(debug_channel.announce) D.print("REMOTE: sent: " # debug_show(result));

    return result;
  };

  public query(msg) func getCounter() : async Nat {
    return counter;
  };



  stable var counter = 0;

  public shared(msg) func init() : async() {
    if(Principal.fromActor(this) != msg.caller){
      D.trap("Only the canister can initialize the canister");
    };
    debug if(debug_channel.init) D.print("REMOTE: ---------Initializing Canister---------");
    


    ignore Timer.setTimer<system>(#nanoseconds(0 * 10), func () : async() {
      //declare a pulication of counter
      //todo: default for empty lists
      ignore await* icrc72_publisher().registerPublications([
        {
          namespace = "counter";
          config = [
            (
              CONST.publication.publishers.allowed.list : Text, 
              #Array([
                #Blob(Principal.toBlob(Principal.fromActor(this)))
              ])
            ),
            (
              CONST.publication.subscribers.allowed.list : Text, 
              #Array([
                 #Blob(Principal.toBlob(Principal.fromActor(this)))
              ])
            ),
          ];
          memo = null;
        }
      ]);
      ignore Timer.setTimer<system>(#nanoseconds(0 * 10), func () : async() {
      //declare a subscription of counter
        ignore await* icrc72_subscriber().subscribe([{
          namespace = "counter"; 
          config = [];
          memo = null;
          listener = #Sync(func <system>(notification: ICRC72SubscriberService.EventNotification) : () {
            let #Map(data) = notification.data else return;
            let #Nat(amount) = data[0].1 else return;
            counter := counter + amount;
            return;
          });
        }]);
      });
    });
  };

  Timer.setTimer<system>(#nanoseconds(0), func () : async() {
    let selfActor : actor {
      init : shared () -> async ();
    } = actor(Principal.toText(Principal.fromActor(this)));
    await selfActor.init();
  });

};