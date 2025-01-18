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
    'id' : IDL.Nat,
    'broadcaster' : IDL.Principal,
    'source' : IDL.Principal,
    'data' : ICRC16,
    'headers' : IDL.Opt(ICRC16Map),
    'timestamp' : IDL.Nat,
    'prevId' : IDL.Opt(IDL.Nat),
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
  const InitArgs = IDL.Record({ 'name' : IDL.Text });
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
  const ICRC16Map__3 = IDL.Vec(IDL.Tuple(IDL.Text, ICRC16__3));
  const StakeRecord = IDL.Record({
    'principal' : IDL.Opt(IDL.Principal),
    'stake' : IDL.Nat,
    'timestamp' : IDL.Nat,
  });
  const EventNotificationRecordShared__1 = IDL.Record({
    'id' : IDL.Nat,
    'bConfirmed' : IDL.Opt(IDL.Nat),
    'eventId' : IDL.Nat,
    'destination' : IDL.Principal,
    'headers' : IDL.Opt(ICRC16Map__3),
    'stake' : StakeRecord,
    'filter' : IDL.Opt(IDL.Text),
    'bSent' : IDL.Opt(IDL.Nat),
    'timerId' : IDL.Opt(IDL.Nat),
    'publication' : IDL.Text,
  });
  const Event__1 = IDL.Record({
    'id' : IDL.Nat,
    'source' : IDL.Principal,
    'data' : ICRC16__3,
    'headers' : IDL.Opt(ICRC16Map__3),
    'timestamp' : IDL.Nat,
    'prevId' : IDL.Opt(IDL.Nat),
    'namespace' : IDL.Text,
  });
  const EventRecordShared__1 = IDL.Record({
    'relayQueue' : IDL.Vec(IDL.Principal),
    'notifications' : IDL.Vec(IDL.Nat),
    'notificationQueue' : IDL.Vec(IDL.Nat),
    'event' : Event__1,
  });
  const ActionDetail = IDL.Tuple(ActionId, Action);
  const TimerId = IDL.Nat;
  const Stats__3 = IDL.Record({
    'timers' : IDL.Nat,
    'maxExecutions' : IDL.Nat,
    'minAction' : IDL.Opt(ActionDetail),
    'cycles' : IDL.Nat,
    'nextActionId' : IDL.Nat,
    'nextTimer' : IDL.Opt(TimerId),
    'expectedExecutionTime' : IDL.Opt(Time),
    'lastExecutionTime' : Time,
  });
  const EventRecordShared = IDL.Record({
    'relayQueue' : IDL.Vec(IDL.Principal),
    'notifications' : IDL.Vec(IDL.Nat),
    'notificationQueue' : IDL.Vec(IDL.Nat),
    'event' : Event__1,
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
  const SubscriptionRecord = IDL.Record({
    'id' : IDL.Nat,
    'config' : ICRC16Map__4,
    'namespace' : IDL.Text,
  });
  const EventNotification__1 = IDL.Record({
    'id' : IDL.Nat,
    'eventId' : IDL.Nat,
    'source' : IDL.Principal,
    'data' : ICRC16__4,
    'headers' : IDL.Opt(ICRC16Map__4),
    'prevEventId' : IDL.Opt(IDL.Nat),
    'filter' : IDL.Opt(IDL.Text),
    'timestamp' : IDL.Nat,
    'namespace' : IDL.Text,
  });
  const Namespace = IDL.Text;
  const ICRC75Item = IDL.Record({
    'principal' : IDL.Principal,
    'namespace' : Namespace,
  });
  const Stats__2 = IDL.Record({
    'tt' : Stats__3,
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
    'confirmAccumulator' : IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Vec(IDL.Nat))),
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
  const Stats__1 = IDL.Record({
    'tt' : Stats__3,
    'icrc72Subscriber' : Stats__2,
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
  const SubscriptionRecordShared = IDL.Record({
    'id' : IDL.Nat,
    'skip' : IDL.Opt(IDL.Tuple(IDL.Nat, IDL.Nat)),
    'stake' : StakeRecord,
    'filter' : IDL.Opt(IDL.Text),
    'config' : ICRC16Map__3,
    'namespace' : IDL.Text,
  });
  const EventNotification__2 = IDL.Record({
    'id' : IDL.Nat,
    'eventId' : IDL.Nat,
    'source' : IDL.Principal,
    'data' : ICRC16__3,
    'headers' : IDL.Opt(ICRC16Map__3),
    'prevEventId' : IDL.Opt(IDL.Nat),
    'filter' : IDL.Opt(IDL.Text),
    'timestamp' : IDL.Nat,
    'namespace' : IDL.Text,
  });
  const EventNotificationRecordShared = IDL.Record({
    'id' : IDL.Nat,
    'bConfirmed' : IDL.Opt(IDL.Nat),
    'eventId' : IDL.Nat,
    'destination' : IDL.Principal,
    'headers' : IDL.Opt(ICRC16Map__3),
    'stake' : StakeRecord,
    'filter' : IDL.Opt(IDL.Text),
    'bSent' : IDL.Opt(IDL.Nat),
    'timerId' : IDL.Opt(IDL.Nat),
    'publication' : IDL.Text,
  });
  const SubscriberRecordShared = IDL.Record({
    'skip' : IDL.Opt(IDL.Tuple(IDL.Nat, IDL.Nat)),
    'subscriptionId' : IDL.Nat,
    'filter' : IDL.Opt(IDL.Text),
    'publicationId' : IDL.Nat,
    'initialConfig' : ICRC16Map__3,
    'subscriber' : IDL.Principal,
    'namespace' : IDL.Text,
  });
  const PublicationRecordShared = IDL.Record({
    'id' : IDL.Nat,
    'subnetIndex' : IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Principal)),
    'registeredPublishers' : IDL.Vec(IDL.Principal),
    'registeredSubscribers' : IDL.Vec(
      IDL.Tuple(IDL.Principal, SubscriberRecordShared)
    ),
    'stakeIndex' : IDL.Vec(IDL.Tuple(StakeRecord, IDL.Principal)),
    'registeredRelay' : IDL.Vec(
      IDL.Tuple(IDL.Principal, IDL.Opt(IDL.Vec(IDL.Text)))
    ),
    'namespace' : IDL.Text,
  });
  const Stats = IDL.Record({
    'tt' : Stats__3,
    'eventStore' : IDL.Vec(
      IDL.Tuple(IDL.Text, IDL.Vec(IDL.Tuple(IDL.Nat, EventRecordShared)))
    ),
    'icrc72Publisher' : Stats__1,
    'subscriptions' : IDL.Vec(IDL.Tuple(IDL.Nat, SubscriptionRecordShared)),
    'icrc72Subscriber' : Stats__2,
    'messageAccumulator' : IDL.Vec(
      IDL.Tuple(
        IDL.Principal,
        IDL.Vec(IDL.Tuple(IDL.Nat, EventNotification__2)),
      )
    ),
    'messageTimer' : IDL.Opt(IDL.Nat),
    'error' : IDL.Opt(IDL.Text),
    'roundDelay' : IDL.Opt(IDL.Nat),
    'notificationStore' : IDL.Vec(
      IDL.Tuple(IDL.Nat, EventNotificationRecordShared)
    ),
    'publications' : IDL.Vec(IDL.Tuple(IDL.Nat, PublicationRecordShared)),
    'maxMessages' : IDL.Opt(IDL.Nat),
    'relayTimer' : IDL.Opt(IDL.Nat),
    'nextNotificationId' : IDL.Nat,
    'relayAccumulator' : IDL.Vec(
      IDL.Tuple(IDL.Principal, IDL.Vec(IDL.Tuple(IDL.Nat, Event__1)))
    ),
    'icrc72OrchestratorCanister' : IDL.Principal,
  });
  const GenericError = IDL.Record({
    'message' : IDL.Text,
    'error_code' : IDL.Nat,
  });
  const ConfirmMessageItemResult = IDL.Variant({
    'Ok' : IDL.Nat,
    'Err' : GenericError,
  });
  const ConfirmMessageResult = IDL.Variant({
    'allAccepted' : IDL.Null,
    'itemized' : IDL.Vec(ConfirmMessageItemResult),
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
    'id' : IDL.Nat,
    'eventId' : IDL.Nat,
    'source' : IDL.Principal,
    'data' : ICRC16__2,
    'headers' : IDL.Opt(ICRC16Map__2),
    'prevEventId' : IDL.Opt(IDL.Nat),
    'filter' : IDL.Opt(IDL.Text),
    'timestamp' : IDL.Nat,
    'namespace' : IDL.Text,
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
  const Event = IDL.Record({
    'id' : IDL.Nat,
    'source' : IDL.Principal,
    'data' : ICRC16__1,
    'headers' : IDL.Opt(ICRC16Map__1),
    'timestamp' : IDL.Nat,
    'prevId' : IDL.Opt(IDL.Nat),
    'namespace' : IDL.Text,
  });
  const PublishError = IDL.Variant({
    'GenericError' : GenericError,
    'PublicationNotFound' : IDL.Null,
    'Unauthorized' : IDL.Null,
  });
  const PublishResult = IDL.Variant({
    'Ok' : IDL.Vec(IDL.Nat),
    'Err' : PublishError,
  });
  const MVEvent = IDL.Service({
    'getHandledNotifications' : IDL.Func(
        [],
        [
          IDL.Vec(
            IDL.Tuple(EventNotificationRecordShared__1, EventRecordShared__1)
          ),
        ],
        ['query'],
      ),
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
    'icrc72_confirm_notifications' : IDL.Func(
        [IDL.Vec(IDL.Nat)],
        [ConfirmMessageResult],
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
    'initialize' : IDL.Func([], [], []),
    'simulatePublish' : IDL.Func(
        [IDL.Nat, IDL.Text, IDL.Nat, IDL.Principal],
        [IDL.Vec(IDL.Opt(PublishResult))],
        [],
      ),
    'simulatePublisherAssignment' : IDL.Func(
        [IDL.Text, IDL.Nat, IDL.Principal],
        [],
        [],
      ),
    'simulatePublisherRemoval' : IDL.Func(
        [IDL.Text, IDL.Nat, IDL.Principal],
        [],
        [],
      ),
    'simulateRelayAssignment' : IDL.Func(
        [IDL.Text, IDL.Nat, IDL.Principal],
        [],
        [],
      ),
    'simulateRelayRemoval' : IDL.Func(
        [IDL.Text, IDL.Nat, IDL.Principal],
        [],
        [],
      ),
    'simulateSubscriberAssignment' : IDL.Func(
        [IDL.Text, IDL.Nat, IDL.Principal],
        [],
        [],
      ),
    'simulateSubscriberRemoval' : IDL.Func(
        [IDL.Text, IDL.Nat, IDL.Principal],
        [],
        [],
      ),
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
    'id' : IDL.Nat,
    'broadcaster' : IDL.Principal,
    'source' : IDL.Principal,
    'data' : ICRC16,
    'headers' : IDL.Opt(ICRC16Map),
    'timestamp' : IDL.Nat,
    'prevId' : IDL.Opt(IDL.Nat),
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
  const InitArgs = IDL.Record({ 'name' : IDL.Text });
  return [
    IDL.Opt(
      IDL.Record({
        'icrc72PublisherArgs' : IDL.Opt(InitArgs__1),
        'ttArgs' : IDL.Opt(Args),
        'orchestrator' : IDL.Principal,
        'icrc72SubscriberArgs' : IDL.Opt(InitArgs__2),
        'icrc72BroadcasterArgs' : IDL.Opt(InitArgs),
      })
    ),
  ];
};
