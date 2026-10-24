console.log('weather station poc');


// @ts-ignore -- this package does not provide TypeScript declarations.
import { Constants, NodeJSSerialConnection } from "@liamcottle/meshcore.js";

type MeshConnection = NodeJSSerialConnection & {
    on(event: string | number | symbol, listener: (...args: any[]) => void): MeshConnection;
};


// Utils 
async function connectToContact(connection: MeshConnection) {
    console.log("Connected to meshcore device!");
    console.log("Searching for contact 'D0D35F75'...");
    await connection.findContactByName("D0D35F75").then(async (contact: Awaited<ReturnType<typeof connection.findContactByName>>) => {
        console.log(`Contact: ${contact.advName}`);
        console.log("Found contact, sending message");
        await connection.sendTextMessage(contact.publicKey, "Hello from weather station!", 0);
    }).catch((err: any) => {
        console.log("Contact not found, trying again in 5 seconds...");
        setTimeout(() => {
            connectToContact(connection);
        }, 5000);
    });
}

const TARGET_KEY_HEX = "d0d35f7597d0f9568806a8097c043306531dc1b1a60ad2dbbab7a5ed2195770f";
const TARGET_NAME = "D0D35F75";

function hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
    }
    return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
    return Buffer.from(bytes).toString("hex");
}

// Main 
const connection = new NodeJSSerialConnection("/dev/tty.usbserial-0001") as MeshConnection;

console.log("Connecting to meshcore device on /dev/tty.usbserial-0001...");

async function replyToMessage(senderPubKeyPrefix: Uint8Array, text: string) {
    // don't reply to our own acknowledgements, otherwise two radios would loop forever
    if (text.startsWith("ACK:")) return;

    const reply = `ACK: ${text}`;
    try {
        await connection.sendTextMessage(senderPubKeyPrefix, reply, 0);
        console.log(`Replied to 0x${bytesToHex(senderPubKeyPrefix)}: ${reply}`);
    } catch (error) {
        console.error("Failed to send reply:", error);
    }
}

async function readWaitingMessages() {
    try {
        const messages = await connection.getWaitingMessages();
        for (const message of messages) {
            if (message.contactMessage) {
                console.log("CONTACT MESSAGE");
                console.log("Text:", message.contactMessage.text);
                console.log("Timestamp:", message.contactMessage.senderTimestamp);
                await replyToMessage(message.contactMessage.pubKeyPrefix, message.contactMessage.text);
            }
        }
    } catch (error) {
        console.error("Failed to read messages:", error);
    }
}

// Listen for messages (outside "connected" so no pushes are missed)
connection.on(Constants.PushCodes.MsgWaiting, async () => {
    console.log("Messages waiting to be read");
    await readWaitingMessages();
});

let myKeyPrefix = -1;

// surface device errors (e.g. ERR_CODE_TABLE_FULL) that library calls swallow
connection.on(Constants.ResponseCodes.Err, (err: any) => {
    console.log("Device returned error:", err);
});

// decode raw-RF logs so we can see DMs that are actually addressed to this radio
connection.on(Constants.PushCodes.LogRxData, (data: { lastSnr: number; lastRssi: number; raw: Uint8Array }) => {
    const raw = data.raw;
    if (raw.length < 3) return;

    const header = raw[0];
    const routeType = header & 0x03;
    const payloadType = (header >> 2) & 0x0f;

    let offset = 1;
    if (routeType === 0x00 || routeType === 0x03) offset += 4; // transport codes
    const pathLen = raw[offset];
    offset += 1 + pathLen;

    if (offset + 2 > raw.length) return;
    const destHash = raw[offset];
    const srcHash = raw[offset + 1];

    if (destHash !== myKeyPrefix) return;

    console.log(`DM for this radio: type=${payloadType} src=0x${srcHash.toString(16)} snr=${data.lastSnr} rssi=${data.lastRssi}`);
});

// wait until connected
async function onConnected() {
    const selfInfo = await connection.getSelfInfo();
    console.log(selfInfo);
    myKeyPrefix = selfInfo.publicKey[0];

    // keep the radio's clock in sync
    await connection.syncDeviceTime();

    // this radio can only decrypt a DM if the sender is in its contact list with the right key
    const contacts = await connection.getContacts();
    const hasExactKey = contacts.some((contact: any) => bytesToHex(contact.publicKey) === TARGET_KEY_HEX);
    const byName = contacts.find((contact: any) => contact.advName === TARGET_NAME);
    console.log(`Contacts: ${contacts.length}`);
    console.log("Target contact:", {
        hasExactKey,
        name: byName?.advName ?? null,
        storedKey: byName ? bytesToHex(byName.publicKey) : null,
    });

    if (!hasExactKey) {
        // the contact table is full, so free slots before adding ours
        console.log(`Removing the other ${contacts.length} contacts to make room...`);
        let removed = 0;
        for (const contact of contacts as any[]) {
            if (bytesToHex(contact.publicKey) === TARGET_KEY_HEX) continue;
            try {
                await connection.removeContact(contact.publicKey);
                removed++;
            } catch (error) {
                console.error(`Failed to remove ${contact.advName}:`, error);
            }
        }
        console.log(`Removed ${removed} contacts.`);

        console.log("Adding target contact so DMs can be decrypted...");
        await connection.addOrUpdateContact(
            hexToBytes(TARGET_KEY_HEX),
            Constants.AdvType.Chat,
            0,
            0,
            new Uint8Array(64),
            TARGET_NAME,
            Math.floor(Date.now() / 1000),
            0,
            0,
        );
        console.log("Target contact added.");
    }

    // advertise so other nodes have a contact and path back to this radio
    await connection.sendFloodAdvert();

    // drain anything that arrived before the listener was ready
    await readWaitingMessages();

    // poll as a fallback in case a MsgWaiting push is missed
    setInterval(readWaitingMessages, 5000);

    // await connectToContact(connection);
}

connection.on("connected", () => {
    onConnected().catch((error) => console.error("Failed on connect:", error));
});

// connect to meshcore device
await connection.connect();
