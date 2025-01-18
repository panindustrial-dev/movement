import { Principal } from "@dfinity/principal";
import type { Identity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';

import { IDL } from "@dfinity/candid";

import {
  PocketIc,
  createIdentity,
  FromPathSubnetStateConfig,
  SubnetStateType
} from "@hadronous/pic";

import type {
  Actor,
  CanisterFixture,
  DeferredActor
} from "@hadronous/pic";

import {idlFactory as orchestratorIDLFactory,
  init as orchestratorInit } from "../../src/declarations/orchestrator/orchestrator.did.js";
import type {
  PublicationUpdateRequest,
  _SERVICE as OrchService,
  PublicationDeleteRequest,
  PublicationRegisterResult,
  
  SubscriptionRegistration} from "../../src/declarations/orchestrator/orchestrator.did.d";
export const orch_WASM_PATH = ".dfx/local/canisters/orchestrator/orchestrator.wasm.gz"; 

import {idlFactory as mockIDLFactory,
  init as mockInit } from "../../src/declarations/orchestratorMock/orchestratorMock.did.js";
import type {
  _SERVICE as MockService,} from "../../src/declarations/orchestratorMock/orchestratorMock.did.d";
import { get } from "http";
import { ICRC16Map, EventNotification, PublicationRegistration } from "../../src/declarations/orchestrator/orchestrator.did.js";
import * as exp from "constants";
import { register } from "module";
import { SubscriptionUpdateRequest } from "../../src/declarations/example/example.did.js";
import { subscriber } from "../../src/declarations/subscriber/index.js";
import { orchestrator } from "../../src/declarations/orchestrator/index.js";
export const orchestrator_WASM_PATH = ".dfx/local/canisters/orchestrator/orchestrator.wasm.gz"; 
export const mock_WASM_PATH = ".dfx/local/canisters/orchestratorMock/orchestratorMock.wasm.gz"; 



const admin = createIdentity("admin");
const alice = createIdentity("alice");
const bob = createIdentity("bob");
const serviceProvider = createIdentity("serviceProvider");

const minterPublicKey = 'Uu8wv55BKmk9ZErr6OIt5XR1kpEGXcOSOC1OYzrAwuk=';
const minterPrivateKey =
  'N3HB8Hh2PrWqhWH2Qqgr1vbU9T3gb1zgdBD8ZOdlQnVS7zC/nkEqaT1kSuvo4i3ldHWSkQZdw5I4LU5jOsDC6Q==';

/* const base64ToUInt8Array = (base64String: string): Uint8Array => {
  return Buffer.from(base64String, 'base64');
}; */

/* const minterIdentity = Ed25519KeyIdentity.fromKeyPair(
  base64ToUInt8Array(minterPublicKey).buffer,
  base64ToUInt8Array(minterPrivateKey).buffer,
); */


let pic: PocketIc;
let orchestrator_fixture: CanisterFixture<OrchService>;
let deferredOrchestratorActor: DeferredActor<OrchService>;
let mock_fixture: CanisterFixture<MockService>;

const getTimeNanos = async () => {
  return BigInt(Math.floor(((await pic.getTime()) * 1_000_000)));
};

function dataItemStringify(key: string, value: any) {
  if (typeof value === 'bigint') {
    return value.toString();
  } else if (key === 'Blob' && value instanceof Uint8Array) {
    return Array.from(value).map(byte => byte.toString(16).padStart(2, '0')).join('');
  } else if (key === 'Principal' && value instanceof Object) {
    return value.__principal__;
  } else {
    return value;
  }
};

async function registerPublication(identity: Identity): Promise<PublicationRegisterResult[]> {
  let pubResult = await orchestrator_fixture.actor.icrc72_register_publication([
    {
      namespace: "com.example.app.events",
      config: [
        ["icrc72:publication:publishers:allowed:list", {
          "Array": [
            { "Blob": new Uint8Array(Principal.fromText(identity.getPrincipal().toText()).toUint8Array()) }
          ]
        }],
        ["icrc72:publication:mode", {
          "Text": "fifo"
        }]
      ],
      memo: []
    }]);
  return pubResult;
};

describe("test orchestrator subscriptions", () => {


  async function setUpOrchestrator(scenario: string) {
    console.log("setting up canisters");

    mock_fixture = await pic.setupCanister<MockService>({
      sender: admin.getPrincipal(),
      idlFactory: mockIDLFactory,
      wasm: mock_WASM_PATH,
      arg: IDL.encode(mockInit({IDL}), []),
    });

    console.log("set up orchestrator_fixture", mock_fixture.canisterId, mock_fixture.actor);

    let result = await mock_fixture.actor.setIdentity(admin);
    let result2 = await mock_fixture.actor.set_scenario(scenario);

    orchestrator_fixture = await pic.setupCanister<OrchService>({
      //targetCanisterId: Principal.fromText("q26le-iqaaa-aaaam-actsa-cai"),
      sender: admin.getPrincipal(),
      idlFactory: orchestratorIDLFactory,
      wasm: orchestrator_WASM_PATH,
      //targetSubnetId: subnets[0].id,
      arg: IDL.encode(orchestratorInit({IDL}), [[{
        icrc72OrchestratorArgs: [],
        icrc72SubscriberArgs: [],
        icrc72PublisherArgs: [],
        ttArgs: [],
      }]]),
    });

    console.log("set up orchestrator", orchestrator_fixture.canisterId);

    console.log("orch_fixture", orchestrator_fixture);

    deferredOrchestratorActor = await pic.createDeferredActor(orchestratorIDLFactory, orchestrator_fixture.canisterId)

    await orchestrator_fixture.actor.setIdentity(admin);

    //let registerBroadcaster = await orchestrator_fixture.actor.registerBroadcaster({
  };


  

  beforeEach(async () => {

    pic = await PocketIc.create(process.env.PIC_URL, {
      /*  nns: {
        state: {
          type: SubnetStateType.FromPath,
          path: NNS_STATE_PATH,
          subnetId: Principal.fromText(NNS_SUBNET_ID),
        }
      }, 
      ii: {
        state: {
          type: SubnetStateType.New
        }
      } ,*/
      processingTimeoutMs: 1000 * 120 * 5,
    } );

    

  });


  afterEach(async () => {
   /*  if (childProcess) {
      // Terminate the spawned process
      childProcess.kill('SIGTERM');
    } */
    await pic.tearDown();
  });

  

  

  // Subscription Registration Tests
  it('should register a subscription successfully', async function testRegisterSubscription_Success() {
    // Arrange: Set up Orchestrator with the default scenario
    await setUpOrchestrator("defaultOrchestrator");

    await pic.tick(5);
    await pic.advanceTime(60_000); // Advance time by 60 seconds

    // Create the publication
    orchestrator_fixture.actor.setIdentity(admin);
    let pubResult = await registerPublication(admin);

    await pic.tick(5);
    await pic.advanceTime(60_000); 

    // Define a valid SubscriptionRegistration object
    const subscriptionRegistration: SubscriptionRegistration = {
      namespace: "com.example.app.events",
      config: [
        ["icrc72:subscription:filter", { "Text": "host == 'John'" }],
        ["icrc72:subscription:skip", { "Array": [{Nat: 5n}, {Nat: 1n}] }]
      ],
      memo: []
    };

    // Act: Call the register_subscription method
    const result = await orchestrator_fixture.actor.icrc72_register_subscription([subscriptionRegistration]);

    // Assert: Verify that the subscription is registered successfully
    expect(result).toBeDefined();
    expect(result.length).toBe(1);
    expect(result[0]).toBeDefined();
    console.log("result", JSON.stringify(result, dataItemStringify,2));
    if (result[0][0] && 'Ok' in result[0][0]) {
      expect(result[0][0].Ok).toBeGreaterThan(0);
    } else {
      throw(`Expected Ok but got Err: ${JSON.stringify(result[0], dataItemStringify,2)}`);
    }

    // Optionally, verify that the subscription is stored correctly in Orchestrator's state
    const stats = await orchestrator_fixture.actor.get_stats();
    expect(stats).toBeDefined();
    console.log("stats", JSON.stringify(stats, dataItemStringify,2));
    expect(stats.subscriptions.length).toEqual(3);
    expect(stats.subscriptions[2][1].namespace).toEqual("com.example.app.events");

    
  });

  it('should fail to register a subscription with no publication', async function testRegisterSubscription_InvalidConfig() {
     // Arrange: Set up the Orchestrator with the default scenario without any publications
     await setUpOrchestrator("defaultOrchestrator");

     // Define a SubscriptionRegistration object with a non-existing namespace
     const subscriptionRegistration: SubscriptionRegistration = {
       namespace: "com.example.nonexistent.events", // This namespace has no corresponding publication
       config: [
         ["icrc72:subscription:filter", { "Text": "host == 'Alice'" }], // Example filter
         ["icrc72:subscription:skip", { "Array": [{ Nat: 10n }, { Nat: 5n }] }] // Example skip pattern
       ],
       memo: []
     };
 
     // Act: Attempt to register the subscription
     const result = await orchestrator_fixture.actor.icrc72_register_subscription([subscriptionRegistration]);
 
     // Assert: Verify that the subscription registration fails with a PublicationNotFound error
     expect(result).toBeDefined();
     expect(result.length).toBe(1);
     expect(result[0][0]).toBeDefined();

     console.log("result", JSON.stringify(result, dataItemStringify,2));
 
     // Check if the result contains an error
     if (result.length > 0 && result[0] && result[0][0] && 'Err' in result[0][0]) {
      
       expect(result[0][0]?.Err).toEqual({
         "PublicationNotFound": null
       });
     } else {
       throw new Error(`Expected Err but got Ok: ${JSON.stringify(result[0], dataItemStringify, 2)}`);
     }
  });

  it('should prevent unauthorized callers from registering subscriptions', async function testRegisterSubscription_Unauthorized() {
    // Arrange: Set up Orchestrator with the default scenario
    await setUpOrchestrator("defaultOrchestrator");
    // Create the publication
    orchestrator_fixture.actor.setIdentity(admin);
    let pubResult = await orchestrator_fixture.actor.icrc72_register_publication([
      {
        namespace: "com.example.app.events",
        config: [
          ["icrc72:publication:subscribers:allowed:list", {
            "Array": [
              { "Blob": new Uint8Array(Principal.fromText(admin.getPrincipal().toText()).toUint8Array()) }
            ]
          }],
          ["icrc72:publication:mode", {
            "Text": "fifo"
          }]
        ],
        memo: []
      }]);

    // Act: Change the orchestrator's identity to an unauthorized principal (e.g., Alice)
    await orchestrator_fixture.actor.setIdentity(alice);

    // Define a valid SubscriptionRegistration object
    const subscriptionRegistration: SubscriptionRegistration = {
      namespace: "com.example.app.events",
      config: [
        ["icrc72:subscription:filter", { "Text": "host == 'John'" }],
        ["icrc72:subscription:skip", { "Array": [{Nat: 5n}, {Nat: 1n}] }]
      ],
      memo: []
    };

    // Act: Attempt to register the subscription
    const result = await orchestrator_fixture.actor.icrc72_register_subscription([subscriptionRegistration]);

    // Assert: Verify that the registration was denied with an Unauthorized error
    expect(result).toBeDefined();
    expect(result.length).toBe(1);
    expect(result[0]).toBeDefined();

    if (result[0][0] && 'Err' in result[0][0]) {
      expect(result[0][0].Err).toBeDefined();
      expect(result[0][0].Err).toEqual({
        "Unauthorized": null
      });
    } else {
      throw new Error(`Expected Err but got Ok: ${JSON.stringify(result[0], dataItemStringify, 2)}`);
    }
  });

  it('should handle duplicate subscription registrations correctly', async function testRegisterSubscription_Duplicate() {
    // Arrange: Set up Orchestrator with the default scenario and register a subscription
    await setUpOrchestrator("defaultOrchestrator");

    // Act: Ensure the orchestrator identity is set to admin
    await orchestrator_fixture.actor.setIdentity(admin);
    let pubResult = await registerPublication(admin);

    // Define a valid SubscriptionRegistration object
    const subscriptionRegistration: SubscriptionRegistration = {
      namespace: "com.example.app.events",
      config: [
        ["icrc72:subscription:filter", { "Text": "host == 'Alice'" }],
        ["icrc72:subscription:skip", { "Array": [{Nat: 10n}, {Nat: 2n}] }]
      ],
      memo: []
    };

    // Act: Register the subscription for the first time
    const firstResult = await orchestrator_fixture.actor.icrc72_register_subscription([subscriptionRegistration]);

    // Assert: Verify successful registration
    expect(firstResult).toBeDefined();
    expect(firstResult.length).toBe(1);
    expect(firstResult[0]).toBeDefined();

    if (firstResult[0][0] && 'Ok' in firstResult[0][0]) {
      expect(firstResult[0][0].Ok).toEqual(0n);
    } else {
      throw new Error(`Expected Ok but got Err: ${JSON.stringify(firstResult[0], dataItemStringify, 2)}`);
    }

    // Act: Attempt to register the same subscription again (duplicate registration)
    const duplicateResult = await orchestrator_fixture.actor.icrc72_register_subscription([subscriptionRegistration]);

    // Assert: Verify that the system handles the duplicate appropriately
    expect(duplicateResult).toBeDefined();
    expect(duplicateResult.length).toBe(1);
    expect(duplicateResult[0]).toBeDefined();

    if (duplicateResult[0][0] && 'Ok' in duplicateResult[0][0]) {
      expect(duplicateResult[0][0].Ok).toBeDefined();
      expect(duplicateResult[0][0].Ok).toEqual(0n);
    } else {
      throw new Error(`Expected Err due to duplicate registration but got Ok: ${JSON.stringify(duplicateResult[0], dataItemStringify, 2)}`);
    }
  });

  

  // Multiple Subscription Registrations
  it('should register multiple subscriptions successfully', async function testRegisterMultipleSubscriptions_Success() {
    // Arrange: Set up Orchestrator with the default scenario
    await setUpOrchestrator("defaultOrchestrator");

    // Act: Ensure the orchestrator identity is set to admin
    await orchestrator_fixture.actor.setIdentity(admin);

    await orchestrator_fixture.actor.icrc72_register_publication(
       [
        {
          namespace: "com.example.app.events",
          config: [
            ["icrc72:publication:publishers:allowed:list", {
              "Array": [
                { "Blob": new Uint8Array(Principal.fromText(admin.getPrincipal().toText()).toUint8Array()) }
              ]
            }],
            ["icrc72:publication:mode", {
              "Text": "fifo"
            }]
          ],
          memo: []
        },
        
        {
          namespace: "com.example.app.notifications",
          config: [
            ["icrc72:publication:publishers:allowed:list", {
              "Array": [
                { "Blob": new Uint8Array(Principal.fromText(admin.getPrincipal().toText()).toUint8Array()) }
              ]
            }],
            ["icrc72:publication:mode", {
              "Text": "priority"
            }]
          ],
          memo: []
        },
        {
          namespace: "com.example.app.transactions",
          config: [
            ["icrc72:publication:publishers:allowed:list", {
              "Array": [
                { "Blob": new Uint8Array(Principal.fromText(admin.getPrincipal().toText()).toUint8Array()) }
              ]
            }],
            ["icrc72:publication:mode", {
              "Text": "priority"
            }]
          ],
          memo: []
        }
      ]);

    // Define multiple valid SubscriptionRegistration objects
    const subscriptionRegistrations: SubscriptionRegistration[] = [
      {
        namespace: "com.example.app.events",
        config: [
          ["icrc72:subscription:filter", { "Text": "type == 'login'" }],
          ["icrc72:subscription:skip", { "Array": [{Nat: 3n}, {Nat: 0n}] }]
        ],
        memo: []
      },
      {
        namespace: "com.example.app.notifications",
        config: [
          ["icrc72:subscription:filter", { "Text": "alert == true" }],
          ["icrc72:subscription:skip", { "Array": [{Nat: 1n}, {Nat: 0n}] }]
        ],
        memo: []
      },
      {
        namespace: "com.example.app.transactions",
        config: [
          ["icrc72:subscription:filter", { "Text": "amount > 1000" }],
          ["icrc72:subscription:skip", { "Array": [{Nat: 2n}, {Nat: 1n}] }]
        ],
        memo: []
      }
    ];

    // Act: Register multiple subscriptions
    const results = await orchestrator_fixture.actor.icrc72_register_subscription(subscriptionRegistrations);

    // Assert: Verify that all subscriptions are registered successfully
    expect(results).toBeDefined();
    expect(results.length).toBe(subscriptionRegistrations.length);

    results.forEach((result, index) => {
      expect(result).toBeDefined();
      if (result[0] && 'Ok' in result[0]) {
        expect(result[0].Ok).toBeGreaterThanOrEqual(0n);
      } else {
        throw new Error(`Expected Ok for subscription ${index + 1} but got Err: ${JSON.stringify(result, dataItemStringify, 2)}`);
      }
    });
  });

  it('should handle duplicate entries when registering multiple subscriptions', async function testRegisterMultipleSubscriptions_WithDuplicates() {
    // Arrange: Set up Orchestrator with the default scenario
    await setUpOrchestrator("defaultOrchestrator");

    // Act: Ensure the orchestrator identity is set to admin
    await orchestrator_fixture.actor.setIdentity(admin);

    await orchestrator_fixture.actor.icrc72_register_publication(
      [
       {
         namespace: "com.example.app.events",
         config: [
           ["icrc72:publication:publishers:allowed:list", {
             "Array": [
               { "Blob": new Uint8Array(Principal.fromText(admin.getPrincipal().toText()).toUint8Array()) }
             ]
           }],
           ["icrc72:publication:mode", {
             "Text": "fifo"
           }]
         ],
         memo: []
       },
       
       {
         namespace: "com.example.app.alerts",
         config: [
           ["icrc72:publication:publishers:allowed:list", {
             "Array": [
               { "Blob": new Uint8Array(Principal.fromText(admin.getPrincipal().toText()).toUint8Array()) }
             ]
           }],
           ["icrc72:publication:mode", {
             "Text": "priority"
           }]
         ],
         memo: []
       },
     ]);

     await pic.tick(5);

    // Define multiple SubscriptionRegistration objects, including duplicates
    const subscriptionRegistrations: SubscriptionRegistration[] = [
      {
        namespace: "com.example.app.events",
        config: [
          ["icrc72:subscription:filter", { "Text": "type == 'purchase'" }],
          ["icrc72:subscription:skip", { "Array": [{Nat: 4n}, {Nat: 1n}] }]
        ],
        memo: []
      },
      {
        namespace: "com.example.app.events", // Duplicate namespace and config
        config: [
          ["icrc72:subscription:filter", { "Text": "type == 'purchase'" }],
          ["icrc72:subscription:skip", { "Array": [{Nat: 4n}, {Nat: 1n}] }]
        ],
        memo: []
      },
      {
        namespace: "com.example.app.alerts",
        config: [
          ["icrc72:subscription:filter", { "Text": "level == 'critical'" }],
          ["icrc72:subscription:skip", { "Array": [{Nat: 1n}, {Nat: 0n}] }]
        ],
        memo: []
      },
      {
        namespace: "com.example.app.alerts", // Duplicate namespace with different config
        config: [
          ["icrc72:subscription:filter", { "Text": "level == 'high'" }],
          ["icrc72:subscription:skip", { "Array": [{Nat: 2n}, {Nat: 1n}] }]
        ],
        memo: []
      }
    ];

    // Act: Attempt to register multiple subscriptions with duplicates
    const results = await orchestrator_fixture.actor.icrc72_register_subscription(subscriptionRegistrations);

    // Assert: Verify that duplicates are handled correctly
    expect(results).toBeDefined();
    expect(results.length).toBe(subscriptionRegistrations.length);

    // First registration entries should succeed
    if (results[0][0] && 'Ok' in results[0][0]) {
      expect(results[0][0].Ok).toBeGreaterThanOrEqual(0);
    } else {
      throw new Error(`Expected Ok but got Err: ${JSON.stringify(results[0][0])}`);
    }
    if (results[2][0] && 'Ok' in results[2][0]) {
      expect(results[2][0].Ok).toBeGreaterThanOrEqual(0);
    } else {
      throw new Error(`Expected Ok but got Err: ${JSON.stringify(results[2][0])}`);
    }

    // Duplicate entries should fail
    expect(results[1][0]).toBeDefined();
    if (results[1][0]) {
      if ('Err' in results[1][0]) {
        expect(results[1][0].Err).toBeDefined();
      }
    }
    if (results[1][0] && 'Err' in results[1][0]) {
      expect(results[1][0].Err).toEqual({
        "DuplicateSubscription": {
          "subscriptionId": expect.any(Number)
        }
      });
    }

    // Duplicate namespace entries should fail even if object different
    expect(results[3][0]).toBeDefined();
    if (results[3][0]) {
      if ('Err' in results[3][0]) {
        expect(results[3][0].Err).toBeDefined();
      }
    }
    if (results[3][0] && 'Err' in results[3][0]) {
      expect(results[3][0].Err).toEqual({
        "DuplicateSubscription": {
          "subscriptionId": expect.any(Number)
        }
      });
    }
  });

  // Subscription Update Tests
  it('should update a subscription successfully', async function testUpdateSubscription_Success() {
    // Arrange: Set up Orchestrator with the default scenario
    await setUpOrchestrator("defaultOrchestrator");

    orchestrator_fixture.actor.setIdentity(admin);

    // Register a publication first to associate the subscription
    const publicationRegistration: PublicationRegistration = {
      namespace: "com.example.events",
      config: [
        ["icrc72:publication:publishers:allowed:list", {
          "Array": [
            { "Blob": new Uint8Array(Principal.fromText(admin.getPrincipal().toText()).toUint8Array()) }
          ]
        }],
        ["icrc72:publication:mode", {
          "Text": "fifo"
        }]
      ],
      memo: []
    };

    const publicationResult = await orchestrator_fixture.actor.icrc72_register_publication([publicationRegistration]);

    // Assert: Verify publication registration was successful
    expect(publicationResult).toBeDefined();
    expect(publicationResult.length).toBe(1);
    expect(publicationResult[0]).toBeDefined();
    if (publicationResult[0][0] && 'Ok' in publicationResult[0][0]) {
      expect(publicationResult[0][0].Ok).toBeGreaterThan(0);
    } else {
      throw(`Expected Ok but got Err: ${JSON.stringify(publicationResult[0], dataItemStringify, 2)}`);
    }
    const publicationId = publicationResult[0][0]?.Ok;

    // Register a subscription for the publication
    const subscriptionRegistration: SubscriptionRegistration = {
      namespace: "com.example.events",
      config: [
        ["icrc72:subscription:filter", { "Text": "host == 'John'" }],
        ["icrc72:subscription:skip", { "Array": [{ Nat: 5n }, { Nat: 1n }] }]
      ],
      memo: []
    };

    const subscriptionResult = await orchestrator_fixture.actor.icrc72_register_subscription([subscriptionRegistration]);

    // Assert: Verify subscription registration was successful
    expect(subscriptionResult).toBeDefined();
    expect(subscriptionResult.length).toBe(1);
    expect(subscriptionResult[0]).toBeDefined();
    if (subscriptionResult[0][0] && 'Ok' in subscriptionResult[0][0]) {
      expect(subscriptionResult[0][0].Ok).toEqual(0n);
    } else {
      throw(`Expected Ok sub result but got Err: ${JSON.stringify(subscriptionResult[0], dataItemStringify, 2)}`);
    }
    const subscriptionId = subscriptionResult[0][0]?.Ok;

    // Define a SubscriptionUpdateRequest to update the subscription's filter
    const subscriptionUpdateRequest: any = [{  // Replace 'any' with the correct type if available
      subscription: { id: subscriptionId },
      config: 
        ["icrc72:subscription:filter:update", { "Text": "host == 'Jane'" }],
        
      subscriber: [admin.getPrincipal()],
      memo: []
    },
    {  // Replace 'any' with the correct type if available
      subscription: { id: subscriptionId },
      config: 
      ["icrc72:subscription:skip:update", { "Array": [{ Nat: 10n }, { Nat: 2n }] }],
      subscriber: [admin.getPrincipal()],
      memo: []
    }];

    // Act: Perform the subscription update
    const updateResult = await orchestrator_fixture.actor.icrc72_update_subscription(subscriptionUpdateRequest);

    console.log("updateResult", updateResult);

    // Assert: Verify the update was successful
    expect(updateResult).toBeDefined();
    expect(updateResult.length).toBe(2);
    expect(updateResult[0]).toBeDefined();
    if (updateResult[0][0] && 'Ok' in updateResult[0][0]) {
      expect(updateResult[0][0].Ok).toBe(true);
    } else {
      throw(`Expected Ok update result but got Err: ${JSON.stringify(updateResult[0][0], dataItemStringify, 2)}`);
    }
    if (updateResult[1][0] && 'Ok' in updateResult[1][0]) {
      expect(updateResult[1][0].Ok).toBe(true);
    } else {
      throw(`Expected Ok but got Err: ${JSON.stringify(updateResult[0][0], dataItemStringify, 2)}`);
    }

    // Verify that the subscription was updated in the Orchestrator's state
    const orchestratorState = await orchestrator_fixture.actor.get_stats();
    const updatedSubscription = orchestratorState.subscriptions.find(sub => sub[0] === subscriptionId);

    const subscription = orchestratorState.subscriptions.find(sub => sub[0] === subscriptionId);
    
    const existingSubscriber = subscription ? subscription[1]?.subscribers.find(sub => sub[0].toText() === admin.getPrincipal().toText()) : undefined;


    expect(existingSubscriber).toBeDefined();
    if (existingSubscriber) {
      expect(existingSubscriber[1].filter).toEqual(["host == 'Jane'"]);
      expect(existingSubscriber[1].skip).toEqual([[10n,2n ]]);
    }
  });

  it('should not update a subscription with invalid data', async function testUpdateSubscription_InvalidUpdate() {
    // Arrange: Set up Orchestrator with the default scenario
    await setUpOrchestrator("defaultOrchestrator");

    // Register a publication first to associate the subscription
    const publicationRegistration: PublicationRegistration = {
      namespace: "com.example.events",
      config: [
        ["icrc72:publication:publishers:allowed:list", {
          "Array": [
            { "Blob": new Uint8Array(Principal.fromText(admin.getPrincipal().toText()).toUint8Array()) }
          ]
        }],
        ["icrc72:publication:mode", {
          "Text": "fifo"
        }]
      ],
      memo: []
    };

    const publicationResult = await orchestrator_fixture.actor.icrc72_register_publication([publicationRegistration]);

    // Assert: Verify publication registration was successful
    expect(publicationResult).toBeDefined();
    expect(publicationResult.length).toBe(1);
    expect(publicationResult[0]).toBeDefined();
    if (publicationResult[0][0] && 'Ok' in publicationResult[0][0]) {
      expect(publicationResult[0][0].Ok).toEqual(1n);
    } else {
      throw(`Expected Ok but got Err: ${JSON.stringify(publicationResult[0], dataItemStringify, 2)}`);
    }
    const publicationId = publicationResult[0][0]?.Ok;

    // Register a subscription for the publication
    const subscriptionRegistration: SubscriptionRegistration = {
      namespace: "com.example.events",
      config: [
        ["icrc72:subscription:filter", { "Text": "host == 'John'" }],
        ["icrc72:subscription:skip", { "Array": [{ Nat: 5n }, { Nat: 1n }] }]
      ],
      memo: []
    };

    const subscriptionResult = await orchestrator_fixture.actor.icrc72_register_subscription([subscriptionRegistration]);

    console.log("subscriptionResult", JSON.stringify(subscriptionResult, dataItemStringify,2));

    // Assert: Verify subscription registration was successful
    expect(subscriptionResult).toBeDefined();
    expect(subscriptionResult.length).toBe(1);
    expect(subscriptionResult[0]).toBeDefined();
    if (subscriptionResult[0][0] && 'Ok' in subscriptionResult[0][0]) {
      expect(subscriptionResult[0][0].Ok).toEqual(0n);
    } else {
      throw(`Expected Ok but got Err: ${JSON.stringify(subscriptionResult[0], dataItemStringify, 2)}`);
    }
    const subscriptionId = subscriptionResult[0][0]?.Ok;

    // Define an invalid SubscriptionUpdateRequest (e.g., invalid key in config)
    const invalidSubscriptionUpdateRequest: SubscriptionUpdateRequest[] = [{  // Replace 'any' with the correct type if available
      subscription: { id: subscriptionId },
      config: 
        ["icrc72:subscription:invalid_key", { "Nat": 2n }],
        subscriber: [admin.getPrincipal()],
      memo: []
    },
    {  // Replace 'any' with the correct type if available
      subscription: { id: subscriptionId },
      config:
        ["icrc72:subscription:skip:update", { "Array": [{ Nat: 10n }, { Nat: 2n }] }]
      ,
      subscriber: [admin.getPrincipal()],
      memo: []
    }];

    // Act: Attempt to update the subscription with invalid data
    console.log("invalidSubscriptionUpdateRequest", JSON.stringify(invalidSubscriptionUpdateRequest, dataItemStringify,2));
    const updateResult = await orchestrator_fixture.actor.icrc72_update_subscription(invalidSubscriptionUpdateRequest);
    console.log("updateResult", JSON.stringify(updateResult, dataItemStringify,2));

    // Assert: Verify that an error is returned
    expect(updateResult).toBeDefined();
    expect(updateResult.length).toBe(2);
    expect(updateResult[0]).toBeDefined();

    if (updateResult[0][0] && 'Err' in updateResult[0][0]) {
      expect(updateResult[0][0].Err).toBeDefined();
      // Replace 'ImproperConfig' with the exact error type if available
      expect(updateResult[0][0].Err).toEqual(
        expect.objectContaining({ 
          GenericError: {
            error_code: 3948348n,
            message: "Invalid key"
          }
        }
        )
      );
    } else {
      throw(`Expected Err but got Ok: ${JSON.stringify(updateResult[0], dataItemStringify, 2)}`);
    }

    if (updateResult[1][0] && 'Ok' in updateResult[1][0]) {
      expect(updateResult[1][0].Ok).toBeDefined();
      // Replace 'ImproperConfig' with the exact error type if available
      expect(updateResult[1][0].Ok).toEqual(true);
    } else {
      throw(`Expected Ok but got Err: ${JSON.stringify(updateResult[0], dataItemStringify, 2)}`);
    }

    // Optionally, verify that the subscription's config was not altered
    const orchestratorState = await orchestrator_fixture.actor.get_stats();
    console.log("orchestratorState", JSON.stringify(orchestratorState, dataItemStringify,2));

    const subscription = orchestratorState.subscriptions.find(sub => sub[0] === subscriptionId);

    const existingSubscriber = subscription ? subscription[1]?.subscribers.find(sub => sub[0].toText() === admin.getPrincipal().toText()) : undefined;

    console.log("existingSubscriber", JSON.stringify(existingSubscriber, dataItemStringify,2));

    expect(existingSubscriber).toBeDefined();
    if (existingSubscriber) {
      // The invalid key should not be present
  
      // The valid skip configuration should change because its key is fine
      expect(existingSubscriber[1].skip).toEqual([[10n,2n]]);
    }
  });

  it('should prevent unauthorized callers from updating subscriptions', async function testUpdateSubscription_Unauthorized() {
    // Arrange: Set up Orchestrator with the default scenario
    console.log("madeit");
    await setUpOrchestrator("defaultOrchestrator");
    

      // Act: Ensure the orchestrator identity is set to admin
      await orchestrator_fixture.actor.setIdentity(admin);
      let pubResult = await registerPublication(admin);
    console.log("madeit2");

    // Act: Change the orchestrator's identity to an unauthorized user (e.g., bob)
    await orchestrator_fixture.actor.setIdentity(bob);

    // Define a valid SubscriptionRegistration object
    const subscriptionRegistration: SubscriptionRegistration = {
      namespace: "com.example.app.events",
      config: [
        ["icrc72:subscription:filter", { "Text": "host == 'John'" }],
        ["icrc72:subscription:skip", { "Array": [{Nat: 5n}, {Nat: 1n}] }],
        ["icrc72:subscription:controllers:list", {"Array": [{ "Blob": bob.getPrincipal().toUint8Array() }] }]
      ],
      memo: []
    };

    console.log("made it 3")

    // Act: Attempt to register the subscription
    const result = await orchestrator_fixture.actor.icrc72_register_subscription([subscriptionRegistration]);

    // Assert: Verify that the registration was denied with an Unauthorized error
    expect(result).toBeDefined();
    expect(result.length).toBe(1);
    expect(result[0]).toBeDefined();

    if (result[0][0] && 'Ok' in result[0][0]) {
      expect(result[0][0].Ok).toBeDefined();
      expect(result[0][0].Ok).toEqual(0n);
    } else {
      throw new Error(`Expected Err but got Ok: ${JSON.stringify(result[0], dataItemStringify, 2)}`);
    }

    let subscriptionId = result[0][0].Ok;

    // Define an invalid SubscriptionUpdateRequest (e.g., invalid key in config)
    const invalidSubscriptionUpdateRequest: SubscriptionUpdateRequest[] = [
    {  // Replace 'any' with the correct type if available
      subscription: { id: subscriptionId },
      config:
        ["icrc72:subscription:skip:update", { "Array": [{ Nat: 10n }, { Nat: 2n }] }]
      ,
      subscriber: [admin.getPrincipal()],
      memo: []
    }];

    orchestrator_fixture.actor.setIdentity(alice);

    let updateResult = await orchestrator_fixture.actor.icrc72_update_subscription(invalidSubscriptionUpdateRequest);

    // Assert: Verify that the update was denied with an Unauthorized error
    expect(updateResult).toBeDefined();
    expect(updateResult.length).toBe(1);
    expect(updateResult[0]).toBeDefined();
    expect(updateResult[0][0]).toBeDefined();
    if (updateResult[0][0] && 'Err' in updateResult[0][0]) {
      expect(  updateResult[0][0].Err).toBeDefined();
      expect(updateResult[0][0].Err).toEqual({
        "Unauthorized": null
      });
    } else {
      throw new Error(`Expected Err but got Ok: ${JSON.stringify(updateResult[0], dataItemStringify, 2)}`);
    }




  });

  it('should handle updates to non-existing subscriptions gracefully', async function testUpdateSubscription_NotFound() {
    // Arrange: Set up Orchestrator with the default scenario
    await setUpOrchestrator("defaultOrchestrator");

    // Act: Ensure the orchestrator identity is set to admin
    await orchestrator_fixture.actor.setIdentity(admin);
    let pubResult = await registerPublication(admin);

    // Define a valid SubscriptionRegistration object
    const subscriptionRegistration: SubscriptionRegistration = {
      namespace: "com.example.app.events",
      config: [
        ["icrc72:subscription:filter", { "Text": "host == 'Alice'" }],
        ["icrc72:subscription:skip", { "Array": [{Nat: 10n}, {Nat: 2n}] }]
      ],
      memo: []
    };

    // Act: Register the subscription for the first time
    const firstResult = await orchestrator_fixture.actor.icrc72_register_subscription([subscriptionRegistration]);

    // Assert: Verify successful registration
    expect(firstResult).toBeDefined();
    expect(firstResult.length).toBe(1);
    expect(firstResult[0]).toBeDefined();

    if (firstResult[0][0] && 'Ok' in firstResult[0][0]) {
      expect(firstResult[0][0].Ok).toEqual(0n);
    } else {
      throw new Error(`Expected Ok but got Err: ${JSON.stringify(firstResult[0], dataItemStringify, 2)}`);
    }

    // Act: Attempt to register the same subscription again (duplicate registration)
    const duplicateResult = await orchestrator_fixture.actor.icrc72_register_subscription([subscriptionRegistration]);

    // Assert: Verify that the system handles the duplicate appropriately
    expect(duplicateResult).toBeDefined();
    expect(duplicateResult.length).toBe(1);
    expect(duplicateResult[0]).toBeDefined();

    if (duplicateResult[0][0] && 'Ok' in duplicateResult[0][0]) {
      expect(duplicateResult[0][0].Ok).toEqual(0n); // Assuming the system acknowledges duplicates gracefully
    } else {
      throw new Error(`Expected Ok but got Err due to duplicate registration: ${JSON.stringify(duplicateResult[0], dataItemStringify, 2)}`);
    }
  });

  // Subscription Deletion Tests
  it('should delete a subscription successfully', async function testDeleteSubscription_Success() {
    await setUpOrchestrator("defaultOrchestrator");

    // Register a publication first to associate the subscription
    await registerPublication(admin);

    // Register a subscription for the publication
    const subscriptionRegistration: SubscriptionRegistration = {
      namespace: "com.example.app.events",
      config: [
        ["icrc72:subscription:filter", { "Text": "host == 'John'" }],
        ["icrc72:subscription:skip", { "Array": [{ Nat: 5n }, { Nat: 1n }] }]
      ],
      memo: []
    };

    const subscriptionResult = await orchestrator_fixture.actor.icrc72_register_subscription([subscriptionRegistration]);

    // Assert: Verify subscription registration was successful
    expect(subscriptionResult).toBeDefined();
    expect(subscriptionResult.length).toBe(1);
    expect(subscriptionResult[0]).toBeDefined();
    if (subscriptionResult[0][0] && 'Ok' in subscriptionResult[0][0]) {
      expect(subscriptionResult[0][0].Ok).toEqual(0n);
    } else {
      throw(`Expected Ok but got Err: ${JSON.stringify(subscriptionResult[0], dataItemStringify, 2)}`);
    }
    const subscriptionId = subscriptionResult[0][0]?.Ok;

    // Act: Delete the subscription as the authorized caller (Admin)
    const subscriptionDeleteRequest: any = {  // Replace 'any' with the correct type if available
      subscription: { subscriptionId: subscriptionId }, // Assuming variant; adjust based on actual type
      subscriber: [admin.getPrincipal()],
      memo: []
    };

    const deleteResult = await orchestrator_fixture.actor.icrc72_delete_subscription([subscriptionDeleteRequest]);

    // Assert: Verify the deletion was successful
    expect(deleteResult).toBeDefined();
    expect(deleteResult.length).toBe(1);
    expect(deleteResult[0]).toBeDefined();
    if (deleteResult[0][0] && 'Ok' in deleteResult[0][0]) {
      expect(deleteResult[0][0].Ok).toBe(true);
    } else {
      throw(`Expected Ok but got Err: ${JSON.stringify(deleteResult[0][0], dataItemStringify, 2)}`);
    }

    // Verify that the subscription has been removed from the Orchestrator's state
    const orchestratorState = await orchestrator_fixture.actor.get_stats();
    const deletedSubscription = orchestratorState.subscriptions.find(sub => sub[0] === subscriptionId);

    expect(deletedSubscription).toBeUndefined();
  });

  it('should prevent unauthorized callers from deleting subscriptions', async function testDeleteSubscription_Unauthorized() {
    // Arrange: Set up Orchestrator with the default scenario
    await setUpOrchestrator("defaultOrchestrator");

    // Register a publication first to associate the subscription
    await registerPublication(admin);

    // Register a subscription for the publication as Admin
    const subscriptionRegistration: SubscriptionRegistration = {
      namespace: "com.example.app.events",
      config: [
        ["icrc72:subscription:filter", { "Text": "host == 'John'" }],
        ["icrc72:subscription:skip", { "Array": [{ Nat: 5n }, { Nat: 1n }] }]
      ],
      memo: []
    };

    const subscriptionResult = await orchestrator_fixture.actor.icrc72_register_subscription([subscriptionRegistration]);

    // Assert: Verify subscription registration was successful
    expect(subscriptionResult).toBeDefined();
    expect(subscriptionResult.length).toBe(1);
    expect(subscriptionResult[0]).toBeDefined();
    if (subscriptionResult[0][0] && 'Ok' in subscriptionResult[0][0]) {
      expect(subscriptionResult[0][0].Ok).toEqual(0n);
    } else {
      throw(`Expected Ok but got Err: ${JSON.stringify(subscriptionResult[0], dataItemStringify, 2)}`);
    }
    const subscriptionId = subscriptionResult[0][0]?.Ok;

    // Act: Switch identity to an unauthorized user (e.g., Alice)
    await orchestrator_fixture.actor.setIdentity(alice);

    // Define a SubscriptionDeleteRequest targeting the subscription
    const subscriptionDeleteRequest: any = {  // Replace 'any' with the correct type if available
      subscription: { subscriptionId: subscriptionId }, // Assuming variant; adjust based on actual type
      subscriber: [admin.getPrincipal()],
      memo: []
    };

    // Act: Attempt to delete the subscription as an unauthorized caller
    const deleteResult = await orchestrator_fixture.actor.icrc72_delete_subscription([subscriptionDeleteRequest]);

    // Assert: Verify that an Unauthorized error is returned
    expect(deleteResult).toBeDefined();
    expect(deleteResult.length).toBe(1);
    expect(deleteResult[0]).toBeDefined();

    if (deleteResult[0][0] && 'Err' in deleteResult[0][0]) {
      expect(deleteResult[0][0].Err).toBeDefined();
      expect(deleteResult[0][0].Err).toEqual({
        "Unauthorized": null
      });
    } else {
      throw(`Expected Err but got Ok: ${JSON.stringify(deleteResult[0], dataItemStringify, 2)}`);
    }
  });

  it('should handle deletion of non-existing subscriptions gracefully', async function testDeleteSubscription_NotFound() {
    // Arrange: Set up Orchestrator with the default scenario
    await setUpOrchestrator("defaultOrchestrator");
    orchestrator_fixture.actor.setIdentity(admin);

    await registerPublication(admin);

    // Define a non-existing SubscriptionIdentifier
    const nonExistingSubscriptionId = 9999n;

    // Define a SubscriptionDeleteRequest targeting the non-existing subscription
    const subscriptionDeleteRequest: any = {  // Replace 'any' with the correct type if available
      subscription: { subscriptionId: nonExistingSubscriptionId }, // Assuming variant; adjust based on actual type
      subscriber: [admin.getPrincipal()],
      memo: []
    };

    // Act: Attempt to delete the non-existing subscription as the authorized caller (Admin)
    const deleteResult = await orchestrator_fixture.actor.icrc72_delete_subscription([subscriptionDeleteRequest]);

    // Assert: Verify that a NotFound error is returned
    expect(deleteResult).toBeDefined();
    expect(deleteResult.length).toBe(1);
    expect(deleteResult[0]).toBeDefined();

    if (deleteResult[0][0] && 'Err' in deleteResult[0][0]) {
      expect(deleteResult[0][0].Err).toBeDefined();
      expect(deleteResult[0][0].Err).toEqual({
        "NotFound": null
      });
    } else {
      throw(`Expected Err but got Ok: ${JSON.stringify(deleteResult[0], dataItemStringify, 2)}`);
    }
  });

  // Broadcaster Retrieval Tests
  it.only('should retrieve a list of valid broadcasters', async function testGetValidBroadcasters_Success() {
    // Arrange: Set up Orchestrator with the default scenario
    await setUpOrchestrator("defaultOrchestrator");

    // Allow any asynchronous operations to complete
    await pic.tick(5);
    await pic.advanceTime(60_000); // Advance time by 60 seconds

    // Act: Call the icrc72_get_valid_broadcaster method
    const response = await orchestrator_fixture.actor.icrc72_get_valid_broadcaster();

    // Assert: Verify that the response is defined
    expect(response).toBeDefined();

    // Check if the response is the 'list' variant
    if ('list' in response) {
      // Verify that 'list' is an array
      expect(Array.isArray(response.list)).toBe(true);

      // Verify that the list contains exactly one broadcaster
      expect(response.list.length).toBe(1);

      // Verify that the broadcaster in the list is the Orchestrator's canister ID
      expect(response.list[0].toText()).toBe(orchestrator_fixture.canisterId.toText());
    } else {
      // If the response is not the 'list' variant, fail the test
      throw new Error(`Unexpected response variant: ${JSON.stringify(response)}`);
    }
  });

/* 
  // Relay Broadcaster Management Tests
  it('should add a relay broadcaster successfully', async function testHandleRelay_Add_Success() {
    // todo: code pending.
  });

  it('should handle adding duplicate relay broadcasters', async function testHandleRelay_Add_Duplicate() {
    // todo: code pending.
  });

  it('should remove a relay broadcaster successfully', async function testHandleRelay_Remove_Success() {
    // todo: code pending.
  });
 */

  
});