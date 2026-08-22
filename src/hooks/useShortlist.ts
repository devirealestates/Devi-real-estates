import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

const STORAGE_KEY = 'devi_shortlist_ids';
const EVENT_NAME = 'devi_shortlist_change';

const getStoredShortlist = (): Set<string> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed) : new Set();
  } catch {
    return new Set();
  }
};

const saveStoredShortlist = (ids: Set<string>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: Array.from(ids) }));
  } catch (err) {
    console.error('Error saving shortlist to localStorage:', err);
  }
};

export const useShortlist = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [shortlistedIds, setShortlistedIds] = useState<Set<string>>(() => getStoredShortlist());
  const [isLoading, setIsLoading] = useState(false);

  // Sync state on custom event across all components
  useEffect(() => {
    const handleUpdate = () => {
      setShortlistedIds(getStoredShortlist());
    };

    window.addEventListener(EVENT_NAME, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(EVENT_NAME, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Sync with Firestore if logged in
  useEffect(() => {
    if (!currentUser) return;

    const syncFirestore = async () => {
      try {
        const snapshot = await getDocs(
          collection(db, 'users', currentUser.uid, 'shortlisted')
        );
        const firestoreIds = snapshot.docs.map(d => d.id);
        
        // Merge local storage + firestore
        const localIds = getStoredShortlist();
        const merged = new Set([...localIds, ...firestoreIds]);

        // If local had items not in Firestore, save them to Firestore
        for (const id of localIds) {
          if (!firestoreIds.includes(id)) {
            await setDoc(doc(db, 'users', currentUser.uid, 'shortlisted', id), {
              propertyId: id,
              addedAt: new Date()
            }).catch(console.error);
          }
        }

        saveStoredShortlist(merged);
        setShortlistedIds(merged);
      } catch (err) {
        console.error('Error syncing shortlist with Firestore:', err);
      }
    };

    syncFirestore();
  }, [currentUser]);

  const toggleShortlist = useCallback(async (propertyId: string) => {
    if (!propertyId) return false;
    setIsLoading(true);

    const currentSet = getStoredShortlist();
    const isAlready = currentSet.has(propertyId);
    const newSet = new Set(currentSet);

    if (isAlready) {
      newSet.delete(propertyId);
    } else {
      newSet.add(propertyId);
    }

    saveStoredShortlist(newSet);
    setShortlistedIds(newSet);

    // Sync to Firestore in background if logged in
    if (currentUser) {
      const docRef = doc(db, 'users', currentUser.uid, 'shortlisted', propertyId);
      if (isAlready) {
        deleteDoc(docRef).catch(console.error);
      } else {
        setDoc(docRef, { propertyId, addedAt: new Date() }).catch(console.error);
      }
    }

    toast({
      title: isAlready ? "Removed from Shortlist" : "Added to Shortlist",
      description: isAlready 
        ? "Property removed from your saved list" 
        : "Property saved to your shortlist drawer",
    });

    setIsLoading(false);
    return true;
  }, [currentUser, toast]);

  const isShortlisted = useCallback((propertyId: string) => {
    return shortlistedIds.has(propertyId);
  }, [shortlistedIds]);

  return {
    isShortlisted,
    toggleShortlist,
    isLoading,
    shortlistedCount: shortlistedIds.size,
    shortlistedIds: Array.from(shortlistedIds)
  };
};
