import "./Profile.css";
import { useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function Profile() {
  const [user] = useAuthState(auth);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const docRef = doc(db, "userProfiles", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data());
      } else {
        // Create default profile
        const defaultProfile = {
          displayName: user.displayName || "Anonymous",
          email: user.email,
          createdAt: new Date(),
        };
        await setDoc(docRef, defaultProfile);
        setProfile(defaultProfile);
      }
    };
    fetchProfile();
  }, [user]);

  if (!user) return <p>Please sign in to view your profile.</p>;
  if (!profile) return <p>Loading profile...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Profile</h2>
      <p><strong>Name:</strong> {profile.displayName}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>Member since:</strong> {profile.createdAt?.toDate?.()?.toDateString()}</p>
    </div>
  );
}
