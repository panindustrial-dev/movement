import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Action {
  'aSync' : [] | [bigint],
  'actionType' : string,
  'params' : Uint8Array | number[],
  'retries' : bigint,
}
export interface ActionId { 'id' : bigint, 'time' : Time }
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
export interface BroadcasterInfo { 'broadcaster' : Principal, 'stats' : Stats }
export type ConfirmMessageItemResult = { 'Ok' : bigint } |
  { 'Err' : GenericError__1 };
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
  'data' : ICRC16__2,
  'headers' : [] | [ICRC16Map__2],
  'prevEventId' : [] | [bigint],
  'timestamp' : bigint,
  'namespace' : string,
}
export interface EventNotification {
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
export interface GenericError { 'message' : string, 'error_code' : bigint }
export interface GenericError__1 { 'message' : string, 'error_code' : bigint }
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
export type ICRC16Map__1 = Array<[string, ICRC16__1]>;
export type ICRC16Map__2 = Array<[string, ICRC16__2]>;
export type ICRC16Map__3 = Array<[string, ICRC16__3]>;
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
  { 'Map' : ICRC16Map__3 } |
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
export interface ICRC75Item { 'principal' : Principal, 'namespace' : Namespace }
export interface InitArgs { 'name' : string }
export interface InitArgs__1 { 'name' : string }
export interface InitArgs__2 {
  'restore' : [] | [
    {
      'previousEventIDs' : Array<[string, [bigint, bigint]]>,
      'pendingEvents' : Array<EmitableEvent>,
    }
  ],
}
export interface InitArgs__3 { 'name' : string }
export interface MVEvent {
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
  'icrc72_get_broadcasters' : ActorMethod<
    [
      {
        'prev' : [] | [Principal],
        'take' : [] | [bigint],
        'filter' : [] | [OrchestrationFilter],
      },
    ],
    Array<BroadcasterInfo>
  >,
  'icrc72_get_publications' : ActorMethod<
    [
      {
        'prev' : [] | [string],
        'take' : [] | [bigint],
        'filter' : [] | [OrchestrationFilter],
      },
    ],
    Array<PublicationInfo>
  >,
  'icrc72_get_publishers' : ActorMethod<
    [
      {
        'prev' : [] | [Principal],
        'take' : [] | [bigint],
        'filter' : [] | [OrchestrationFilter],
      },
    ],
    Array<PublisherInfo>
  >,
  'icrc72_get_subscribers' : ActorMethod<
    [
      {
        'prev' : [] | [Principal],
        'take' : [] | [bigint],
        'filter' : [] | [OrchestrationFilter],
      },
    ],
    Array<SubscriberInfo>
  >,
  'icrc72_get_subscriptions' : ActorMethod<
    [
      {
        'prev' : [] | [string],
        'take' : [] | [bigint],
        'filter' : [] | [OrchestrationFilter],
      },
    ],
    Array<SubscriptionInfo>
  >,
  'icrc72_get_valid_broadcaster' : ActorMethod<[], ValidBroadcastersResponse>,
  'icrc72_handle_notification' : ActorMethod<
    [Array<EventNotification>],
    undefined
  >,
  'icrc72_publish' : ActorMethod<[Array<Event>], Array<[] | [PublishResult]>>,
  'icrc72_register_publication' : ActorMethod<
    [Array<PublicationRegistration>],
    Array<PublicationRegisterResult>
  >,
  'icrc72_register_subscription' : ActorMethod<
    [Array<SubscriptionRegistration>],
    Array<SubscriptionRegisterResult>
  >,
  'icrc72_update_publication' : ActorMethod<
    [Array<PublicationUpdateRequest>],
    Array<PublicationUpdateResult>
  >,
  'icrc72_update_subscription' : ActorMethod<
    [Array<SubscriptionUpdateRequest>],
    Array<SubscriptionUpdateResult>
  >,
  'init' : ActorMethod<[], undefined>,
}
export type Namespace = string;
export interface OrchestrationFilter {
  'slice' : Array<OrchestrationQuerySlice>,
  'statistics' : StatisticsFilter,
}
export type OrchestrationQuerySlice = { 'ByBroadcaster' : Principal } |
  { 'ByPublisher' : Principal } |
  { 'ByNamespace' : string } |
  { 'BySubscriber' : Principal };
export type PublicationIdentifier = { 'publicationId' : bigint } |
  { 'namespace' : string };
export interface PublicationInfo {
  'stats' : Stats,
  'publicationId' : bigint,
  'config' : ICRC16Map__1,
  'namespace' : string,
}
export type PublicationRegisterError = { 'GenericError' : GenericError } |
  { 'ImproperConfig' : string } |
  { 'UnauthorizedPublisher' : { 'namespace' : Namespace } } |
  { 'Unauthorized' : null } |
  { 'GenericBatchError' : string } |
  { 'Exists' : bigint };
export type PublicationRegisterResult = [] | [
  { 'Ok' : bigint } |
    { 'Err' : PublicationRegisterError }
];
export interface PublicationRegistration {
  'memo' : [] | [Uint8Array | number[]],
  'config' : ICRC16Map__1,
  'namespace' : string,
}
export type PublicationUpdateError = { 'GenericError' : GenericError } |
  { 'ImproperConfig' : string } |
  { 'NotFound' : null } |
  { 'Unauthorized' : null } |
  { 'GenericBatchError' : string };
export interface PublicationUpdateRequest {
  'memo' : [] | [Uint8Array | number[]],
  'config' : [string, ICRC16__1],
  'publication' : PublicationIdentifier,
}
export type PublicationUpdateResult = [] | [
  { 'Ok' : boolean } |
    { 'Err' : PublicationUpdateError }
];
export type PublishError = { 'GenericError' : GenericError__1 } |
  { 'PublicationNotFound' : null } |
  { 'Unauthorized' : null };
export type PublishResult = { 'Ok' : Array<bigint> } |
  { 'Err' : PublishError };
export interface PublisherInfo { 'publisher' : Principal, 'stats' : Stats }
export type StatisticsFilter = [] | [[] | [Array<string>]];
export type Stats = Array<[string, ICRC16__1]>;
export interface SubscriberInfo {
  'subscriptions' : [] | [Array<bigint>],
  'stats' : Stats,
  'config' : ICRC16Map__1,
  'subscriber' : Principal,
}
export interface SubscriptionInfo {
  'subscriptionId' : bigint,
  'stats' : Stats,
  'config' : ICRC16Map__1,
  'namespace' : string,
}
export type SubscriptionRegisterError = { 'GenericError' : GenericError } |
  { 'PublicationNotFound' : null } |
  { 'ImproperConfig' : string } |
  { 'Unauthorized' : null } |
  { 'GenericBatchError' : string } |
  { 'Exists' : bigint };
export type SubscriptionRegisterResult = [] | [
  { 'Ok' : bigint } |
    { 'Err' : SubscriptionRegisterError }
];
export interface SubscriptionRegistration {
  'memo' : [] | [Uint8Array | number[]],
  'config' : ICRC16Map__1,
  'namespace' : string,
}
export type SubscriptionUpdateError = { 'GenericError' : GenericError } |
  { 'ImproperConfig' : string } |
  { 'NotFound' : null } |
  { 'Unauthorized' : null } |
  { 'GenericBatchError' : string };
export interface SubscriptionUpdateRequest {
  'subscription' : { 'id' : bigint } |
    { 'namespace' : string },
  'memo' : [] | [Uint8Array | number[]],
  'config' : [string, ICRC16__1],
  'subscriber' : [] | [Principal],
}
export type SubscriptionUpdateResult = [] | [
  { 'Ok' : boolean } |
    { 'Err' : SubscriptionUpdateError }
];
export type Time = bigint;
export type ValidBroadcastersResponse = { 'list' : Array<Principal> } |
  { 'icrc75' : ICRC75Item };
export interface _SERVICE extends MVEvent {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
