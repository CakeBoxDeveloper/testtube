import "server-only";

import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage, type Storage } from "firebase-admin/storage";

let app: App | undefined;

function maskKey(key: string | undefined): string {
  if (!key) return "<empty>";
  const lines = key.split(/\\n|\n/);
  return `${lines.length} lines, first 30 chars: "${key.slice(0, 30)}..."`;
}

function describeEnv() {
  return {
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID
      ? `set ("${process.env.FIREBASE_PROJECT_ID}")`
      : "MISSING",
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL
      ? `set ("${process.env.FIREBASE_CLIENT_EMAIL}")`
      : "MISSING",
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY
      ? `set (${maskKey(process.env.FIREBASE_PRIVATE_KEY)})`
      : "MISSING",
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "MISSING",
  };
}

function getAdminApp(): App {
  if (app) return app;

  const existing = getApps();
  if (existing.length) {
    app = existing[0];
    return app;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

  const missing: string[] = [];
  if (!projectId) missing.push("FIREBASE_PROJECT_ID");
  if (!clientEmail) missing.push("FIREBASE_CLIENT_EMAIL");
  if (!privateKeyRaw) missing.push("FIREBASE_PRIVATE_KEY");

  if (missing.length) {
    console.error("[firebase-admin] init failed — missing env vars:", missing);
    console.error("[firebase-admin] env state:", describeEnv());
    throw new Error(
      `Firebase Admin credentials are missing: ${missing.join(", ")}. ` +
        `Fill them in .env.local (NOT .env.local.example) and restart 'npm run dev'.`
    );
  }

  const privateKey = privateKeyRaw!.replace(/\\n/g, "\n");

  if (!privateKey.includes("BEGIN PRIVATE KEY")) {
    console.error("[firebase-admin] FIREBASE_PRIVATE_KEY does not look like a PEM key");
    console.error("[firebase-admin] env state:", describeEnv());
    throw new Error(
      `FIREBASE_PRIVATE_KEY is not a valid RSA private key. ` +
        `It should start with "-----BEGIN PRIVATE KEY-----" and end with "-----END PRIVATE KEY-----". ` +
        `Did you accidentally paste a Web API key instead?`
    );
  }

  console.log("[firebase-admin] initializing with project:", projectId);

  app = initializeApp({
    credential: cert({ projectId: projectId!, clientEmail: clientEmail!, privateKey }),
    storageBucket,
  });

  console.log("[firebase-admin] initialized OK");
  return app;
}

export function adminDb(): Firestore {
  return getFirestore(getAdminApp());
}

export function adminStorage(): Storage {
  return getStorage(getAdminApp());
}
