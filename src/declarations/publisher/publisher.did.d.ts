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
export interface EmitableEvent {
  'id' : bigint,
  'broadcaster' : Principal,
  'source' : Principal,
  'data' : ICRC16,
  'headers' : [] | [ICRC16Map],
  'timestamp' : bigint,
  'prevId' : [] | [bigint],
  'namespace' : string,
}
export interface EventNotification {
  'id' : bigint,
  'eventId' : bigint,
  'source' : Principal,
  'data' : ICRC16__2,
  'headers' : [] | [ICRC16Map__2],
  'prevEventId' : [] | [bigint],
  'filter' : [] | [string],
  'timestamp' : bigint,
  'namespace' : string,
}
export interface EventNotification__1 {
  'id' : bigint,
  'eventId' : bigint,
  'source' : Principal,
  'data' : ICRC16__3,
  'headers' : [] | [ICRC16Map__3],
  'prevEventId' : [] | [bigint],
  'filter' : [] | [string],
  'timestamp' : bigint,
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
export interface ICRC75Item {
  'principal' : Principal,
  'namespace' : Namespace__1,
}
export interface InitArgs {
  'restore' : [] | [
    {
      'previousEventIDs' : Array<[string, [bigint, bigint]]>,
      'pendingEvents' : Array<EmitableEvent>,
    }
  ],
}
export type Namespace = string;
export type Namespace__1 = string;
export interface NewEvent {
  'data' : ICRC16,
  'headers' : [] | [ICRC16Map],
  'namespace' : string,
}
export type PublicationDeleteError = { 'GenericError' : GenericError } |
  { 'NotFound' : null } |
  { 'Unauthorized' : null } |
  { 'GenericBatchError' : string };
export type PublicationDeleteResult = [] | [
  { 'Ok' : boolean } |
    { 'Err' : PublicationDeleteError }
];
export type PublicationIdentifier = { 'publicationId' : bigint } |
  { 'namespace' : string };
export interface PublicationRecord { 'id' : bigint, 'namespace' : string }
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
  'config' : ICRC16Map,
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
export interface Publisher {
  'getPublishErrors' : ActorMethod<[], Array<[NewEvent, PublishError]>>,
  'getPublishedEvents' : ActorMethod<
    [],
    Array<[NewEvent, [] | [PublishResult]]>
  >,
  'getUnhandledEvents' : ActorMethod<[], Array<NewEvent>>,
  'get_stats' : ActorMethod<[], Stats>,
  'get_subnet_for_canister' : ActorMethod<
    [],
    { 'Ok' : { 'subnet_id' : [] | [Principal] } } |
      { 'Err' : string }
  >,
  'hello' : ActorMethod<[], string>,
  'icrc72_handle_notification' : ActorMethod<
    [Array<EventNotification>],
    undefined
  >,
  'registerSamplePublication' : ActorMethod<
    [Array<PublicationRegistration>],
    Array<PublicationRegisterResult>
  >,
  'simulateBroadcastAssignment' : ActorMethod<[string, Principal], undefined>,
  'simulateBroadcastAssignmentEvent' : ActorMethod<
    [string, Principal],
    undefined
  >,
  'simulateBroadcastRemoval' : ActorMethod<[string, Principal], undefined>,
  'simulateBroadcastRemovalEvent' : ActorMethod<[string, Principal], undefined>,
  'simulateDeletePublication' : ActorMethod<[string], PublicationDeleteResult>,
  'simulatePublicationCreation' : ActorMethod<
    [],
    Array<PublicationRegisterResult>
  >,
  'simulatePublish' : ActorMethod<[Array<NewEvent>], Array<[] | [bigint]>>,
  'simulatePublishAsync' : ActorMethod<[Array<NewEvent>], Array<[] | [bigint]>>,
  'simulatePublishWithHandler' : ActorMethod<
    [Array<NewEvent>],
    Array<[] | [bigint]>
  >,
  'simulateUpdatePublication' : ActorMethod<
    [Array<PublicationUpdateRequest>],
    Array<PublicationUpdateResult>
  >,
}
export interface Stats {
  'tt' : Stats__2,
  'icrc72Subscriber' : Stats__1,
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
export interface Stats__1 {
  'tt' : Stats__2,
  'subscriptions' : Array<[bigint, SubscriptionRecord]>,
  'readyForSubscription' : boolean,
  'backlogs' : Array<[bigint, Array<[bigint, EventNotification__1]>]>,
  'validBroadcasters' : { 'list' : Array<Principal> } |
    { 'icrc75' : ICRC75Item },
  'confirmTimer' : [] | [bigint],
  'error' : [] | [string],
  'confirmAccumulator' : Array<[Principal, Array<bigint>]>,
  'broadcasters' : Array<[bigint, Array<Principal>]>,
  'lastEventId' : Array<[string, Array<[bigint, bigint]>]>,
  'icrc72OrchestratorCanister' : Principal,
}
export interface Stats__2 {
  'timers' : bigint,
  'maxExecutions' : bigint,
  'minAction' : [] | [ActionDetail],
  'cycles' : bigint,
  'nextActionId' : bigint,
  'nextTimer' : [] | [TimerId],
  'expectedExecutionTime' : [] | [Time],
  'lastExecutionTime' : Time,
}
export interface SubscriptionRecord {
  'id' : bigint,
  'config' : ICRC16Map__3,
  'namespace' : string,
}
export type Time = bigint;
export type TimerId = bigint;
export interface _SERVICE extends Publisher {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
