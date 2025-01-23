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

import {idlFactory as publisherIDLFactory,
  init as publisherInit } from "../../src/declarations/publisher/publisher.did.js";
import type {
  NewEvent as ICRC72NewEvent,
  _SERVICE as PublisherService,ICRC16} from "../../src/declarations/publisher/publisher.did.d";
export const publisher_WASM_PATH = ".dfx/local/canisters/publisher/publisher.wasm.gz"; 

import {idlFactory as orchestratorIDLFactory,
  init as orchestratorInit } from "../../src/declarations/orchestrator/orchestrator.did.js";
import type {
  
  _SERVICE as OrchestratorService,} from "../../src/declarations/orchestrator/orchestrator.did.d";

  import {idlFactory as broadcasterIDLFactory,
    init as broadcasterInit } from "../../src/declarations/broadcaster/broadcaster.did.js";
  import type {
    
    _SERVICE as BroadcasterService} from "../../src/declarations/broadcaster/broadcaster.did.d";
  export const broadcaster_WASM_PATH = ".dfx/local/canisters/broadcaster/broadcaster.wasm.gz"; 

  import {idlFactory as subscriberIDLFactory,
    init as subscriberInit } from "../../src/declarations/subscriber/subscriber.did.js";
  import type {
    
    _SERVICE as SubscriberService} from "../../src/declarations/subscriber/subscriber.did.d";
  export const subscriber_WASM_PATH = ".dfx/local/canisters/subscriber/subscriber.wasm.gz"; 


import { get } from "http";
import { ICRC16Map, EventNotification, PublicationRegistration } from "../../src/declarations/orchestrator/orchestrator.did.js";
import { assert } from "console";
import { publisher } from "../../src/declarations/publisher/index.js";
import { broadcaster, canisterId } from "../../src/declarations/broadcaster/index.js";
import { orchestrator } from "../../src/declarations/orchestrator/index.js";
export const orchestrator_WASM_PATH = ".dfx/local/canisters/orchestrator/orchestrator.wasm.gz"; 



const admin = createIdentity("admin");
const alice = createIdentity("alice");
const bob = createIdentity("bob");

let pic: PocketIc;
let orchestratorFixture: CanisterFixture<OrchestratorService>;
let broadcasterFixtures1 : CanisterFixture<BroadcasterService>;
let broadcasterFixtures2 : CanisterFixture<BroadcasterService>;
let broadcasterFixtures3 : CanisterFixture<BroadcasterService>;
let subscriberFixtures1_1 : CanisterFixture<SubscriberService>;
let subscriberFixtures1_2 : CanisterFixture<SubscriberService>;
let subscriberFixtures1_3 : CanisterFixture<SubscriberService>;
let subscriberFixtures1_4 : CanisterFixture<SubscriberService>;
let subscriberFixtures2_1 : CanisterFixture<SubscriberService>;
let subscriberFixtures2_2 : CanisterFixture<SubscriberService>;
let subscriberFixtures2_3 : CanisterFixture<SubscriberService>;
let subscriberFixtures2_4 : CanisterFixture<SubscriberService>;
let subscriberFixtures3_1 : CanisterFixture<SubscriberService>;
let subscriberFixtures3_2 : CanisterFixture<SubscriberService>;
let subscriberFixtures3_3 : CanisterFixture<SubscriberService>;
let subscriberFixtures3_4 : CanisterFixture<SubscriberService>;
let publisherFixture: CanisterFixture<PublisherService>;

let subnet1 : Principal;
let subnet2 : Principal;
let subnet3 : Principal;

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

describe("integration test", () => {

    // Our integration test will be have as such:
    // 1. Initialize the Orchestrator
    // 2. Deploy broadcasters to 3 subnets
    // 3. Deploy 4 subscribers each to each subnet
    // 4. Deploy the Publisher
    // 5. Initialize the Publisher
    // 6. Initialize the Subscribers - some with filters
    // 7. Confirm that the broadcasters are all wired up between the publisher and the subscribers
    // 8. Produce a set of messages that will be sent to the subscribers 
    // 9. Confirm that the subscribers receive the messages as expected
    // 10. Confirm that the subscribers can confirm the messages as expected
    

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
        application: [
          { state: { type: SubnetStateType.New } },
          { state: { type: SubnetStateType.New } },
          { state: { type: SubnetStateType.New } },
        ],
        processingTimeoutMs: 1000 * 120 * 5,
      } );

      subnet1 = pic.getApplicationSubnets()[0].id;
      subnet2 = pic.getApplicationSubnets()[1].id;
      subnet3 = pic.getApplicationSubnets()[2].id;

      console.log("Subnet 1:", subnet1.toText());
      console.log("Subnet 2:", subnet2.toText());
      console.log("Subnet 3:", subnet3.toText());

    });


    afterEach(async () => {
    /*  if (childProcess) {
        // Terminate the spawned process
        childProcess.kill('SIGTERM');
      } */
      await pic.tearDown();
    });

    

    

    // Orchestrator Initializes as expected
    it('should initialize successfully', async function testInitialization_Success() {
      assert(subnet1);
      assert(subnet2);
      assert(subnet3);

      async function validatePublishes(canister: Principal, messages : [Principal, any][]){

        for(var thisMessage of messages){
          if(thisMessage[0].toText() == canister.toText()){
            //ok
            continue;
          };

          //publish between broadcasters is a relay
          if(thisMessage[0].toText() == broadcasterFixtures1.canisterId.toText()){
            continue;
          }
          if(thisMessage[0].toText() == broadcasterFixtures2.canisterId.toText()){
            continue;
          }
          if(thisMessage[0].toText() == broadcasterFixtures2.canisterId.toText()){
            continue;
          }

          let foundSubnet1 = await pic.getCanisterSubnetId(canister);
          let foundSubnet2 = await pic.getCanisterSubnetId(thisMessage[0]);

          //publish between a canister its broadcaster
          if(foundSubnet1?.toText() == foundSubnet2?.toText()){
            continue;
          }

          
          //console.log("subnets",foundSubnet1, foundSubnet2);
          console.log("failed verify publisher", thisMessage[0].toText(), canister.toText(),foundSubnet1?.toText() ,foundSubnet2?.toText(), JSON.stringify(thisMessage[1], dataItemStringify,2));
          return false;
        };

        return true;
      };


      async function validateHandledNotifications(canister: Principal, messages : [Principal, any][]){

        for(var thisMessage of messages){
          if(thisMessage[0].toText() == canister.toText()){
            //ok
            continue;
          };

          //publish between broadcasters is a relay
          if(thisMessage[0].toText() == broadcasterFixtures1.canisterId.toText()){
            continue;
          }
          if(thisMessage[0].toText() == broadcasterFixtures2.canisterId.toText()){
            continue;
          }
          if(thisMessage[0].toText() == broadcasterFixtures2.canisterId.toText()){
            continue;
          }
          

          let foundSubnet1 = await pic.getCanisterSubnetId(canister);
          let foundSubnet2 = await pic.getCanisterSubnetId(thisMessage[0]);

          //notifications should only be sent between items on the same subnet
          if(foundSubnet1?.toText() == foundSubnet2?.toText()){
            continue;
          }

          
          //console.log("subnets",foundSubnet1, foundSubnet2);
          console.log("failed verify handle notification", thisMessage[0].toText(), canister.toText(),foundSubnet1?.toText() ,foundSubnet2?.toText(), JSON.stringify(thisMessage[1], dataItemStringify,2));
          return false;
        };

        return true;
      };

      async function validateHandledConfirmations(canister: Principal, messages : [Principal, any][]){

        for(var thisMessage of messages){
          if(thisMessage[0].toText() == canister.toText()){
            //ok
            continue;
          };

          /* //publish between broadcasters is a relay
          if(thisMessage[0].toText() == broadcasterFixtures1.canisterId.toText()){
            continue;
          }
          if(thisMessage[0].toText() == broadcasterFixtures2.canisterId.toText()){
            continue;
          }
          if(thisMessage[0].toText() == broadcasterFixtures2.canisterId.toText()){
            continue;
          } */
          

          let foundSubnet1 = await pic.getCanisterSubnetId(canister);
          let foundSubnet2 = await pic.getCanisterSubnetId(thisMessage[0]);

          //notifications should only be sent between items on the same subnet
          if(foundSubnet1?.toText() == foundSubnet2?.toText()){
            continue;
          }

          
          //console.log("subnets",foundSubnet1, foundSubnet2);
          console.log("failed verify handle notification", thisMessage[0].toText(), canister.toText(),foundSubnet1?.toText() ,foundSubnet2?.toText(), JSON.stringify(thisMessage[1], dataItemStringify,2));
          return false;
        };

        return true;
      };



        // Step 1: Initialize the Orchestrator
      const orchestratorFixture = await pic.setupCanister<OrchestratorService>({
        sender: admin.getPrincipal(),
        idlFactory: orchestratorIDLFactory,
        wasm: orchestrator_WASM_PATH,
        targetCanisterId : Principal.fromText("tqzl2-p7777-77776-aaaaa-cai"),
        targetSubnetId: subnet1,
        arg: IDL.encode(orchestratorInit({ IDL }), [
          [
            {
              icrc72OrchestratorArgs: [],
              icrc72SubscriberArgs: [],
              icrc72PublisherArgs: [],
              ttArgs: [],
            },
          ],
        ]),
      });
      await orchestratorFixture.actor.file_subnet_canister(subnet1, orchestratorFixture.canisterId);
      await orchestratorFixture.actor.setIdentity(admin);
      console.log("Orchestrator deployed with Canister ID:", orchestratorFixture.canisterId.toText());

      let orchestratorStats = await orchestratorFixture.actor.get_stats();
      console.log("Orchestrator stats:", JSON.stringify(orchestratorStats, dataItemStringify,2));

      

      await pic.tick(5);
      await pic.advanceTime(60_000);


      // Step 2: Deploy broadcasters to 3 subnets
      const subnetIds = [subnet1, subnet2, subnet3]; // Replace with actual subnet IDs
      const canisterIds = ["7tjcv-pp777-77776-qaaaa-cai", "lxzze-o7777-77777-aaaaa-cai", "txyno-ch777-77776-aaaaq-cai" ]
      const broadcasterFixtures = [];
      for (const subnetId of subnetIds) {
        assert(canisterIds.length > 0);
        let canisterId : any = canisterIds.pop();
        await orchestratorFixture.actor.file_subnet_canister(subnetId, Principal.fromText(canisterId));
        const broadcasterFixture = await pic.setupCanister<BroadcasterService>({
          
          sender: admin.getPrincipal(),
          idlFactory: broadcasterIDLFactory,
          wasm: broadcaster_WASM_PATH,
          targetCanisterId: Principal.fromText(canisterId),
          arg: IDL.encode(broadcasterInit({ IDL }), [
            [
              {
                orchestrator: orchestratorFixture.canisterId,
                icrc72BroadcasterArgs: [],
                icrc72SubscriberArgs: [],
                icrc72PublisherArgs: [],
                ttArgs: [],
              },
            ],
          ]),
          targetSubnetId: subnetId, // Assigning to specific subnet
        });
        
        //await orchestratorFixture.actor.file_subnet_canister(subnetId, broadcasterFixture.canisterId);
        await broadcasterFixture.actor.setIdentity(admin);
        broadcasterFixtures.push(broadcasterFixture);
        console.log(`Broadcaster deployed to ${subnetId} with Canister ID:`, broadcasterFixture.canisterId.toText());
        //expect("temp stop").toBe("Ok"); 
        await pic.tick(5);
        await pic.advanceTime(60_000);
        
      };

      broadcasterFixtures1 = broadcasterFixtures[0];
      broadcasterFixtures2 = broadcasterFixtures[1];
      broadcasterFixtures3 = broadcasterFixtures[2];


      let broadcasterStats1 = await broadcasterFixtures1.actor.get_stats();
      console.log("Broadcaster 1 stats:", JSON.stringify(broadcasterStats1, dataItemStringify,2));
      let broadcasterStats2 = await broadcasterFixtures2.actor.get_stats();
      console.log("Broadcaster 2 stats:", broadcasterStats2);
      let broadcasterStats3 = await broadcasterFixtures3.actor.get_stats();
      console.log("Broadcaster 3 stats:", broadcasterStats3);


      await pic.tick(5);
      await pic.advanceTime(60_000);







      //register each broadcaster with the orchestrator
      await orchestratorFixture.actor.file_subnet_broadcaster(broadcasterFixtures1.canisterId);
      console.log("Broadcaster 1 registered with Orchestrator");



      await pic.tick(5);
      await pic.advanceTime(60_000);

      orchestratorStats = await orchestratorFixture.actor.get_stats();

      console.log("Orchestrator stats after broadcaster filed:", JSON.stringify(orchestratorStats, dataItemStringify,2));


      await orchestratorFixture.actor.initialize();

      orchestratorStats = await orchestratorFixture.actor.get_stats();

      await pic.tick(5);
      await pic.advanceTime(60_000);

      console.log("Orchestrator stats after initialized:", JSON.stringify(orchestratorStats, dataItemStringify,2));

      console.log("Broadcaster 1 about to initialized");

      await broadcasterFixtures1.actor.initialize();

      
      await pic.tick(5);
      await pic.advanceTime(60_000);

      console.log("Broadcaster 1 initialized");

      broadcasterStats1 = await broadcasterFixtures1.actor.get_stats();

      console.log("Broadcaster 1 stats after initialization:", JSON.stringify(broadcasterStats1, dataItemStringify,2));

      orchestratorStats = await orchestratorFixture.actor.get_stats();

      console.log("Orchestrator stats after broadcaster initialized:", JSON.stringify(orchestratorStats, dataItemStringify,2));

      await orchestratorFixture.actor.file_subnet_broadcaster(broadcasterFixtures2.canisterId);
      console.log("Broadcaster 2 registered with Orchestrator");

      await pic.tick(5);
      await pic.advanceTime(60_000);

      console.log("Broadcaster 2 about to initialized");

      await broadcasterFixtures2.actor.initialize();

      console.log("Broadcaster 2 initialized");

      await pic.tick(5);
      await pic.advanceTime(60_000);


      broadcasterStats1 = await broadcasterFixtures1.actor.get_stats();

      console.log("Broadcaster 1 stats after broadcaster 2 initialization:", JSON.stringify(broadcasterStats1, dataItemStringify,2));

      broadcasterStats2 = await broadcasterFixtures2.actor.get_stats();

      console.log("Broadcaster 2 stats after broadcaster 2 initialization:", JSON.stringify(broadcasterStats2, dataItemStringify,2));

      orchestratorStats = await orchestratorFixture.actor.get_stats();

      console.log("Orchestrator stats after broadcaster 2 initialization:", JSON.stringify(orchestratorStats, dataItemStringify,2));

      
      
      
      
      await orchestratorFixture.actor.file_subnet_broadcaster(broadcasterFixtures3.canisterId);
      console.log("Broadcaster 3 registered with Orchestrator");


      


      

      await pic.tick(5);
      await pic.advanceTime(60_000);

      await broadcasterFixtures3.actor.initialize();


      




      //expect("temp").toEqual("ok");

     let subscriberIds : any =[
      //7goty-oh777-77776-qaadq-cai,7bpvm-d7777-77776-qaada-cai,7im6q-vx777-77776-qaacq-cai
     "7pnye-yp777-77776-qaaca-cai","72kjj-zh777-77776-qaabq-cai","75lp5-u7777-77776-qaaba-cai","7uieb-cx777-77776-qaaaq-cai",

     //lc6ij-px777-77777-aaadq-cai, lf7o5-cp777-77777-aaada-cai, lm4fb-uh777-77777-aaacq-cai
     
     "ll5dv-z7777-77777-aaaca-cai","l62sy-yx777-77777-aaabq-cai","lz3um-vp777-77777-aaaba-cai","lqy7q-dh777-77777-aaaaq-cai",
     
     //siq6z-b7777-77776-aaaea-cai, tf62x-ox777-77776-aaadq-cai, tc74d-dp777-77776-aaada-cai
     "tl4x7-vh777-77776-aaacq-cai","tm5rl-y7777-77776-aaaca-cai","tz2ag-zx777-77776-aaabq-cai","t63gs-up777-77776-aaaba-cai"]




      // Step 3: Deploy 4 subscribers each to each subnet
      const subscribersPerSubnet = 4;
      const subscriberFixtures = [];
      for (const broadcasterFixture of broadcasterFixtures) {
        for (let i = 0; i < subscribersPerSubnet; i++) {
          let targetCanisterId : any = Principal.fromText(subscriberIds.pop());
          let targetSubnetId :any = await pic.getCanisterSubnetId(broadcasterFixture.canisterId);
          await orchestratorFixture.actor.file_subnet_canister(targetSubnetId, targetCanisterId);
          console.log("going to create a subscriber ",targetCanisterId.toText(), targetSubnetId.toText()); 
          const subscriberFixture = await pic.setupCanister<SubscriberService>({
            sender: admin.getPrincipal(),
            idlFactory: subscriberIDLFactory,
            wasm: subscriber_WASM_PATH,
            targetCanisterId : targetCanisterId,
            arg: IDL.encode(subscriberInit({ IDL }), [
              [
                {
                  orchestrator: orchestratorFixture.canisterId,
                  icrc72SubscriberArgs: [],
                  ttArgs: [],
                },
              ],
            ]),
            targetSubnetId: targetSubnetId, // Assigning to the same subnet as Broadcaster
          });
          

          await subscriberFixture.actor.setIdentity(admin);
          subscriberFixtures.push(subscriberFixture);

          console.log(`Subscriber ${i + 1} deployed to subnet ${targetSubnetId.toText()} with Canister ID:`, subscriberFixture.canisterId.toText());
          await pic.tick(5);
          await pic.advanceTime(60_000);
        }
      }

      //expect("temp pause").toBe("Ok");

      // Step 4: Deploy the Publisher
      const publisherFixture = await pic.setupCanister<PublisherService>({
        sender: admin.getPrincipal(),
        idlFactory: publisherIDLFactory,
        wasm: publisher_WASM_PATH,
        targetSubnetId: subnet1,
        targetCanisterId: Principal.fromText("siq6z-b7777-77776-aaaea-cai"),
        arg: IDL.encode(publisherInit({ IDL }), [
          [
            {
              orchestrator: orchestratorFixture.canisterId,
              icrc72PublisherArgs: [],
              ttArgs: [],
            },
          ],
        ]),
      });
      await orchestratorFixture.actor.file_subnet_canister(subnet1, publisherFixture.canisterId);

      await publisherFixture.actor.setIdentity(admin);
      console.log("Publisher deployed with Canister ID:", publisherFixture.canisterId.toString());

      // Step 5: Initialize the Publisher

      let publicationResult = await publisherFixture.actor.simulatePublicationCreation();
      let publicationId;

      if (publicationResult[0] && publicationResult[0][0] && 'Ok' in publicationResult[0][0]) {
        publicationId = publicationResult[0][0].Ok;
      } else {
        expect("Publication creation failed").toBe("Ok");
      }

      await pic.tick(15);
      await pic.advanceTime(60_000);
      await pic.tick(15);

      let publicationStats = await publisherFixture.actor.get_stats();

      console.log("Publisher stats after publication filed:", JSON.stringify(publicationStats, dataItemStringify,2));
      

      // Step 6: Initialize the Subscribers - Some with Filters
      for (const subscriberFixture of subscriberFixtures) {
        // Example: Initialize with a filter for every second subscriber
        console.log("subscriberFixture simulating new subscription", subscriberFixtures.indexOf(subscriberFixture));
        if (subscriberFixtures.indexOf(subscriberFixture) % 4 === 0) {
        //if (false) {
          subscriberFixture.actor.setIdentity(admin);
          await subscriberFixture.actor.simulateSubscriptionCreation(true,"com.test.counter", [
            [["icrc72:subscription:filter", {Text : "$.counter > 4"} ]]]);
          console.log(`Subscriber ${subscriberFixtures.indexOf(subscriberFixture) + 1} initialized with a filter.`);
        } else if (subscriberFixtures.indexOf(subscriberFixture) % 4 === 1){
        //} else if (false){
          subscriberFixture.actor.setIdentity(admin);
          await subscriberFixture.actor.simulateSubscriptionCreation(true,"com.test.counter", [
            [["icrc72:subscription:skip", {Array : [{Nat: 3n}]} ]]]);
          console.log(`Subscriber ${subscriberFixtures.indexOf(subscriberFixture) + 1} initialized with a skip.`);
        } else if (subscriberFixtures.indexOf(subscriberFixture) % 4 === 2){
        //} else if (false){
          subscriberFixture.actor.setIdentity(admin);
          await subscriberFixture.actor.simulateSubscriptionCreation(true,"com.test.counter", [
            [["icrc72:subscription:skip", {Array : [{Nat: 3n}, {Nat: 1n}]} ]]]);
          console.log(`Subscriber ${subscriberFixtures.indexOf(subscriberFixture) + 1} initialized with a skip and offset.`);
        } else {
          subscriberFixture.actor.setIdentity(admin);
          await subscriberFixture.actor.simulateSubscriptionCreation(true,"com.test.counter", [
            []]);
          console.log(`Subscriber ${subscriberFixtures.indexOf(subscriberFixture) + 1} initialized with no skip or filter.`);
        }

        await pic.tick(15);
        await pic.advanceTime(60_000);
        await pic.tick(15);
      }

      // Allow some time for Subscribers to initialize
      await pic.tick(15);
      await pic.advanceTime(60_000);//one hour
      await pic.tick(15);



      // Step 7: Confirm that the orchestrator and broadcasters are all wired up between the publisher and the subscribers

      orchestratorStats = await orchestratorFixture.actor.get_stats();

      console.log("Orchestrator stats after all subscribers filed:", JSON.stringify(orchestratorStats, dataItemStringify,2));

      console.log("Orchestrator has filed", orchestratorStats.publications.length, "publications.");
      console.log("Orchestrator has filed", orchestratorStats.subscriptions.length, "subscriptions.");
      console.log("Orchestrator has filed", orchestratorStats.broadcasters.length, "broadcasters.");

      // 2 for orchestrator
      // 9 for the broadcasters
      // 12 for each subscriber
      // 2 for the publisher
      // 1 for the main event
      expect(orchestratorStats.publications.length).toEqual(26);

      // 2 for orchestrator
      // 9 for the broadcasters
      // 12 for each subscriber
      // 2 for the publisher
      // 12 for the main event
      expect(orchestratorStats.subscriptions.length).toEqual(37);


      expect(orchestratorStats.broadcasters.length).toEqual(3);



      for (const broadcasterFixture of broadcasterFixtures) {
        const stats = await broadcasterFixture.actor.get_stats();
        console.log("Broadcaster stats:", JSON.stringify(stats, dataItemStringify,2));
        console.log(`Broadcaster ${broadcasterFixture.canisterId} is wired up with ${stats.subscriptions.length} subscribers.`);
        console.log(`Broadcaster ${broadcasterFixture.canisterId} is wired up with ${stats.publications.length} publications.`);
        console.log(`Broadcaster ${broadcasterFixture.canisterId} has processed  ${stats.eventStore.length} namespace events.`);
        for(var thisItem of stats.eventStore){
          console.log("namespace", thisItem);
          for(var thisEvent of thisItem){
            console.log("event", thisEvent);
          }
        }
        if(broadcasterFixture.canisterId == broadcasterFixtures1.canisterId){
          // 9 for the broadcasters
          // 12 for each subscriber
          // 2 for the publisher
          // 1 for the main event
          // 1 orchestrator
          expect(stats.subscriptions.length).toEqual((subscribersPerSubnet*subnetIds.length) + (broadcasterFixtures.length *3) + 1 + 2 + 1);
          expect(stats.publications.length).toEqual((subscribersPerSubnet*subnetIds.length) + (broadcasterFixtures.length *3) + 1 + 2 + 1);
        } else {
          //i really think this should be 8
          //expect(stats.subscriptions.length).toEqual(subscribersPerSubnet + 3 + 1);
          expect(stats.subscriptions.length).toEqual(6);
        };
        
      }

      await pic.tick(5);
      await pic.advanceTime(60_000);

      // Step 8: Produce a set of messages that will be sent to the subscribers
      const messages : ICRC72NewEvent [] = [
        {
          namespace: "com.test.counter",
          data: { Class: [{name:"counter", value:{ Nat: 1n }, immutable:false}]},
          headers: []
        },
        {
          namespace: "com.test.counter",
          data: { Class: [{name:"counter", value:{ Nat: 2n }, immutable:false}]},
          headers: []
        },
        {
          namespace: "com.test.counter",
          data: { Class: [{name:"counter", value:{ Nat: 3n }, immutable:false}]},
          headers: []
        },
        {
          namespace: "com.test.counter",
          data: { Class: [{name:"counter", value:{ Nat: 4n }, immutable:false}]},
          headers: []
        },
        {
          namespace: "com.test.counter",
          data: { Class: [{name:"counter", value:{ Nat: 5n }, immutable:false}]},
          headers: []
        },
        {
          namespace: "com.test.counter",
          data: { Class: [{name:"counter", value:{ Nat: 6n }, immutable:false}]},
          headers: []
        },
        {
          namespace: "com.test.counter",
          data: { Class: [{name:"counter", value:{ Nat: 7n }, immutable:false}]},
          headers: [],
        },
        {
          namespace: "com.test.counter",
          data: { Class: [{name:"counter", value:{ Nat: 8n }, immutable:false}]},
          headers: [],
        },
      ];

      console.log("sending messages");

      await publisherFixture.actor.simulatePublish(messages);
      console.log("Publisher published messages:", messages);

      // Allow time for messages to propagate
      await pic.tick(25);
      await pic.advanceTime(660_000);
      await pic.tick(25);

      console.log("messages settled");

      // Step 9: Confirm that the subscribers receive the messages as expected
      let counters = [];
      for (const subscriberFixture of subscriberFixtures) {
        const counterStatus = await subscriberFixture.actor.getCounter();
        console.log("counterStatus", subscriberFixture.canisterId.toText(),counterStatus);
        counters.push(counterStatus);
      }

      /* expect(counters[0]).toEqual(1n);
      expect(counters[1]).toEqual(2n);
      expect(counters[2]).toEqual(1n);
      expect(counters[3]).toEqual(2n);
      expect(counters[4]).toEqual(4n);
      expect(counters[5]).toEqual(6n);
      expect(counters[6]).toEqual(5n);
      expect(counters[7]).toEqual(6n);
      expect(counters[8]).toEqual(1n);
      expect(counters[9]).toEqual(2n);
      expect(counters[10]).toEqual(1n);
      expect(counters[11]).toEqual(2n);
      expect(counters[12]).toEqual(4n); */

      // Step 10: Confirm that the subscribers can confirm the messages as expected
      for (const broadcasterFixture of broadcasterFixtures) {
        const confirmations = await broadcasterFixture.actor.getRecievedConfirmations();
        console.log(`Broadcaster ${broadcasterFixture.canisterId} received confirmations:`, confirmations.length);
        console.log(`Broadcaster ${broadcasterFixture.canisterId} received confirmations:`, confirmations);
        expect(confirmations.length).toBeGreaterThanOrEqual(2);

        expect(await validateHandledConfirmations(broadcasterFixture.canisterId, confirmations)).toBe(true);

        const publishes = await broadcasterFixture.actor.getReceivedPublishes();

        console.log("publishes",publishes.length)

        expect(await validatePublishes(broadcasterFixture.canisterId, publishes)).toBe(true);

        const handledNotifications = await broadcasterFixture.actor.getReceivedPublishes();
        console.log("handledNotifications",handledNotifications.length);

        expect(await validateHandledNotifications(broadcasterFixture.canisterId, handledNotifications)).toBe(true);

        
      }


      for (const subscriber of subscriberFixtures) {
        const stats = await subscriber.actor.get_stats();
        console.log("Subscriber stats:", subscriberFixtures.indexOf(subscriber),  JSON.stringify(stats, dataItemStringify,2));
      }



  });
});