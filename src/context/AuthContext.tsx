"use client";

import { createContext, useState, useEffect, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";

import { firebaseAuth } from "@/lib/firebase/firebaseConfig";
import { getUserData } from "@/lib/firebase/repository/usersRepository";
import { watchAccountBookInvites } from "@/lib/firebase/repository/accountBookInvitesRepository";
import { watchAccountBookRemoval } from "@/lib/firebase/repository/accountBookRemovalsRepository";
import {
  accountBookInvitesType,
  accountBookRemovalType,
} from "@/types/AccountingBookType";

type UserData = {
  user: User | null;
  name: string;
  loading: boolean;
};

type AuthContextType = {
  user: User | null;
  name: string;
  loading: boolean;
  invitesData: accountBookInvitesType[];
  removalDate: accountBookRemovalType[];
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData>({
    user: null,
    name: "",
    loading: true,
  });
  const [invitesData, setInvitesData] = useState<accountBookInvitesType[]>([]);
  const [removalDate, setRemovalData] = useState<accountBookRemovalType[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      firebaseAuth,
      async (firebaseUser) => {
        if (firebaseUser) {
          const uid = firebaseUser.uid;
          const firestoreUserData = await getUserData(uid);
          if (firestoreUserData) {
            setUserData({
              user: firebaseUser,
              name: firestoreUserData.name,
              loading: false,
            });
          } else {
            console.log("取userDoc有誤");
            console.log("uid", uid);
            setUserData({
              user: null,
              name: "",
              loading: false,
            });
          }
        } else {
          setUserData({
            user: null,
            name: "",
            loading: false,
          });
        }
      }
    );
    return () => unsubscribe();
  }, []);
  useEffect(() => {
    const id = userData?.user?.uid;
    let unsubscribe: () => void;
    if (id) {
      unsubscribe = watchAccountBookInvites(id, (invitesArr) => {
        setInvitesData(invitesArr);
      });
    }
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userData]);
  useEffect(() => {
    const uid = userData?.user?.uid;
    let unsubscribe: () => void;
    if (uid) {
      unsubscribe = watchAccountBookRemoval(uid, (removals) => {
        setRemovalData(removals);
      });
    }
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userData?.user?.uid]);

  return (
    <AuthContext.Provider value={{ ...userData, invitesData, removalDate }}>
      {children}
    </AuthContext.Provider>
  );
}
