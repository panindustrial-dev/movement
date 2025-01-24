export const idlFactory = ({ IDL }) => {
  const ICRC16 = IDL.Rec();
  const ICRC16__1 = IDL.Rec();
  const ICRC16__2 = IDL.Rec();
  const ICRC16__3 = IDL.Rec();
  const ICRC16Property = IDL.Record({
    'value' : ICRC16,
    'name' : IDL.Text,
    'immutable' : IDL.Bool,
  });
  ICRC16.fill(
    IDL.Variant({
      'Int' : IDL.Int,
      'Map' : IDL.Vec(IDL.Tuple(IDL.Text, ICRC16)),
      'Nat' : IDL.Nat,
      'Set' : IDL.Vec(ICRC16),
      'Nat16' : IDL.Nat16,
      'Nat32' : IDL.Nat32,
      'Nat64' : IDL.Nat64,
      'Blob' : IDL.Vec(IDL.Nat8),
      'Bool' : IDL.Bool,
      'Int8' : IDL.Int8,
      'Nat8' : IDL.Nat8,
      'Nats' : IDL.Vec(IDL.Nat),
      'Text' : IDL.Text,
      'Bytes' : IDL.Vec(IDL.Nat8),
      'Int16' : IDL.Int16,
      'Int32' : IDL.Int32,
      'Int64' : IDL.Int64,
      'Option' : IDL.Opt(ICRC16),
      'Floats' : IDL.Vec(IDL.Float64),
      'Float' : IDL.Float64,
      'Principal' : IDL.Principal,
      'Array' : IDL.Vec(ICRC16),
      'ValueMap' : IDL.Vec(IDL.Tuple(ICRC16, ICRC16)),
      'Class' : IDL.Vec(ICRC16Property),
    })
  );
  const ICRC16Map = IDL.Vec(IDL.Tuple(IDL.Text, ICRC16));
  const EmitableEvent = IDL.Record({
    'eventId' : IDL.Nat,
    'broadcaster' : IDL.Principal,
    'source' : IDL.Principal,
    'data' : ICRC16,
    'headers' : IDL.Opt(ICRC16Map),
    'prevEventId' : IDL.Opt(IDL.Nat),
    'timestamp' : IDL.Nat,
    'namespace' : IDL.Text,
  });
  const InitArgs = IDL.Record({
    'restore' : IDL.Opt(
      IDL.Record({
        'previousEventIDs' : IDL.Vec(
          IDL.Tuple(IDL.Text, IDL.Tuple(IDL.Nat, IDL.Nat))
        ),
        'pendingEvents' : IDL.Vec(EmitableEvent),
      })
    ),
  });
  const Time = IDL.Nat;
  const ActionId = IDL.Record({ 'id' : IDL.Nat, 'time' : Time });
  const Action = IDL.Record({
    'aSync' : IDL.Opt(IDL.Nat),
    'actionType' : IDL.Text,
    'params' : IDL.Vec(IDL.Nat8),
    'retries' : IDL.Nat,
  });
  const ArgList = IDL.Record({
    'nextCycleActionId' : IDL.Opt(IDL.Nat),
    'maxExecutions' : IDL.Opt(IDL.Nat),
    'nextActionId' : IDL.Nat,
    'lastActionIdReported' : IDL.Opt(IDL.Nat),
    'lastCycleReport' : IDL.Opt(IDL.Nat),
    'initialTimers' : IDL.Vec(IDL.Tuple(ActionId, Action)),
    'expectedExecutionTime' : Time,
    'lastExecutionTime' : Time,
  });
  const Args = IDL.Opt(ArgList);
  const NewEvent = IDL.Record({
    'data' : ICRC16,
    'headers' : IDL.Opt(ICRC16Map),
    'namespace' : IDL.Text,
  });
  const GenericError__1 = IDL.Record({
    'message' : IDL.Text,
    'error_code' : IDL.Nat,
  });
  const PublishError = IDL.Variant({
    'GenericError' : GenericError__1,
    'PublicationNotFound' : IDL.Null,
    'Unauthorized' : IDL.Null,
  });
  const PublishResult = IDL.Variant({
    'Ok' : IDL.Vec(IDL.Nat),
    'Err' : PublishError,
  });
  const ActionDetail = IDL.Tuple(ActionId, Action);
  const TimerId = IDL.Nat;
  const Stats__2 = IDL.Record({
    'timers' : IDL.Nat,
    'maxExecutions' : IDL.Nat,
    'minAction' : IDL.Opt(ActionDetail),
    'cycles' : IDL.Nat,
    'nextActionId' : IDL.Nat,
    'nextTimer' : IDL.Opt(TimerId),
    'expectedExecutionTime' : IDL.Opt(Time),
    'lastExecutionTime' : Time,
  });
  const ICRC16Property__3 = IDL.Record({
    'value' : ICRC16__3,
    'name' : IDL.Text,
    'immutable' : IDL.Bool,
  });
  ICRC16__3.fill(
    IDL.Variant({
      'Int' : IDL.Int,
      'Map' : IDL.Vec(IDL.Tuple(IDL.Text, ICRC16__3)),
      'Nat' : IDL.Nat,
      'Set' : IDL.Vec(ICRC16__3),
      'Nat16' : IDL.Nat16,
      'Nat32' : IDL.Nat32,
      'Nat64' : IDL.Nat64,
      'Blob' : IDL.Vec(IDL.Nat8),
      'Bool' : IDL.Bool,
      'Int8' : IDL.Int8,
      'Nat8' : IDL.Nat8,
      'Nats' : IDL.Vec(IDL.Nat),
      'Text' : IDL.Text,
      'Bytes' : IDL.Vec(IDL.Nat8),
      'Int16' : IDL.Int16,
      'Int32' : IDL.Int32,
      'Int64' : IDL.Int64,
      'Option' : IDL.Opt(ICRC16__3),
      'Floats' : IDL.Vec(IDL.Float64),
      'Float' : IDL.Float64,
      'Principal' : IDL.Principal,
      'Array' : IDL.Vec(ICRC16__3),
      'ValueMap' : IDL.Vec(IDL.Tuple(ICRC16__3, ICRC16__3)),
      'Class' : IDL.Vec(ICRC16Property__3),
    })
  );
  const ICRC16MapItem = IDL.Tuple(IDL.Text, ICRC16__3);
  const ICRC16Map__3 = IDL.Vec(ICRC16MapItem);
  const SubscriptionRecord = IDL.Record({
    'id' : IDL.Nat,
    'config' : ICRC16Map__3,
    'namespace' : IDL.Text,
  });
  const EventNotification__1 = IDL.Record({
    'eventId' : IDL.Nat,
    'source' : IDL.Principal,
    'data' : ICRC16__3,
    'headers' : IDL.Opt(ICRC16Map__3),
    'prevEventId' : IDL.Opt(IDL.Nat),
    'filter' : IDL.Opt(IDL.Text),
    'timestamp' : IDL.Nat,
    'notificationId' : IDL.Nat,
    'namespace' : IDL.Text,
  });
  const Namespace__1 = IDL.Text;
  const ICRC75Item = IDL.Record({
    'principal' : IDL.Principal,
    'namespace' : Namespace__1,
  });
  const Stats__1 = IDL.Record({
    'tt' : Stats__2,
    'subscriptions' : IDL.Vec(IDL.Tuple(IDL.Nat, SubscriptionRecord)),
    'readyForSubscription' : IDL.Bool,
    'backlogs' : IDL.Vec(
      IDL.Tuple(IDL.Nat, IDL.Vec(IDL.Tuple(IDL.Nat, EventNotification__1)))
    ),
    'validBroadcasters' : IDL.Variant({
      'list' : IDL.Vec(IDL.Principal),
      'icrc75' : ICRC75Item,
    }),
    'confirmTimer' : IDL.Opt(IDL.Nat),
    'error' : IDL.Opt(IDL.Text),
    'confirmAccumulator' : IDL.Vec(
      IDL.Tuple(IDL.Principal, IDL.Vec(IDL.Tuple(IDL.Nat, IDL.Nat)))
    ),
    'broadcasters' : IDL.Vec(IDL.Tuple(IDL.Nat, IDL.Vec(IDL.Principal))),
    'lastEventId' : IDL.Vec(
      IDL.Tuple(IDL.Text, IDL.Vec(IDL.Tuple(IDL.Nat, IDL.Nat)))
    ),
    'icrc72OrchestratorCanister' : IDL.Principal,
  });
  const PublicationRecord = IDL.Record({
    'id' : IDL.Nat,
    'namespace' : IDL.Text,
  });
  const ActionId__1 = IDL.Record({ 'id' : IDL.Nat, 'time' : Time });
  const Stats = IDL.Record({
    'tt' : Stats__2,
    'icrc72Subscriber' : Stats__1,
    'error' : IDL.Opt(IDL.Text),
    'orchestrator' : IDL.Principal,
    'readyForPublications' : IDL.Bool,
    'eventsProcessing' : IDL.Bool,
    'previousEventIds' : IDL.Vec(
      IDL.Tuple(IDL.Text, IDL.Tuple(IDL.Nat, IDL.Nat))
    ),
    'pendingEvents' : IDL.Vec(EmitableEvent),
    'broadcasters' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Vec(IDL.Principal))),
    'publications' : IDL.Vec(IDL.Tuple(IDL.Nat, PublicationRecord)),
    'drainEventId' : IDL.Opt(ActionId__1),
    'icrc72OrchestratorCanister' : IDL.Principal,
  });
  const ICRC16Map__2 = IDL.Vec(IDL.Tuple(IDL.Text, ICRC16__2));
  const ICRC16Property__2 = IDL.Record({
    'value' : ICRC16__2,
    'name' : IDL.Text,
    'immutable' : IDL.Bool,
  });
  ICRC16__2.fill(
    IDL.Variant({
      'Int' : IDL.Int,
      'Map' : ICRC16Map__2,
      'Nat' : IDL.Nat,
      'Set' : IDL.Vec(ICRC16__2),
      'Nat16' : IDL.Nat16,
      'Nat32' : IDL.Nat32,
      'Nat64' : IDL.Nat64,
      'Blob' : IDL.Vec(IDL.Nat8),
      'Bool' : IDL.Bool,
      'Int8' : IDL.Int8,
      'Nat8' : IDL.Nat8,
      'Nats' : IDL.Vec(IDL.Nat),
      'Text' : IDL.Text,
      'Bytes' : IDL.Vec(IDL.Nat8),
      'Int16' : IDL.Int16,
      'Int32' : IDL.Int32,
      'Int64' : IDL.Int64,
      'Option' : IDL.Opt(ICRC16__2),
      'Floats' : IDL.Vec(IDL.Float64),
      'Float' : IDL.Float64,
      'Principal' : IDL.Principal,
      'Array' : IDL.Vec(ICRC16__2),
      'ValueMap' : IDL.Vec(IDL.Tuple(ICRC16__2, ICRC16__2)),
      'Class' : IDL.Vec(ICRC16Property__2),
    })
  );
  const EventNotification = IDL.Record({
    'eventId' : IDL.Nat,
    'source' : IDL.Principal,
    'data' : ICRC16__2,
    'headers' : IDL.Opt(ICRC16Map__2),
    'prevEventId' : IDL.Opt(IDL.Nat),
    'filter' : IDL.Opt(IDL.Text),
    'timestamp' : IDL.Nat,
    'notificationId' : IDL.Nat,
    'namespace' : IDL.Text,
  });
  const PublicationRegistration = IDL.Record({
    'memo' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'config' : ICRC16Map,
    'namespace' : IDL.Text,
  });
  const GenericError = IDL.Record({
    'message' : IDL.Text,
    'error_code' : IDL.Nat,
  });
  const Namespace = IDL.Text;
  const PublicationRegisterError = IDL.Variant({
    'GenericError' : GenericError,
    'ImproperConfig' : IDL.Text,
    'UnauthorizedPublisher' : IDL.Record({ 'namespace' : Namespace }),
    'Unauthorized' : IDL.Null,
    'GenericBatchError' : IDL.Text,
    'Exists' : IDL.Nat,
  });
  const PublicationRegisterResult = IDL.Opt(
    IDL.Variant({ 'Ok' : IDL.Nat, 'Err' : PublicationRegisterError })
  );
  const PublicationDeleteError = IDL.Variant({
    'GenericError' : GenericError,
    'NotFound' : IDL.Null,
    'Unauthorized' : IDL.Null,
    'GenericBatchError' : IDL.Text,
  });
  const PublicationDeleteResult = IDL.Opt(
    IDL.Variant({ 'Ok' : IDL.Bool, 'Err' : PublicationDeleteError })
  );
  const ICRC16Map__1 = IDL.Vec(IDL.Tuple(IDL.Text, ICRC16__1));
  const ICRC16Property__1 = IDL.Record({
    'value' : ICRC16__1,
    'name' : IDL.Text,
    'immutable' : IDL.Bool,
  });
  ICRC16__1.fill(
    IDL.Variant({
      'Int' : IDL.Int,
      'Map' : ICRC16Map__1,
      'Nat' : IDL.Nat,
      'Set' : IDL.Vec(ICRC16__1),
      'Nat16' : IDL.Nat16,
      'Nat32' : IDL.Nat32,
      'Nat64' : IDL.Nat64,
      'Blob' : IDL.Vec(IDL.Nat8),
      'Bool' : IDL.Bool,
      'Int8' : IDL.Int8,
      'Nat8' : IDL.Nat8,
      'Nats' : IDL.Vec(IDL.Nat),
      'Text' : IDL.Text,
      'Bytes' : IDL.Vec(IDL.Nat8),
      'Int16' : IDL.Int16,
      'Int32' : IDL.Int32,
      'Int64' : IDL.Int64,
      'Option' : IDL.Opt(ICRC16__1),
      'Floats' : IDL.Vec(IDL.Float64),
      'Float' : IDL.Float64,
      'Principal' : IDL.Principal,
      'Array' : IDL.Vec(ICRC16__1),
      'ValueMap' : IDL.Vec(IDL.Tuple(ICRC16__1, ICRC16__1)),
      'Class' : IDL.Vec(ICRC16Property__1),
    })
  );
  const PublicationIdentifier = IDL.Variant({
    'publicationId' : IDL.Nat,
    'namespace' : IDL.Text,
  });
  const PublicationUpdateRequest = IDL.Record({
    'memo' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'config' : IDL.Tuple(IDL.Text, ICRC16__1),
    'publication' : PublicationIdentifier,
  });
  const PublicationUpdateError = IDL.Variant({
    'GenericError' : GenericError,
    'ImproperConfig' : IDL.Text,
    'NotFound' : IDL.Null,
    'Unauthorized' : IDL.Null,
    'GenericBatchError' : IDL.Text,
  });
  const PublicationUpdateResult = IDL.Opt(
    IDL.Variant({ 'Ok' : IDL.Bool, 'Err' : PublicationUpdateError })
  );
  const Publisher = IDL.Service({
    'getPublishErrors' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(NewEvent, PublishError))],
        ['query'],
      ),
    'getPublishedEvents' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(NewEvent, IDL.Opt(PublishResult)))],
        ['query'],
      ),
    'getUnhandledEvents' : IDL.Func([], [IDL.Vec(NewEvent)], ['query']),
    'get_stats' : IDL.Func([], [Stats], ['query']),
    'get_subnet_for_canister' : IDL.Func(
        [],
        [
          IDL.Variant({
            'Ok' : IDL.Record({ 'subnet_id' : IDL.Opt(IDL.Principal) }),
            'Err' : IDL.Text,
          }),
        ],
        ['query'],
      ),
    'hello' : IDL.Func([], [IDL.Text], []),
    'icrc72_handle_notification' : IDL.Func(
        [IDL.Vec(EventNotification)],
        [],
        ['oneway'],
      ),
    'registerSamplePublication' : IDL.Func(
        [IDL.Vec(PublicationRegistration)],
        [IDL.Vec(PublicationRegisterResult)],
        [],
      ),
    'simulateBroadcastAssignment' : IDL.Func(
        [IDL.Text, IDL.Principal],
        [],
        ['oneway'],
      ),
    'simulateBroadcastAssignmentEvent' : IDL.Func(
        [IDL.Text, IDL.Principal],
        [],
        ['oneway'],
      ),
    'simulateBroadcastRemoval' : IDL.Func(
        [IDL.Text, IDL.Principal],
        [],
        ['oneway'],
      ),
    'simulateBroadcastRemovalEvent' : IDL.Func(
        [IDL.Text, IDL.Principal],
        [],
        ['oneway'],
      ),
    'simulateDeletePublication' : IDL.Func(
        [IDL.Text],
        [PublicationDeleteResult],
        [],
      ),
    'simulatePublicationCreation' : IDL.Func(
        [],
        [IDL.Vec(PublicationRegisterResult)],
        [],
      ),
    'simulatePublish' : IDL.Func(
        [IDL.Vec(NewEvent)],
        [IDL.Vec(IDL.Opt(IDL.Nat))],
        [],
      ),
    'simulatePublishAsync' : IDL.Func(
        [IDL.Vec(NewEvent)],
        [IDL.Vec(IDL.Opt(IDL.Nat))],
        [],
      ),
    'simulatePublishWithHandler' : IDL.Func(
        [IDL.Vec(NewEvent)],
        [IDL.Vec(IDL.Opt(IDL.Nat))],
        [],
      ),
    'simulateUpdatePublication' : IDL.Func(
        [IDL.Vec(PublicationUpdateRequest)],
        [IDL.Vec(PublicationUpdateResult)],
        [],
      ),
  });
  return Publisher;
};
export const init = ({ IDL }) => {
  const ICRC16 = IDL.Rec();
  const ICRC16Property = IDL.Record({
    'value' : ICRC16,
    'name' : IDL.Text,
    'immutable' : IDL.Bool,
  });
  ICRC16.fill(
    IDL.Variant({
      'Int' : IDL.Int,
      'Map' : IDL.Vec(IDL.Tuple(IDL.Text, ICRC16)),
      'Nat' : IDL.Nat,
      'Set' : IDL.Vec(ICRC16),
      'Nat16' : IDL.Nat16,
      'Nat32' : IDL.Nat32,
      'Nat64' : IDL.Nat64,
      'Blob' : IDL.Vec(IDL.Nat8),
      'Bool' : IDL.Bool,
      'Int8' : IDL.Int8,
      'Nat8' : IDL.Nat8,
      'Nats' : IDL.Vec(IDL.Nat),
      'Text' : IDL.Text,
      'Bytes' : IDL.Vec(IDL.Nat8),
      'Int16' : IDL.Int16,
      'Int32' : IDL.Int32,
      'Int64' : IDL.Int64,
      'Option' : IDL.Opt(ICRC16),
      'Floats' : IDL.Vec(IDL.Float64),
      'Float' : IDL.Float64,
      'Principal' : IDL.Principal,
      'Array' : IDL.Vec(ICRC16),
      'ValueMap' : IDL.Vec(IDL.Tuple(ICRC16, ICRC16)),
      'Class' : IDL.Vec(ICRC16Property),
    })
  );
  const ICRC16Map = IDL.Vec(IDL.Tuple(IDL.Text, ICRC16));
  const EmitableEvent = IDL.Record({
    'eventId' : IDL.Nat,
    'broadcaster' : IDL.Principal,
    'source' : IDL.Principal,
    'data' : ICRC16,
    'headers' : IDL.Opt(ICRC16Map),
    'prevEventId' : IDL.Opt(IDL.Nat),
    'timestamp' : IDL.Nat,
    'namespace' : IDL.Text,
  });
  const InitArgs = IDL.Record({
    'restore' : IDL.Opt(
      IDL.Record({
        'previousEventIDs' : IDL.Vec(
          IDL.Tuple(IDL.Text, IDL.Tuple(IDL.Nat, IDL.Nat))
        ),
        'pendingEvents' : IDL.Vec(EmitableEvent),
      })
    ),
  });
  const Time = IDL.Nat;
  const ActionId = IDL.Record({ 'id' : IDL.Nat, 'time' : Time });
  const Action = IDL.Record({
    'aSync' : IDL.Opt(IDL.Nat),
    'actionType' : IDL.Text,
    'params' : IDL.Vec(IDL.Nat8),
    'retries' : IDL.Nat,
  });
  const ArgList = IDL.Record({
    'nextCycleActionId' : IDL.Opt(IDL.Nat),
    'maxExecutions' : IDL.Opt(IDL.Nat),
    'nextActionId' : IDL.Nat,
    'lastActionIdReported' : IDL.Opt(IDL.Nat),
    'lastCycleReport' : IDL.Opt(IDL.Nat),
    'initialTimers' : IDL.Vec(IDL.Tuple(ActionId, Action)),
    'expectedExecutionTime' : Time,
    'lastExecutionTime' : Time,
  });
  const Args = IDL.Opt(ArgList);
  return [
    IDL.Opt(
      IDL.Record({
        'icrc72PublisherArgs' : IDL.Opt(InitArgs),
        'ttArgs' : IDL.Opt(Args),
        'orchestrator' : IDL.Principal,
      })
    ),
  ];
};
