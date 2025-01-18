export const idlFactory = ({ IDL }) => {
  const ICRC16 = IDL.Rec();
  const ICRC16__1 = IDL.Rec();
  const ICRC16__2 = IDL.Rec();
  const Value__1 = IDL.Rec();
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
  const InitArgs = IDL.Record({ 'name' : IDL.Text });
  Value__1.fill(
    IDL.Variant({
      'Int' : IDL.Int,
      'Map' : IDL.Vec(IDL.Tuple(IDL.Text, Value__1)),
      'Nat' : IDL.Nat,
      'Blob' : IDL.Vec(IDL.Nat8),
      'Text' : IDL.Text,
      'Array' : IDL.Vec(Value__1),
    })
  );
  const Value = IDL.Variant({
    'Int' : IDL.Int,
    'Map' : IDL.Vec(IDL.Tuple(IDL.Text, Value__1)),
    'Nat' : IDL.Nat,
    'Blob' : IDL.Vec(IDL.Nat8),
    'Text' : IDL.Text,
    'Array' : IDL.Vec(Value__1),
  });
  const ActionDetail = IDL.Tuple(ActionId, Action);
  const TimerId = IDL.Nat;
  const Stats__1 = IDL.Record({
    'timers' : IDL.Nat,
    'maxExecutions' : IDL.Nat,
    'minAction' : IDL.Opt(ActionDetail),
    'cycles' : IDL.Nat,
    'nextActionId' : IDL.Nat,
    'nextTimer' : IDL.Opt(TimerId),
    'expectedExecutionTime' : IDL.Opt(Time),
    'lastExecutionTime' : Time,
  });
  const ICRC16Property__2 = IDL.Record({
    'value' : ICRC16__2,
    'name' : IDL.Text,
    'immutable' : IDL.Bool,
  });
  ICRC16__2.fill(
    IDL.Variant({
      'Int' : IDL.Int,
      'Map' : IDL.Vec(IDL.Tuple(IDL.Text, ICRC16__2)),
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
  const ICRC16Map__3 = IDL.Vec(IDL.Tuple(IDL.Text, ICRC16__2));
  const SubscriptionRecord = IDL.Record({
    'id' : IDL.Nat,
    'config' : ICRC16Map__3,
    'namespace' : IDL.Text,
  });
  const EventNotification__1 = IDL.Record({
    'id' : IDL.Nat,
    'eventId' : IDL.Nat,
    'source' : IDL.Principal,
    'data' : ICRC16__2,
    'headers' : IDL.Opt(ICRC16Map__3),
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
  const Stats = IDL.Record({
    'tt' : Stats__1,
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
  const EventNotification = IDL.Record({
    'id' : IDL.Nat,
    'eventId' : IDL.Nat,
    'source' : IDL.Principal,
    'data' : ICRC16__1,
    'headers' : IDL.Opt(ICRC16Map__1),
    'prevEventId' : IDL.Opt(IDL.Nat),
    'filter' : IDL.Opt(IDL.Text),
    'timestamp' : IDL.Nat,
    'namespace' : IDL.Text,
  });
  const ICRC16Map__2 = IDL.Vec(IDL.Tuple(IDL.Text, ICRC16__2));
  const GenericError = IDL.Record({
    'message' : IDL.Text,
    'error_code' : IDL.Nat,
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
  const ICRC16Map = IDL.Vec(IDL.Tuple(IDL.Text, ICRC16));
  const ICRC16Property = IDL.Record({
    'value' : ICRC16,
    'name' : IDL.Text,
    'immutable' : IDL.Bool,
  });
  ICRC16.fill(
    IDL.Variant({
      'Int' : IDL.Int,
      'Map' : ICRC16Map,
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
  const SubscriptionUpdateRequest = IDL.Record({
    'subscription' : IDL.Variant({ 'id' : IDL.Nat, 'namespace' : IDL.Text }),
    'memo' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'config' : IDL.Tuple(IDL.Text, ICRC16),
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
  const Subscriber = IDL.Service({
    'checkRegisteredExecutionListener' : IDL.Func([], [IDL.Bool], []),
    'getCounter' : IDL.Func([], [IDL.Nat], ['query']),
    'getErrors' : IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
    'getRecords' : IDL.Func(
        [],
        [
          IDL.Vec(
            IDL.Tuple(
              IDL.Vec(IDL.Tuple(IDL.Text, Value)),
              IDL.Vec(IDL.Tuple(IDL.Text, Value)),
            )
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
    'icrc72_handle_notification' : IDL.Func(
        [IDL.Vec(EventNotification)],
        [],
        ['oneway'],
      ),
    'registerExecutionListenerASync' : IDL.Func(
        [IDL.Opt(ICRC16Map__2)],
        [IDL.Vec(SubscriptionRegisterResult)],
        [],
      ),
    'registerExecutionListenerASyncCalled' : IDL.Func([], [IDL.Nat], []),
    'registerExecutionListenerSync' : IDL.Func(
        [IDL.Opt(ICRC16Map__2)],
        [IDL.Vec(SubscriptionRegisterResult)],
        [],
      ),
    'registerExecutionListenerSyncCalled' : IDL.Func([], [IDL.Nat], []),
    'simulateSubscriptionCreation' : IDL.Func(
        [IDL.Bool, IDL.Text, IDL.Opt(ICRC16Map__2)],
        [IDL.Vec(SubscriptionRegisterResult)],
        [],
      ),
    'simulate_notification' : IDL.Func(
        [IDL.Opt(IDL.Principal), IDL.Vec(EventNotification)],
        [],
        ['oneway'],
      ),
    'updateSubscription' : IDL.Func(
        [IDL.Vec(SubscriptionUpdateRequest)],
        [IDL.Vec(SubscriptionUpdateResult)],
        [],
      ),
  });
  return Subscriber;
};
export const init = ({ IDL }) => {
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
  const InitArgs = IDL.Record({ 'name' : IDL.Text });
  return [
    IDL.Opt(
      IDL.Record({
        'ttArgs' : IDL.Opt(Args),
        'orchestrator' : IDL.Principal,
        'icrc72SubscriberArgs' : IDL.Opt(InitArgs),
      })
    ),
  ];
};
