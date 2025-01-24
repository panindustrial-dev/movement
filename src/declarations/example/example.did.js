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
  const InitArgs__2 = IDL.Record({
    'restore' : IDL.Opt(
      IDL.Record({
        'previousEventIDs' : IDL.Vec(
          IDL.Tuple(IDL.Text, IDL.Tuple(IDL.Nat, IDL.Nat))
        ),
        'pendingEvents' : IDL.Vec(EmitableEvent),
      })
    ),
  });
  const InitArgs__1 = IDL.Record({ 'name' : IDL.Text });
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
  const InitArgs__3 = IDL.Record({ 'name' : IDL.Text });
  const InitArgs = IDL.Record({ 'name' : IDL.Text });
  const GenericError__1 = IDL.Record({
    'message' : IDL.Text,
    'error_code' : IDL.Nat,
  });
  const ConfirmMessageItemResult = IDL.Variant({
    'Ok' : IDL.Nat,
    'Err' : GenericError__1,
  });
  const ConfirmMessageResult = IDL.Variant({
    'allAccepted' : IDL.Null,
    'itemized' : IDL.Vec(ConfirmMessageItemResult),
  });
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
  const ICRC16Map__3 = IDL.Vec(IDL.Tuple(IDL.Text, ICRC16__3));
  const ICRC16Property__3 = IDL.Record({
    'value' : ICRC16__3,
    'name' : IDL.Text,
    'immutable' : IDL.Bool,
  });
  ICRC16__3.fill(
    IDL.Variant({
      'Int' : IDL.Int,
      'Map' : ICRC16Map__3,
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
  const EventNotification = IDL.Record({
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
  const Event = IDL.Record({
    'eventId' : IDL.Nat,
    'source' : IDL.Principal,
    'data' : ICRC16__2,
    'headers' : IDL.Opt(ICRC16Map__2),
    'prevEventId' : IDL.Opt(IDL.Nat),
    'timestamp' : IDL.Nat,
    'namespace' : IDL.Text,
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
  const PublicationRegistration = IDL.Record({
    'memo' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'config' : ICRC16Map__1,
    'namespace' : IDL.Text,
  });
  const GenericError = IDL.Record({
    'message' : IDL.Text,
    'error_code' : IDL.Nat,
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
    'icrc72_confirm_notifications' : IDL.Func(
        [IDL.Vec(IDL.Nat)],
        [ConfirmMessageResult],
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
    'icrc72_publish' : IDL.Func(
        [IDL.Vec(Event)],
        [IDL.Vec(IDL.Opt(PublishResult))],
        [],
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
    'init' : IDL.Func([], [], []),
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
  const InitArgs__2 = IDL.Record({
    'restore' : IDL.Opt(
      IDL.Record({
        'previousEventIDs' : IDL.Vec(
          IDL.Tuple(IDL.Text, IDL.Tuple(IDL.Nat, IDL.Nat))
        ),
        'pendingEvents' : IDL.Vec(EmitableEvent),
      })
    ),
  });
  const InitArgs__1 = IDL.Record({ 'name' : IDL.Text });
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
  const InitArgs__3 = IDL.Record({ 'name' : IDL.Text });
  const InitArgs = IDL.Record({ 'name' : IDL.Text });
  return [
    IDL.Opt(
      IDL.Record({
        'icrc72PublisherArgs' : IDL.Opt(InitArgs__2),
        'icrc72OrchestratorArgs' : IDL.Opt(InitArgs__1),
        'ttArgs' : IDL.Opt(Args),
        'icrc72SubscriberArgs' : IDL.Opt(InitArgs__3),
        'icrc72BroadcasterArgs' : IDL.Opt(InitArgs),
      })
    ),
  ];
};
