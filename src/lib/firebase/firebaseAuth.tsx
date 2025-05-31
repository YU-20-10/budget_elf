"use client";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { firebaseAuth } from "@/lib/firebase/firebaseConfig";


export async function authSignUp(email: string, password: string) {
  try {
    // 在authentication上註冊
    const userCredential = await createUserWithEmailAndPassword(
      firebaseAuth,
      email,
      password
    );
    const userData = userCredential.user;
    return userData;
  } catch (error) {
    console.log("註冊失敗", error);
    throw error;
  }
}

export async function authSignIn(email: string, password: string) {
  try {
    // 使用authentication登入
    const rowUserData = await signInWithEmailAndPassword(
      firebaseAuth,
      email,
      password
    );
    const userData = rowUserData.user;
    return userData;
  } catch (error) {
    console.log("登入失敗", error);
    throw error;
  }
}

export async function userSignOut() {
  try {
    await signOut(firebaseAuth);
  } catch (error) {
    console.log("登出失敗", error);
    throw error;
  }
}
