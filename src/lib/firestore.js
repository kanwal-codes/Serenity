import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from './firebase';

// Groups collection
export const createGroup = async (groupData) => {
  try {
    const docRef = await addDoc(collection(db, 'groups'), {
      ...groupData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating group:', error);
    throw error;
  }
};

export const getGroup = async (groupId) => {
  try {
    const docRef = doc(db, 'groups', groupId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Group not found');
    }
  } catch (error) {
    console.error('Error getting group:', error);
    throw error;
  }
};

export const getUserGroups = async (userId) => {
  try {
    const q = query(
      collection(db, 'groups'),
      where('members', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user groups:', error);
    throw error;
  }
};

export const joinGroup = async (groupId, userId) => {
  try {
    const groupRef = doc(db, 'groups', groupId);
    await updateDoc(groupRef, {
      members: arrayUnion(userId),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error joining group:', error);
    throw error;
  }
};

export const leaveGroup = async (groupId, userId) => {
  try {
    const groupRef = doc(db, 'groups', groupId);
    await updateDoc(groupRef, {
      members: arrayRemove(userId),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error leaving group:', error);
    throw error;
  }
};

// Playlists collection
export const createPlaylist = async (groupId, playlistData) => {
  try {
    const docRef = await addDoc(collection(db, 'groups', groupId, 'playlists'), {
      ...playlistData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating playlist:', error);
    throw error;
  }
};

export const getGroupPlaylists = async (groupId) => {
  try {
    const q = query(
      collection(db, 'groups', groupId, 'playlists'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting playlists:', error);
    throw error;
  }
};

export const addTrackToPlaylist = async (groupId, playlistId, trackData) => {
  try {
    const playlistRef = doc(db, 'groups', groupId, 'playlists', playlistId);
    await updateDoc(playlistRef, {
      tracks: arrayUnion({
        ...trackData,
        addedAt: serverTimestamp()
      }),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error adding track to playlist:', error);
    throw error;
  }
};

// Messages collection
export const sendMessage = async (groupId, messageData) => {
  try {
    const docRef = await addDoc(collection(db, 'groups', groupId, 'messages'), {
      ...messageData,
      timestamp: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const getGroupMessages = async (groupId) => {
  try {
    const q = query(
      collection(db, 'groups', groupId, 'messages'),
      orderBy('timestamp', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
};
