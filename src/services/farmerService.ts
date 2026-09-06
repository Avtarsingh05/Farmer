import {
  db, serverTimestamp, COLLECTIONS,
  collection, doc, getDoc, setDoc, updateDoc, getDocs, addDoc, deleteDoc,
  query, where, orderBy, limit,
} from '@/lib/firebase/firestore';
import type { FarmerProfile, Farm, VerificationStatus } from '@/types';
import type { FarmerProfileFormData, FarmFormData } from '@/schemas/farmer.schema';
import { isDemoMode, DEMO_FARMERS, withFirestoreTimeout } from './mockStore';

// ─── Farmer Profile ───────────────────────────────────────────────────────────

export async function createFarmerProfile(
  uid: string,
  data: FarmerProfileFormData
): Promise<void> {
  if (isDemoMode()) return;
  await setDoc(doc(db, COLLECTIONS.FARMERS, uid), {
    userId:             uid,
    displayName:        data.displayName,
    bio:                data.bio ?? null,
    verificationStatus: 'not_started' satisfies VerificationStatus,
    farmCount:          0,
    primaryLocation:    data.district ? `${data.district}, ${data.state ?? ''}` : null,
    district:           data.district ?? null,
    state:              data.state ?? null,
    aadhaarProvided:    false,
    photoURL:           null,
    createdAt:          serverTimestamp(),
    updatedAt:          serverTimestamp(),
  });
}

export async function getFarmerProfile(uid: string): Promise<FarmerProfile | null> {
  if (isDemoMode()) {
    const found = DEMO_FARMERS.find(f => f.userId === uid || f.id === uid);
    return found || DEMO_FARMERS[0];
  }
  try {
    const snap = await withFirestoreTimeout(getDoc(doc(db, COLLECTIONS.FARMERS, uid)), 800);
    if (!snap.exists()) {
      return DEMO_FARMERS.find(f => f.userId === uid || f.id === uid) || DEMO_FARMERS[0];
    }
    const d = snap.data();
    return {
      userId:             snap.id,
      id:                 snap.id,
      displayName:        d.displayName,
      bio:                d.bio ?? undefined,
      verificationStatus: d.verificationStatus ?? 'not_started',
      farmCount:          d.farmCount ?? 0,
      primaryLocation:    d.primaryLocation ?? undefined,
      district:           d.district ?? undefined,
      state:              d.state ?? undefined,
      aadhaarProvided:    d.aadhaarProvided ?? false,
      photoURL:           d.photoURL ?? undefined,
      photoUrl:           d.photoURL ?? undefined,
      createdAt:          d.createdAt?.toDate?.() ?? new Date(),
      updatedAt:          d.updatedAt?.toDate?.() ?? new Date(),
    };
  } catch {
    return DEMO_FARMERS.find(f => f.userId === uid || f.id === uid) || DEMO_FARMERS[0];
  }
}

export async function updateFarmerProfile(
  uid: string,
  data: Partial<FarmerProfileFormData>
): Promise<void> {
  if (isDemoMode()) return;
  const allowed: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (data.displayName !== undefined) allowed.displayName = data.displayName;
  if (data.bio         !== undefined) allowed.bio         = data.bio;
  if (data.district    !== undefined) allowed.district    = data.district;
  if (data.state       !== undefined) allowed.state       = data.state;
  if (data.district && data.state) {
    allowed.primaryLocation = `${data.district}, ${data.state}`;
  }
  await updateDoc(doc(db, COLLECTIONS.FARMERS, uid), allowed);
}

/**
 * Public directory of verified farmers.
 */
export async function getVerifiedFarmers(limitCount = 20): Promise<FarmerProfile[]> {
  if (isDemoMode()) {
    return DEMO_FARMERS.slice(0, limitCount);
  }
  try {
    const q = query(
      collection(db, COLLECTIONS.FARMERS),
      where('verificationStatus', '==', 'verified'),
      limit(limitCount)
    );
    const snap = await withFirestoreTimeout(getDocs(q), 800);
    if (snap.empty) return DEMO_FARMERS.slice(0, limitCount);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        userId:             d.id,
        id:                 d.id,
        displayName:        data.displayName,
        bio:                data.bio ?? undefined,
        verificationStatus: data.verificationStatus,
        farmCount:          data.farmCount ?? 0,
        primaryLocation:    data.primaryLocation ?? undefined,
        district:           data.district ?? undefined,
        state:              data.state ?? undefined,
        aadhaarProvided:    data.aadhaarProvided ?? false,
        photoURL:           data.photoURL ?? undefined,
        photoUrl:           data.photoURL ?? undefined,
        createdAt:          data.createdAt?.toDate?.() ?? new Date(),
        updatedAt:          data.updatedAt?.toDate?.() ?? new Date(),
      };
    });
  } catch {
    return DEMO_FARMERS.slice(0, limitCount);
  }
}

/**
 * Admin: Fetch all farmers regardless of status.
 */
export async function getAllFarmers(limitCount = 50): Promise<FarmerProfile[]> {
  if (isDemoMode()) {
    return DEMO_FARMERS.slice(0, limitCount);
  }
  try {
    const q = query(collection(db, COLLECTIONS.FARMERS), limit(limitCount));
    const snap = await withFirestoreTimeout(getDocs(q), 800);
    if (snap.empty) return DEMO_FARMERS.slice(0, limitCount);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        userId:             d.id,
        id:                 d.id,
        displayName:        data.displayName ?? 'Farmer',
        bio:                data.bio ?? undefined,
        verificationStatus: data.verificationStatus ?? 'not_started',
        farmCount:          data.farmCount ?? 0,
        primaryLocation:    data.primaryLocation ?? undefined,
        district:           data.district ?? undefined,
        state:              data.state ?? undefined,
        aadhaarProvided:    data.aadhaarProvided ?? false,
        photoURL:           data.photoURL ?? undefined,
        photoUrl:           data.photoURL ?? undefined,
        createdAt:          data.createdAt?.toDate?.() ?? new Date(),
        updatedAt:          data.updatedAt?.toDate?.() ?? new Date(),
      };
    });
  } catch {
    return DEMO_FARMERS.slice(0, limitCount);
  }
}

/**
 * ADMIN ONLY — Update verification status.
 */
export async function updateVerificationStatus(
  uid: string,
  status: VerificationStatus
): Promise<void> {
  if (isDemoMode()) return;
  await updateDoc(doc(db, COLLECTIONS.FARMERS, uid), {
    verificationStatus: status,
    updatedAt:          serverTimestamp(),
  });
}

// ─── Farm CRUD ────────────────────────────────────────────────────────────────

export async function createFarm(farmerId: string, data: FarmFormData): Promise<string> {
  if (isDemoMode()) return 'farm-demo-new';
  const ref = await addDoc(collection(db, COLLECTIONS.FARMS), {
    farmerId,
    name:        data.name,
    address:     data.address,
    district:    data.district,
    state:       data.state,
    areaInAcres: data.areaInAcres ?? null,
    cropTypes:   data.cropTypes,
    createdAt:   serverTimestamp(),
    updatedAt:   serverTimestamp(),
  });
  const farmerRef = doc(db, COLLECTIONS.FARMERS, farmerId);
  const farmerSnap = await getDoc(farmerRef);
  if (farmerSnap.exists()) {
    const current = farmerSnap.data().farmCount ?? 0;
    await updateDoc(farmerRef, { farmCount: current + 1, updatedAt: serverTimestamp() });
  }
  return ref.id;
}

export async function getFarmerFarms(farmerId: string): Promise<Farm[]> {
  if (isDemoMode()) {
    return [
      {
        id: 'farm-1',
        farmerId: 'demo-farmer-1',
        name: 'Nashik Valley Orchards',
        address: 'Plot 14, Gangapur Road',
        district: 'Nashik',
        state: 'Maharashtra',
        areaInAcres: 8.5,
        cropTypes: ['Tomatoes', 'Onions', 'Capsicum'],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];
  }
  try {
    const q = query(
      collection(db, COLLECTIONS.FARMS),
      where('farmerId', '==', farmerId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id:          d.id,
        farmerId:    data.farmerId,
        name:        data.name,
        address:     data.address,
        district:    data.district,
        state:       data.state,
        areaInAcres: data.areaInAcres ?? undefined,
        cropTypes:   data.cropTypes ?? [],
        createdAt:   data.createdAt?.toDate?.() ?? new Date(),
        updatedAt:   data.updatedAt?.toDate?.() ?? new Date(),
      };
    });
  } catch {
    return [];
  }
}

export async function deleteFarm(farmId: string, farmerId: string): Promise<void> {
  if (isDemoMode()) return;
  await deleteDoc(doc(db, COLLECTIONS.FARMS, farmId));
  const farmerRef = doc(db, COLLECTIONS.FARMERS, farmerId);
  const farmerSnap = await getDoc(farmerRef);
  if (farmerSnap.exists()) {
    const current = farmerSnap.data().farmCount ?? 1;
    await updateDoc(farmerRef, {
      farmCount: Math.max(0, current - 1),
      updatedAt: serverTimestamp(),
    });
  }
}
