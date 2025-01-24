import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Action {
  'aSync' : [] | [bigint],
  'actionType' : string,
  'params' : Uint8Array | number[],
  'retries' : bigint,
}
export type ActionDetail = [ActionId, Action];
export interface ActionId { 'id' : bigint, 'time' : Time }
export interface ActionId__1 { 'id' : bigint, 'time' : Time }
export interface ArgList {
  'nextCycleActionId' : [] | [bigint],
  'maxExecutions' : [] | [bigint],
  'nextActionId' : bigint,
  'lastActionIdReported' : [] | [bigint],
  'lastCycleReport' : [] | [bigint],
  'initialTimers' : Array<[ActionId, Action]>,
  'expectedExecutionTime' : Time,
  'lastExecutionTime' : Time,
}
export type Args = [] | [ArgList];
export type ConfirmMessageItemResult = { 'Ok' : bigint } |
  { 'Err' : GenericError };
export type ConfirmMessageResult = { 'allAccepted' : null } |
  { 'itemized' : Array<ConfirmMessageItemResult> };
export interface EmitableEvent {
  'eventId' : bigint,
  'broadcaster' : Principal,
  'source' : Principal,
  'data' : ICRC16,
  'headers' : [] | [ICRC16Map],
  'prevEventId' : [] | [bigint],
  'timestamp' : bigint,
  'namespace' : string,
}
export interface Event {
  'eventId' : bigint,
  'source' : Principal,
  'data' : ICRC16__1,
  'headers' : [] | [ICRC16Map__1],
  'prevEventId' : [] | [bigint],
  'timestamp' : bigint,
  'namespace' : string,
}
export interface EventNotification {
  'eventId' : bigint,
  'source' : Principal,
  'data' : ICRC16__2,
  'headers' : [] | [ICRC16Map__2],
  'prevEventId' : [] | [bigint],
  'filter' : [] | [string],
  'timestamp' : bigint,
  'notificationId' : bigint,
  'namespace' : string,
}
export interface EventNotificationRecordShared {
  'bConfirmed' : [] | [bigint],
  'eventId' : bigint,
  'destination' : Principal,
  'headers' : [] | [ICRC16Map__3],
  'stake' : StakeRecord,
  'filter' : [] | [string],
  'bSent' : [] | [bigint],
  'notificationId' : bigint,
  'timerId' : [] | [bigint],
  'namespace' : string,
}
export interface EventNotificationRecordShared__1 {
  'bConfirmed' : [] | [bigint],
  'eventId' : bigint,
  'destination' : Principal,
  'headers' : [] | [ICRC16Map__3],
  'stake' : StakeRecord,
  'filter' : [] | [string],
  'bSent' : [] | [bigint],
  'notificationId' : bigint,
  'timerId' : [] | [bigint],
  'namespace' : string,
}
export interface EventNotification__1 {
  'eventId' : bigint,
  'source' : Principal,
  'data' : ICRC16__4,
  'headers' : [] | [ICRC16Map__4],
  'prevEventId' : [] | [bigint],
  'filter' : [] | [string],
  'timestamp' : bigint,
  'notificationId' : bigint,
  'namespace' : string,
}
export interface EventNotification__2 {
  'eventId' : bigint,
  'source' : Principal,
  'data' : ICRC16__3,
  'headers' : [] | [ICRC16Map__3],
  'prevEventId' : [] | [bigint],
  'filter' : [] | [string],
  'timestamp' : bigint,
  'notificationId' : bigint,
  'namespace' : string,
}
export interface EventRecordShared {
  'relayQueue' : Array<Principal>,
  'notifications' : Array<bigint>,
  'notificationQueue' : Array<bigint>,
  'event' : Event__1,
}
export interface EventRecordShared__1 {
  'relayQueue' : Array<Principal>,
  'notifications' : Array<bigint>,
  'notificationQueue' : Array<bigint>,
  'event' : Event__1,
}
export interface Event__1 {
  'eventId' : bigint,
  'source' : Principal,
  'data' : ICRC16__3,
  'headers' : [] | [ICRC16Map__3],
  'prevEventId' : [] | [bigint],
  'timestamp' : bigint,
  'namespace' : string,
}
export interface GenericError { 'message' : string, 'error_code' : bigint }
export type ICRC16 = { 'Int' : bigint } |
  { 'Map' : Array<[string, ICRC16]> } |
  { 'Nat' : bigint } |
  { 'Set' : Array<ICRC16> } |
  { 'Nat16' : number } |
  { 'Nat32' : number } |
  { 'Nat64' : bigint } |
  { 'Blob' : Uint8Array | number[] } |
  { 'Bool' : boolean } |
  { 'Int8' : number } |
  { 'Nat8' : number } |
  { 'Nats' : Array<bigint> } |
  { 'Text' : string } |
  { 'Bytes' : Uint8Array | number[] } |
  { 'Int16' : number } |
  { 'Int32' : number } |
  { 'Int64' : bigint } |
  { 'Option' : [] | [ICRC16] } |
  { 'Floats' : Array<number> } |
  { 'Float' : number } |
  { 'Principal' : Principal } |
  { 'Array' : Array<ICRC16> } |
  { 'ValueMap' : Array<[ICRC16, ICRC16]> } |
  { 'Class' : Array<ICRC16Property> };
export type ICRC16Map = Array<[string, ICRC16]>;
export type ICRC16MapItem = [string, ICRC16__4];
export type ICRC16Map__1 = Array<[string, ICRC16__1]>;
export type ICRC16Map__2 = Array<[string, ICRC16__2]>;
export type ICRC16Map__3 = Array<[string, ICRC16__3]>;
export type ICRC16Map__4 = Array<ICRC16MapItem>;
export interface ICRC16Property {
  'value' : ICRC16,
  'name' : string,
  'immutable' : boolean,
}
export interface ICRC16Property__1 {
  'value' : ICRC16__1,
  'name' : string,
  'immutable' : boolean,
}
export interface ICRC16Property__2 {
  'value' : ICRC16__2,
  'name' : string,
  'immutable' : boolean,
}
export interface ICRC16Property__3 {
  'value' : ICRC16__3,
  'name' : string,
  'immutable' : boolean,
}
export interface ICRC16Property__4 {
  'value' : ICRC16__4,
  'name' : string,
  'immutable' : boolean,
}
export type ICRC16__1 = { 'Int' : bigint } |
  { 'Map' : ICRC16Map__1 } |
  { 'Nat' : bigint } |
  { 'Set' : Array<ICRC16__1> } |
  { 'Nat16' : number } |
  { 'Nat32' : number } |
  { 'Nat64' : bigint } |
  { 'Blob' : Uint8Array | number[] } |
  { 'Bool' : boolean } |
  { 'Int8' : number } |
  { 'Nat8' : number } |
  { 'Nats' : Array<bigint> } |
  { 'Text' : string } |
  { 'Bytes' : Uint8Array | number[] } |
  { 'Int16' : number } |
  { 'Int32' : number } |
  { 'Int64' : bigint } |
  { 'Option' : [] | [ICRC16__1] } |
  { 'Floats' : Array<number> } |
  { 'Float' : number } |
  { 'Principal' : Principal } |
  { 'Array' : Array<ICRC16__1> } |
  { 'ValueMap' : Array<[ICRC16__1, ICRC16__1]> } |
  { 'Class' : Array<ICRC16Property__1> };
export type ICRC16__2 = { 'Int' : bigint } |
  { 'Map' : ICRC16Map__2 } |
  { 'Nat' : bigint } |
  { 'Set' : Array<ICRC16__2> } |
  { 'Nat16' : number } |
  { 'Nat32' : number } |
  { 'Nat64' : bigint } |
  { 'Blob' : Uint8Array | number[] } |
  { 'Bool' : boolean } |
  { 'Int8' : number } |
  { 'Nat8' : number } |
  { 'Nats' : Array<bigint> } |
  { 'Text' : string } |
  { 'Bytes' : Uint8Array | number[] } |
  { 'Int16' : number } |
  { 'Int32' : number } |
  { 'Int64' : bigint } |
  { 'Option' : [] | [ICRC16__2] } |
  { 'Floats' : Array<number> } |
  { 'Float' : number } |
  { 'Principal' : Principal } |
  { 'Array' : Array<ICRC16__2> } |
  { 'ValueMap' : Array<[ICRC16__2, ICRC16__2]> } |
  { 'Class' : Array<ICRC16Property__2> };
export type ICRC16__3 = { 'Int' : bigint } |
  { 'Map' : Array<[string, ICRC16__3]> } |
  { 'Nat' : bigint } |
  { 'Set' : Array<ICRC16__3> } |
  { 'Nat16' : number } |
  { 'Nat32' : number } |
  { 'Nat64' : bigint } |
  { 'Blob' : Uint8Array | number[] } |
  { 'Bool' : boolean } |
  { 'Int8' : number } |
  { 'Nat8' : number } |
  { 'Nats' : Array<bigint> } |
  { 'Text' : string } |
  { 'Bytes' : Uint8Array | number[] } |
  { 'Int16' : number } |
  { 'Int32' : number } |
  { 'Int64' : bigint } |
  { 'Option' : [] | [ICRC16__3] } |
  { 'Floats' : Array<number> } |
  { 'Float' : number } |
  { 'Principal' : Principal } |
  { 'Array' : Array<ICRC16__3> } |
  { 'ValueMap' : Array<[ICRC16__3, ICRC16__3]> } |
  { 'Class' : Array<ICRC16Property__3> };
export type ICRC16__4 = { 'Int' : bigint } |
  { 'Map' : Array<[string, ICRC16__4]> } |
  { 'Nat' : bigint } |
  { 'Set' : Array<ICRC16__4> } |
  { 'Nat16' : number } |
  { 'Nat32' : number } |
  { 'Nat64' : bigint } |
  { 'Blob' : Uint8Array | number[] } |
  { 'Bool' : boolean } |
  { 'Int8' : number } |
  { 'Nat8' : number } |
  { 'Nats' : Array<bigint> } |
  { 'Text' : string } |
  { 'Bytes' : Uint8Array | number[] } |
  { 'Int16' : number } |
  { 'Int32' : number } |
  { 'Int64' : bigint } |
  { 'Option' : [] | [ICRC16__4] } |
  { 'Floats' : Array<number> } |
  { 'Float' : number } |
  { 'Principal' : Principal } |
  { 'Array' : Array<ICRC16__4> } |
  { 'ValueMap' : Array<[ICRC16__4, ICRC16__4]> } |
  { 'Class' : Array<ICRC16Property__4> };
export interface ICRC75Item { 'principal' : Principal, 'namespace' : Namespace }
export interface InitArgs { 'name' : string }
export interface InitArgs__1 {
  'restore' : [] | [
    {
      'previousEventIDs' : Array<[string, [bigint, bigint]]>,
      'pendingEvents' : Array<EmitableEvent>,
    }
  ],
}
export interface InitArgs__2 { 'name' : string }
export interface MVEvent {
  'getHandledNotifications' : ActorMethod<
    [],
    Array<[EventNotificationRecordShared__1, EventRecordShared__1]>
  >,
  'getReceivedPublishes' : ActorMethod<[], Array<[Principal, Array<Event>]>>,
  'getRecievedConfirmations' : ActorMethod<
    [],
    Array<[Principal, Array<bigint>]>
  >,
  'getRecievedNotifications' : ActorMethod<
    [],
    Array<[Principal, Array<EventNotification>]>
  >,
  'get_stats' : ActorMethod<[], Stats>,
  'get_subnet_for_canister' : ActorMethod<
    [],
    { 'Ok' : { 'subnet_id' : [] | [Principal] } } |
      { 'Err' : string }
  >,
  'hello' : ActorMethod<[], string>,
  'icrc72_confirm_notifications' : ActorMethod<
    [Array<bigint>],
    ConfirmMessageResult
  >,
  'icrc72_handle_notification' : ActorMethod<
    [Array<EventNotification>],
    undefined
  >,
  'icrc72_publish' : ActorMethod<[Array<Event>], Array<[] | [PublishResult]>>,
  'initialize' : ActorMethod<[], undefined>,
  'simulatePublish' : ActorMethod<
    [bigint, string, bigint, Principal],
    Array<[] | [PublishResult]>
  >,
  'simulatePublisherAssignment' : ActorMethod<
    [string, bigint, Principal],
    undefined
  >,
  'simulatePublisherRemoval' : ActorMethod<
    [string, bigint, Principal],
    undefined
  >,
  'simulateRelayAssignment' : ActorMethod<
    [string, bigint, Principal],
    undefined
  >,
  'simulateRelayRemoval' : ActorMethod<[string, bigint, Principal], undefined>,
  'simulateSubscriberAssignment' : ActorMethod<
    [string, bigint, Principal],
    undefined
  >,
  'simulateSubscriberRemoval' : ActorMethod<
    [string, bigint, Principal],
    undefined
  >,
}
export type Namespace = string;
export interface PublicationRecord { 'id' : bigint, 'namespace' : string }
export interface PublicationRecordShared {
  'id' : bigint,
  'subnetIndex' : Array<[Principal, Principal]>,
  'registeredPublishers' : Array<Principal>,
  'registeredSubscribers' : Array<[Principal, SubscriberRecordShared]>,
  'stakeIndex' : Array<[StakeRecord, Principal]>,
  'registeredRelay' : Array<[Principal, [] | [Array<string>]]>,
  'namespace' : string,
  'registeredRelayer' : Array<Principal>,
}
export type PublishError = { 'GenericError' : GenericError } |
  { 'PublicationNotFound' : null } |
  { 'Unauthorized' : null };
export type PublishResult = { 'Ok' : Array<bigint> } |
  { 'Err' : PublishError };
export interface StakeRecord {
  'principal' : [] | [Principal],
  'stake' : bigint,
  'timestamp' : bigint,
}
export interface Stats {
  'tt' : Stats__3,
  'eventStore' : Array<[string, Array<[bigint, EventRecordShared]>]>,
  'icrc72Publisher' : Stats__1,
  'subscriptions' : Array<[bigint, SubscriptionRecordShared]>,
  'icrc72Subscriber' : Stats__2,
  'messageAccumulator' : Array<
    [Principal, Array<[bigint, EventNotification__2]>]
  >,
  'messageTimer' : [] | [bigint],
  'error' : [] | [string],
  'roundDelay' : [] | [bigint],
  'notificationStore' : Array<[bigint, EventNotificationRecordShared]>,
  'publications' : Array<[bigint, PublicationRecordShared]>,
  'maxMessages' : [] | [bigint],
  'relayTimer' : [] | [bigint],
  'nextNotificationId' : bigint,
  'relayAccumulator' : Array<[Principal, Array<[bigint, Event__1]>]>,
  'icrc72OrchestratorCanister' : Principal,
}
export interface Stats__1 {
  'tt' : Stats__3,
  'icrc72Subscriber' : Stats__2,
  'error' : [] | [string],
  'orchestrator' : Principal,
  'readyForPublications' : boolean,
  'eventsProcessing' : boolean,
  'previousEventIds' : Array<[string, [bigint, bigint]]>,
  'pendingEvents' : Array<EmitableEvent>,
  'broadcasters' : Array<[string, Array<Principal>]>,
  'publications' : Array<[bigint, PublicationRecord]>,
  'drainEventId' : [] | [ActionId__1],
  'icrc72OrchestratorCanister' : Principal,
}
export interface Stats__2 {
  'tt' : Stats__3,
  'subscriptions' : Array<[bigint, SubscriptionRecord]>,
  'readyForSubscription' : boolean,
  'backlogs' : Array<[bigint, Array<[bigint, EventNotification__1]>]>,
  'validBroadcasters' : { 'list' : Array<Principal> } |
    { 'icrc75' : ICRC75Item },
  'confirmTimer' : [] | [bigint],
  'icrc85' : {
    'activeActions' : bigint,
    'nextCycleActionId' : [] | [bigint],
    'lastActionReported' : [] | [bigint],
  },
  'error' : [] | [string],
  'confirmAccumulator' : Array<[Principal, Array<[bigint, bigint]>]>,
  'broadcasters' : Array<[bigint, Array<Principal>]>,
  'lastEventId' : Array<[string, Array<[bigint, bigint]>]>,
  'icrc72OrchestratorCanister' : Principal,
}
export interface Stats__3 {
  'timers' : bigint,
  'maxExecutions' : bigint,
  'minAction' : [] | [ActionDetail],
  'cycles' : bigint,
  'nextActionId' : bigint,
  'nextTimer' : [] | [TimerId],
  'expectedExecutionTime' : [] | [Time],
  'lastExecutionTime' : Time,
}
export interface SubscriberRecordShared {
  'skipTracker' : bigint,
  'skip' : [] | [[bigint, bigint]],
  'subscriptionId' : bigint,
  'filter' : [] | [string],
  'publicationId' : bigint,
  'initialConfig' : ICRC16Map__3,
  'subscriber' : Principal,
  'namespace' : string,
}
export interface SubscriptionRecord {
  'id' : bigint,
  'config' : ICRC16Map__4,
  'namespace' : string,
}
export interface SubscriptionRecordShared {
  'id' : bigint,
  'skip' : [] | [[bigint, bigint]],
  'stake' : StakeRecord,
  'filter' : [] | [string],
  'config' : ICRC16Map__3,
  'namespace' : string,
}
export type Time = bigint;
export type TimerId = bigint;
export interface _SERVICE extends MVEvent {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
