export const idlFactory = ({ IDL }) => {
  const ICRC16 = IDL.Rec();
  const ICRC16__1 = IDL.Rec();
  const ICRC16__2 = IDL.Rec();
  const ICRC16__3 = IDL.Rec();
  const ICRC16__4 = IDL.Rec();
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
  const InitArgs__1 = IDL.Record({
    'restore' : IDL.Opt(
      IDL.Record({
        'previousEventIDs' : IDL.Vec(
          IDL.Tuple(IDL.Text, IDL.Tuple(IDL.Nat, IDL.Nat))
        ),
        'pendingEvents' : IDL.Vec(EmitableEvent),
      })
    ),
  });
  const InitArgs = IDL.Record({ 'name' : IDL.Text });
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
  const InitArgs__2 = IDL.Record({ 'name' : IDL.Text });
  const ActionDetail = IDL.Tuple(ActionId, Action);
  const TimerId = IDL.Nat;
  const Stats__4 = IDL.Record({
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
  const ICRC75Item__1 = IDL.Record({
    'principal' : IDL.Principal,
    'namespace' : Namespace__1,
  });
  const Stats__3 = IDL.Record({
    'tt' : Stats__4,
    'log' : IDL.Vec(IDL.Text),
    'subscriptions' : IDL.Vec(IDL.Tuple(IDL.Nat, SubscriptionRecord)),
    'readyForSubscription' : IDL.Bool,
    'backlogs' : IDL.Vec(
      IDL.Tuple(IDL.Nat, IDL.Vec(IDL.Tuple(IDL.Nat, EventNotification__1)))
    ),
    'validBroadcasters' : IDL.Variant({
      'list' : IDL.Vec(IDL.Principal),
      'icrc75' : ICRC75Item__1,
    }),
    'confirmTimer' : IDL.Opt(IDL.Nat),
    'icrc85' : IDL.Record({
      'activeActions' : IDL.Nat,
      'nextCycleActionId' : IDL.Opt(IDL.Nat),
      'lastActionReported' : IDL.Opt(IDL.Nat),
    }),
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
  const Stats__2 = IDL.Record({
    'tt' : Stats__4,
    'log' : IDL.Vec(IDL.Text),
    'icrc72Subscriber' : Stats__3,
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
  const StakeRecord = IDL.Record({
    'principal' : IDL.Opt(IDL.Principal),
    'stake' : IDL.Nat,
    'timestamp' : IDL.Nat,
  });
  const ICRC16Property__4 = IDL.Record({
    'value' : ICRC16__4,
    'name' : IDL.Text,
    'immutable' : IDL.Bool,
  });
  ICRC16__4.fill(
    IDL.Variant({
      'Int' : IDL.Int,
      'Map' : IDL.Vec(IDL.Tuple(IDL.Text, ICRC16__4)),
      'Nat' : IDL.Nat,
      'Set' : IDL.Vec(ICRC16__4),
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
      'Option' : IDL.Opt(ICRC16__4),
      'Floats' : IDL.Vec(IDL.Float64),
      'Float' : IDL.Float64,
      'Principal' : IDL.Principal,
      'Array' : IDL.Vec(ICRC16__4),
      'ValueMap' : IDL.Vec(IDL.Tuple(ICRC16__4, ICRC16__4)),
      'Class' : IDL.Vec(ICRC16Property__4),
    })
  );
  const ICRC16Map__4 = IDL.Vec(IDL.Tuple(IDL.Text, ICRC16__4));
  const SubscriberRecordShared = IDL.Record({
    'registeredBroadcasters' : IDL.Vec(IDL.Principal),
    'skip' : IDL.Opt(IDL.Tuple(IDL.Nat, IDL.Nat)),
    'subscriptionId' : IDL.Nat,
    'stake' : StakeRecord,
    'filter' : IDL.Opt(IDL.Text),
    'subnet' : IDL.Opt(IDL.Principal),
    'subscriber' : IDL.Principal,
    'bStopped' : IDL.Bool,
  });
  const SubscriptionRecordShared = IDL.Record({
    'id' : IDL.Nat,
    'controllers' : IDL.Vec(IDL.Principal),
    'stake' : StakeRecord,
    'publicationId' : IDL.Nat,
    'initialConfig' : ICRC16Map__4,
    'subscribers' : IDL.Vec(IDL.Tuple(IDL.Principal, SubscriberRecordShared)),
    'namespace' : IDL.Text,
  });
  const BroadcasterRecordShared = IDL.Record({
    'relays' : IDL.Vec(
      IDL.Tuple(
        IDL.Text,
        IDL.Tuple(
          IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Vec(IDL.Principal))),
          IDL.Vec(
            IDL.Tuple(StakeRecord, IDL.Tuple(IDL.Principal, IDL.Principal))
          ),
        ),
      )
    ),
    'publishers' : IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Vec(IDL.Text))),
    'subscribers' : IDL.Vec(
      IDL.Tuple(
        IDL.Text,
        IDL.Tuple(
          IDL.Vec(IDL.Principal),
          IDL.Vec(IDL.Tuple(StakeRecord, IDL.Principal)),
        ),
      )
    ),
    'subnet' : IDL.Principal,
  });
  const Namespace__2 = IDL.Text;
  const PermissionSetShared = IDL.Variant({
    'disallowed_icrc75' : IDL.Record({
      'principal' : IDL.Principal,
      'namespace' : Namespace__2,
    }),
    'allowed' : IDL.Vec(IDL.Principal),
    'allowed_icrc75' : IDL.Record({
      'principal' : IDL.Principal,
      'namespace' : Namespace__2,
    }),
    'disallowed' : IDL.Vec(IDL.Principal),
  });
  const PublisherRecordShared = IDL.Record({
    'broadcasters' : IDL.Vec(IDL.Principal),
    'subnet' : IDL.Opt(IDL.Principal),
  });
  const PublicationRecordShared = IDL.Record({
    'id' : IDL.Nat,
    'allowedPublishers' : IDL.Opt(PermissionSetShared),
    'allowedSubscribers' : IDL.Opt(PermissionSetShared),
    'controllers' : IDL.Vec(IDL.Principal),
    'subnetIndex' : IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Principal)),
    'registeredPublishers' : IDL.Vec(
      IDL.Tuple(IDL.Principal, PublisherRecordShared)
    ),
    'initialConfig' : ICRC16Map__4,
    'namespace' : IDL.Text,
  });
  const Stats__1 = IDL.Record({
    'tt' : Stats__4,
    'log' : IDL.Vec(IDL.Text),
    'icrc72Publisher' : Stats__2,
    'subscriptions' : IDL.Vec(IDL.Tuple(IDL.Nat, SubscriptionRecordShared)),
    'defaultTake' : IDL.Nat,
    'nextSubscriptionID' : IDL.Nat,
    'broadcasters' : IDL.Vec(IDL.Tuple(IDL.Principal, BroadcasterRecordShared)),
    'subnet' : IDL.Opt(IDL.Principal),
    'publications' : IDL.Vec(IDL.Tuple(IDL.Nat, PublicationRecordShared)),
    'nextPublicationID' : IDL.Nat,
    'broadcastersBySubnet' : IDL.Vec(
      IDL.Tuple(IDL.Principal, IDL.Vec(IDL.Principal))
    ),
    'maxTake' : IDL.Nat,
  });
  const PublicationIdentifier = IDL.Variant({
    'publicationId' : IDL.Nat,
    'namespace' : IDL.Text,
  });
  const PublicationDeleteRequest = IDL.Record({
    'memo' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'publication' : PublicationIdentifier,
  });
  const GenericError = IDL.Record({
    'message' : IDL.Text,
    'error_code' : IDL.Nat,
  });
  const PublicationDeleteError = IDL.Variant({
    'GenericError' : GenericError,
    'NotFound' : IDL.Null,
    'Unauthorized' : IDL.Null,
    'GenericBatchError' : IDL.Text,
  });
  const PublicationDeleteResult = IDL.Opt(
    IDL.Variant({ 'Ok' : IDL.Bool, 'Err' : PublicationDeleteError })
  );
  const SubscriptionIdentifier = IDL.Variant({
    'subscriptionId' : IDL.Nat,
    'namespace' : IDL.Text,
  });
  const SubscriptionDeleteRequest = IDL.Record({
    'subscription' : SubscriptionIdentifier,
    'memo' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'subscriber' : IDL.Opt(IDL.Principal),
  });
  const SubscriptionDeleteError = IDL.Variant({
    'GenericError' : GenericError,
    'NotFound' : IDL.Null,
    'Unauthorized' : IDL.Null,
    'GenericBatchError' : IDL.Text,
  });
  const SubscriptionDeleteResult = IDL.Opt(
    IDL.Variant({ 'Ok' : IDL.Bool, 'Err' : SubscriptionDeleteError })
  );
  const OrchestrationQuerySlice = IDL.Variant({
    'ByBroadcaster' : IDL.Principal,
    'ByPublisher' : IDL.Principal,
    'ByNamespace' : IDL.Text,
    'BySubscriber' : IDL.Principal,
  });
  const StatisticsFilter = IDL.Opt(IDL.Opt(IDL.Vec(IDL.Text)));
  const OrchestrationFilter = IDL.Record({
    'slice' : IDL.Vec(OrchestrationQuerySlice),
    'statistics' : StatisticsFilter,
  });
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
  const Stats = IDL.Vec(IDL.Tuple(IDL.Text, ICRC16__1));
  const BroadcasterInfo = IDL.Record({
    'broadcaster' : IDL.Principal,
    'stats' : Stats,
  });
  const PublicationInfo = IDL.Record({
    'stats' : Stats,
    'publicationId' : IDL.Nat,
    'config' : ICRC16Map__1,
    'namespace' : IDL.Text,
  });
  const PublisherInfo = IDL.Record({
    'publisher' : IDL.Principal,
    'stats' : Stats,
  });
  const SubscriberInfo = IDL.Record({
    'subscriptions' : IDL.Opt(IDL.Vec(IDL.Nat)),
    'stats' : Stats,
    'config' : ICRC16Map__1,
    'subscriber' : IDL.Principal,
  });
  const SubscriptionInfo = IDL.Record({
    'subscriptionId' : IDL.Nat,
    'stats' : Stats,
    'config' : ICRC16Map__1,
    'namespace' : IDL.Text,
  });
  const Namespace = IDL.Text;
  const ICRC75Item = IDL.Record({
    'principal' : IDL.Principal,
    'namespace' : Namespace,
  });
  const ValidBroadcastersResponse = IDL.Variant({
    'list' : IDL.Vec(IDL.Principal),
    'icrc75' : ICRC75Item,
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
    'config' : ICRC16Map__1,
    'namespace' : IDL.Text,
  });
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
  const SubscriptionRegistration = IDL.Record({
    'memo' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'config' : ICRC16Map__1,
    'namespace' : IDL.Text,
  });
  const SubscriptionRegisterError = IDL.Variant({
    'GenericError' : GenericError,
    'PublicationNotFound' : IDL.Null,
    'ImproperConfig' : IDL.Text,
    'Unauthorized' : IDL.Null,
    'GenericBatchError' : IDL.Text,
    'Exists' : IDL.Nat,
  });
  const SubscriptionRegisterResult = IDL.Opt(
    IDL.Variant({ 'Ok' : IDL.Nat, 'Err' : SubscriptionRegisterError })
  );
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
  const SubscriptionUpdateRequest = IDL.Record({
    'subscription' : IDL.Variant({ 'id' : IDL.Nat, 'namespace' : IDL.Text }),
    'memo' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'config' : IDL.Tuple(IDL.Text, ICRC16__1),
    'subscriber' : IDL.Opt(IDL.Principal),
  });
  const SubscriptionUpdateError = IDL.Variant({
    'GenericError' : GenericError,
    'ImproperConfig' : IDL.Text,
    'NotFound' : IDL.Null,
    'Unauthorized' : IDL.Null,
    'GenericBatchError' : IDL.Text,
  });
  const SubscriptionUpdateResult = IDL.Opt(
    IDL.Variant({ 'Ok' : IDL.Bool, 'Err' : SubscriptionUpdateError })
  );
  const MVEvent = IDL.Service({
    'broadcaster_ready' : IDL.Func([], [], []),
    'file_subnet_broadcaster' : IDL.Func([IDL.Principal], [], []),
    'file_subnet_canister' : IDL.Func([IDL.Principal, IDL.Principal], [], []),
    'get_stats' : IDL.Func([], [Stats__1], ['query']),
    'get_subnet_for_canister' : IDL.Func(
        [IDL.Record({ 'principal' : IDL.Opt(IDL.Principal) })],
        [
          IDL.Variant({
            'Ok' : IDL.Record({ 'subnet_id' : IDL.Opt(IDL.Principal) }),
            'Err' : IDL.Text,
          }),
        ],
        ['query'],
      ),
    'hello' : IDL.Func([], [IDL.Text], []),
    'icrc72_delete_publication' : IDL.Func(
        [IDL.Vec(PublicationDeleteRequest)],
        [IDL.Vec(PublicationDeleteResult)],
        [],
      ),
    'icrc72_delete_subscription' : IDL.Func(
        [IDL.Vec(SubscriptionDeleteRequest)],
        [IDL.Vec(SubscriptionDeleteResult)],
        [],
      ),
    'icrc72_get_broadcasters' : IDL.Func(
        [
          IDL.Record({
            'prev' : IDL.Opt(IDL.Principal),
            'take' : IDL.Opt(IDL.Nat),
            'filter' : IDL.Opt(OrchestrationFilter),
          }),
        ],
        [IDL.Vec(BroadcasterInfo)],
        ['query'],
      ),
    'icrc72_get_publications' : IDL.Func(
        [
          IDL.Record({
            'prev' : IDL.Opt(IDL.Text),
            'take' : IDL.Opt(IDL.Nat),
            'filter' : IDL.Opt(OrchestrationFilter),
          }),
        ],
        [IDL.Vec(PublicationInfo)],
        ['query'],
      ),
    'icrc72_get_publishers' : IDL.Func(
        [
          IDL.Record({
            'prev' : IDL.Opt(IDL.Principal),
            'take' : IDL.Opt(IDL.Nat),
            'filter' : IDL.Opt(OrchestrationFilter),
          }),
        ],
        [IDL.Vec(PublisherInfo)],
        ['query'],
      ),
    'icrc72_get_subscribers' : IDL.Func(
        [
          IDL.Record({
            'prev' : IDL.Opt(IDL.Principal),
            'take' : IDL.Opt(IDL.Nat),
            'filter' : IDL.Opt(OrchestrationFilter),
          }),
        ],
        [IDL.Vec(SubscriberInfo)],
        ['query'],
      ),
    'icrc72_get_subscriptions' : IDL.Func(
        [
          IDL.Record({
            'prev' : IDL.Opt(IDL.Text),
            'take' : IDL.Opt(IDL.Nat),
            'filter' : IDL.Opt(OrchestrationFilter),
          }),
        ],
        [IDL.Vec(SubscriptionInfo)],
        ['query'],
      ),
    'icrc72_get_valid_broadcaster' : IDL.Func(
        [],
        [ValidBroadcastersResponse],
        [],
      ),
    'icrc72_handle_notification' : IDL.Func(
        [IDL.Vec(EventNotification)],
        [],
        ['oneway'],
      ),
    'icrc72_register_publication' : IDL.Func(
        [IDL.Vec(PublicationRegistration)],
        [IDL.Vec(PublicationRegisterResult)],
        [],
      ),
    'icrc72_register_subscription' : IDL.Func(
        [IDL.Vec(SubscriptionRegistration)],
        [IDL.Vec(SubscriptionRegisterResult)],
        [],
      ),
    'icrc72_update_publication' : IDL.Func(
        [IDL.Vec(PublicationUpdateRequest)],
        [IDL.Vec(PublicationUpdateResult)],
        [],
      ),
    'icrc72_update_subscription' : IDL.Func(
        [IDL.Vec(SubscriptionUpdateRequest)],
        [IDL.Vec(SubscriptionUpdateResult)],
        [],
      ),
    'initialize' : IDL.Func([], [], []),
  });
  return MVEvent;
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
  const InitArgs__1 = IDL.Record({
    'restore' : IDL.Opt(
      IDL.Record({
        'previousEventIDs' : IDL.Vec(
          IDL.Tuple(IDL.Text, IDL.Tuple(IDL.Nat, IDL.Nat))
        ),
        'pendingEvents' : IDL.Vec(EmitableEvent),
      })
    ),
  });
  const InitArgs = IDL.Record({ 'name' : IDL.Text });
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
  const InitArgs__2 = IDL.Record({ 'name' : IDL.Text });
  return [
    IDL.Opt(
      IDL.Record({
        'icrc72PublisherArgs' : IDL.Opt(InitArgs__1),
        'icrc72OrchestratorArgs' : IDL.Opt(InitArgs),
        'ttArgs' : IDL.Opt(Args),
        'icrc72SubscriberArgs' : IDL.Opt(InitArgs__2),
      })
    ),
  ];
};
