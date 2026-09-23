import { useLanguage } from '../../../i18n/LanguageContext';
import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../../../utils/firebase';
import { collection, query, where, onSnapshot, doc, addDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function CommunitySection() {
  const { t } = useLanguage();

  const [experts, setExperts] = useState([]);
  const [posts, setPosts] = useState([]);
  
  const [newUpdateTitle, setNewUpdateTitle] = useState('');
  const [newUpdateDesc, setNewUpdateDesc] = useState('');
  const [updateImage, setUpdateImage] = useState(null);

  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostDesc, setNewPostDesc] = useState('');
  
  const [commentText, setCommentText] = useState({});

  const [profile, setProfile] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [modalType, setModalType] = useState('followers'); // 'followers' or 'following'

  const getCurrentUid = () => {
    if (auth.currentUser?.uid) return auth.currentUser.uid;
    const localUid = localStorage.getItem('nagroms_uid');
    if (localUid) return localUid;
    const token = localStorage.getItem('nagroms_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload?.user_id) return payload.user_id;
        if (payload?.uid) return payload.uid;
        if (payload?.sub) return payload.sub;
      } catch (e) {}
    }
    return null;
  };

  useEffect(() => {
    let unsubs = [];
    
    const initListeners = (currentUid) => {
      if (!currentUid) return;

      // Profile
      const docRef = doc(db, 'users', currentUid);
      unsubs.push(onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        }
      }, (err) => console.warn('User profile snapshot error:', err)));

      // State trackers for Following
      let followsList = [];
      let connList = [];
      let efList = [];

      const syncAllFollowing = () => {
        const map = new Map();

        followsList.forEach(f => {
          if (f.followingId && f.followingId !== currentUid) {
            map.set(f.followingId, {
              id: f.id,
              followingId: f.followingId,
              followingName: f.followingName || 'User'
            });
          }
        });

        connList.forEach(c => {
          if (c.requesterId === currentUid && c.targetId && c.status !== 'declined') {
            if (!map.has(c.targetId)) {
              map.set(c.targetId, {
                id: c.id,
                followingId: c.targetId,
                followingName: c.targetName || 'User'
              });
            }
          } else if (c.targetId === currentUid && c.requesterId && (c.status === 'accepted' || c.status === 'connected')) {
            if (!map.has(c.requesterId)) {
              map.set(c.requesterId, {
                id: c.id,
                followingId: c.requesterId,
                followingName: c.requesterName || 'User'
              });
            }
          }
        });

        efList.forEach(ef => {
          if (ef.expertId && ef.expertId !== currentUid && ef.status !== 'declined') {
            if (!map.has(ef.expertId)) {
              map.set(ef.expertId, {
                id: ef.id,
                followingId: ef.expertId,
                followingName: ef.name || 'Expert'
              });
            }
          }
        });

        setFollowing(Array.from(map.values()));
      };

      // State trackers for Followers
      let followsFollowersList = [];
      let connFollowersList = [];
      let efFollowersList = [];

      const syncAllFollowers = () => {
        const map = new Map();

        followsFollowersList.forEach(f => {
          if (f.followerId && f.followerId !== currentUid) {
            map.set(f.followerId, {
              id: f.id,
              followerId: f.followerId,
              followerName: f.followerName || 'User'
            });
          }
        });

        connFollowersList.forEach(c => {
          if (c.targetId === currentUid && c.requesterId && c.status !== 'declined') {
            if (!map.has(c.requesterId)) {
              map.set(c.requesterId, {
                id: c.id,
                followerId: c.requesterId,
                followerName: c.requesterName || 'User'
              });
            }
          }
        });

        efFollowersList.forEach(ef => {
          if (ef.expertId === currentUid && ef.memberId) {
            if (!map.has(ef.memberId)) {
              map.set(ef.memberId, {
                id: ef.id,
                followerId: ef.memberId,
                followerName: ef.name || 'User'
              });
            }
          }
        });

        setFollowers(Array.from(map.values()));
      };

      // Listeners for Following:
      unsubs.push(onSnapshot(query(collection(db, 'follows'), where('followerId', '==', currentUid)), (snap) => {
        followsList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        syncAllFollowing();
      }, (err) => console.warn('Follows snapshot error:', err)));

      unsubs.push(onSnapshot(query(collection(db, 'connections'), where('requesterId', '==', currentUid)), (snap) => {
        connList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        syncAllFollowing();
      }, (err) => console.warn('Connections snapshot error:', err)));

      unsubs.push(onSnapshot(query(collection(db, 'expertFarmers'), where('memberId', '==', currentUid)), (snap) => {
        efList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        syncAllFollowing();
      }, (err) => console.warn('ExpertFarmers snapshot error:', err)));

      // Listeners for Followers:
      unsubs.push(onSnapshot(query(collection(db, 'follows'), where('followingId', '==', currentUid)), (snap) => {
        followsFollowersList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        syncAllFollowers();
      }, (err) => console.warn('Followers follows snapshot error:', err)));

      unsubs.push(onSnapshot(query(collection(db, 'connections'), where('targetId', '==', currentUid)), (snap) => {
        connFollowersList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        syncAllFollowers();
      }, (err) => console.warn('Followers connections snapshot error:', err)));

      unsubs.push(onSnapshot(query(collection(db, 'expertFarmers'), where('expertId', '==', currentUid)), (snap) => {
        efFollowersList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        syncAllFollowers();
      }, (err) => console.warn('Followers expertFarmers snapshot error:', err)));

      // Experts
      unsubs.push(onSnapshot(collection(db, 'users'), (snap) => {
        const arr = [];
        snap.forEach(docSnap => {
          const uData = docSnap.data();
          const isExpert = uData.role === 'expert' || uData.role === 'Expert' || (Array.isArray(uData.roles) && uData.roles.includes('expert'));
          if (isExpert && docSnap.id !== currentUid) {
            arr.push({ id: docSnap.id, ...uData });
          }
        });
        setExperts(arr);
      }, (err) => console.warn('Users snapshot error:', err)));

      // Community Posts
      const qPosts = query(collection(db, 'communityPosts'));
      unsubs.push(onSnapshot(qPosts, (snap) => {
        const arr = [];
        snap.forEach(doc => {
          const p = { id: doc.id, ...doc.data(), comments: [] };
          arr.push(p);
          unsubs.push(onSnapshot(collection(db, `communityPosts/${doc.id}/comments`), (cSnap) => {
            const cArr = [];
            cSnap.forEach(cDoc => cArr.push({ id: cDoc.id, ...cDoc.data() }));
            setPosts(prev => prev.map(post => post.id === doc.id ? { ...post, comments: cArr } : post));
          }, (err) => console.warn('Comments snapshot error:', err)));
        });
        setPosts(arr);
      }, (err) => console.warn('Posts snapshot error:', err)));
    };

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      unsubs.forEach(u => u());
      unsubs = [];
      const activeUid = user?.uid || getCurrentUid();
      if (activeUid) {
        initListeners(activeUid);
      }
    });

    const fallbackUid = getCurrentUid();
    if (fallbackUid) {
      initListeners(fallbackUid);
    }

    return () => {
      unsubscribeAuth();
      unsubs.forEach(u => u());
    };
  }, []);

  const handleCreateUpdate = async (e) => {
    e.preventDefault();
    const currentUid = getCurrentUid();
    if (!currentUid) return;
    try {
      const token = localStorage.getItem('nagroms_token') || (auth.currentUser ? await auth.currentUser.getIdToken().catch(() => '') : '');
      let imageUrl = '';
      if (updateImage && auth.currentUser) {
        try {
          const imageRef = ref(storage, `farmerUpdates/${currentUid}/${Date.now()}_${updateImage.name}`);
          const snap = await uploadBytes(imageRef, updateImage);
          imageUrl = await getDownloadURL(snap.ref);
        } catch (imgError) {
          console.warn('Image upload failed, proceeding without image:', imgError);
          imageUrl = '';
        }
      }

      await fetch('http://localhost:5000/api/farmer/updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ title: newUpdateTitle, description: newUpdateDesc, imageUrl })
      });
      setNewUpdateTitle('');
      setNewUpdateDesc('');
      setUpdateImage(null);
      alert(t('farmer.services.farmerUpdates'));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    const currentUid = getCurrentUid();
    if (!currentUid) return;
    try {
      const token = localStorage.getItem('nagroms_token') || (auth.currentUser ? await auth.currentUser.getIdToken().catch(() => '') : '');
      await fetch('http://localhost:5000/api/farmer/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ title: newPostTitle, description: newPostDesc })
      });
      setNewPostTitle('');
      setNewPostDesc('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (postId) => {
    const currentUid = getCurrentUid();
    if (!currentUid || !commentText[postId]) return;
    try {
      const token = localStorage.getItem('nagroms_token') || (auth.currentUser ? await auth.currentUser.getIdToken().catch(() => '') : '');
      await fetch(`http://localhost:5000/api/farmer/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ text: commentText[postId] })
      });
      setCommentText(prev => ({ ...prev, [postId]: '' }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLikePost = async (postId) => {
    const currentUid = getCurrentUid();
    if (!currentUid) return;
    try {
      const token = localStorage.getItem('nagroms_token') || (auth.currentUser ? await auth.currentUser.getIdToken().catch(() => '') : '');
      await fetch(`http://localhost:5000/api/farmer/community/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleFollow = async (targetUserId, targetUserName) => {
    const currentUid = getCurrentUid();
    if (!currentUid || !targetUserId) return;
    if (following.some(f => f.followingId === targetUserId)) return;

    const safeTargetName = (targetUserName && typeof targetUserName === 'string' && targetUserName.trim() !== '')
      ? targetUserName
      : 'Expert';

    const newFollowObj = {
      id: `${currentUid}_${targetUserId}`,
      followingId: targetUserId,
      followingName: safeTargetName
    };

    // 1. Optimistic UI update so count & button toggle IMMEDIATELY
    setFollowing(prev => {
      if (prev.some(f => f.followingId === targetUserId)) return prev;
      return [...prev, newFollowObj];
    });

    try {
      const userEmail = auth.currentUser?.email || localStorage.getItem('userEmail') || '';
      const fallbackName = userEmail.includes('@') ? userEmail.split('@')[0] : 'Farmer';
      
      const followerName = (profile?.fullName && String(profile.fullName).trim() !== '') ? profile.fullName :
                           (profile?.name && String(profile.name).trim() !== '') ? profile.name :
                           (profile?.email && profile.email.includes('@')) ? profile.email.split('@')[0] :
                           (localStorage.getItem('userName') || fallbackName);

      const followId = `${currentUid}_${targetUserId}`;
      const connId = `${currentUid}_${targetUserId}`;
      const expertFarmerId = `${targetUserId}_${currentUid}`;

      // 1. Create/update record in 'follows' collection
      await setDoc(doc(db, 'follows', followId), {
        followerId: currentUid,
        followingId: targetUserId,
        followerName: String(followerName),
        followingName: String(safeTargetName),
        createdAt: new Date().toISOString()
      }, { merge: true }).catch(e => console.warn('Follows setDoc warn:', e));

      // 2. Create/update record in 'connections' collection
      await setDoc(doc(db, 'connections', connId), {
        requesterId: currentUid,
        targetId: targetUserId,
        status: 'accepted',
        expertAcknowledged: true,
        createdAt: new Date().toISOString()
      }, { merge: true }).catch(e => console.warn('Connections setDoc warn:', e));

      // 3. Create/update record in 'expertFarmers' collection
      await setDoc(doc(db, 'expertFarmers', expertFarmerId), {
        expertId: targetUserId,
        memberId: currentUid,
        memberRole: 'farmer',
        name: String(followerName),
        status: 'active',
        connectedAt: new Date().toISOString()
      }, { merge: true }).catch(e => console.warn('ExpertFarmers setDoc warn:', e));

      // Backend API call fallback
      const token = localStorage.getItem('nagroms_token') || (auth.currentUser ? await auth.currentUser.getIdToken().catch(() => null) : null);
      if (token) {
        fetch('http://localhost:5000/api/network/toggle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ targetId: targetUserId, currentlyConnected: false })
        }).catch(err => console.warn('Backend toggle follow err:', err));
      }

    } catch (err) {
      console.error('Error following user:', err);
    }
  };

  const handleUnfollow = async (targetUserId) => {
    const currentUid = getCurrentUid();
    if (!currentUid || !targetUserId) return;

    // 1. Optimistic UI update so count & button toggle IMMEDIATELY
    setFollowing(prev => prev.filter(f => f.followingId !== targetUserId));

    try {
      const followId = `${currentUid}_${targetUserId}`;
      const connId = `${currentUid}_${targetUserId}`;
      const expertFarmerId = `${targetUserId}_${currentUid}`;

      await deleteDoc(doc(db, 'follows', followId)).catch(() => {});
      await deleteDoc(doc(db, 'connections', connId)).catch(() => {});
      await deleteDoc(doc(db, 'expertFarmers', expertFarmerId)).catch(() => {});

      // Clean up any auto-ID docs in follows collection matching targetUserId
      const existingFollows = following.filter(f => f.followingId === targetUserId);
      for (const item of existingFollows) {
        if (item.id && item.id !== followId) {
          await deleteDoc(doc(db, 'follows', item.id)).catch(() => {});
        }
      }

      // Backend API call fallback
      const token = localStorage.getItem('nagroms_token') || (auth.currentUser ? await auth.currentUser.getIdToken().catch(() => null) : null);
      if (token) {
        fetch('http://localhost:5000/api/network/toggle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ targetId: targetUserId, currentlyConnected: true })
        }).catch(err => console.warn('Backend toggle unfollow err:', err));
      }
    } catch (err) {
      console.error('Error unfollowing:', err);
    }
  };

  const handleConsult = async (expertId) => {
    const currentUid = getCurrentUid();
    if (!currentUid || !expertId) return;
    try {
      const userEmail = auth.currentUser?.email || localStorage.getItem('userEmail') || '';
      const fallbackName = userEmail.includes('@') ? userEmail.split('@')[0] : 'Farmer';
      
      const followerName = (profile?.fullName && String(profile.fullName).trim() !== '') ? profile.fullName :
                           (profile?.name && String(profile.name).trim() !== '') ? profile.name :
                           (profile?.email && profile.email.includes('@')) ? profile.email.split('@')[0] :
                           (localStorage.getItem('userName') || fallbackName);

      // Attempt direct Firestore addDoc first
      await addDoc(collection(db, 'consultations'), {
        expertId: expertId,
        farmerId: currentUid,
        farmerName: String(followerName),
        status: 'pending',
        message: 'I need consultation.',
        createdAt: new Date().toISOString()
      });
      alert(t('farmer.services.requestSent') || 'Consultation request sent!');
    } catch (err) {
      console.warn('Direct Firestore consultation failed, attempting backend endpoint...', err);
      try {
        const token = localStorage.getItem('nagroms_token') || (auth.currentUser ? await auth.currentUser.getIdToken().catch(() => null) : null);
        const res = await fetch('http://localhost:5000/api/farmer/consultations/request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ expertId, message: 'I need consultation.' })
        });
        if (res.ok) {
          alert(t('farmer.services.requestSent') || 'Consultation request sent!');
          return;
        }
      } catch (backendErr) {
        console.error('Backend consultation request error:', backendErr);
      }
      alert('Failed to send consultation request.');
    }
  };

  return (
    <div className="nagro-section-content" style={{ paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', margin: 0 }}>{t('farmer.community.title')}</h2>
        
        {/* Followers / Following Stats */}
        <div style={{ display: 'flex', gap: '16px', backgroundColor: 'white', padding: '8px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <div 
            onClick={() => { setModalType('followers'); setShowFollowModal(true); }}
            style={{ cursor: 'pointer', textAlign: 'center', transition: 'color 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.color = '#16a34a'}
            onMouseOut={(e) => e.currentTarget.style.color = 'inherit'}
          >
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>{followers.length}</div>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>{t('farmer.community.followers')}</div>
          </div>
          <div style={{ width: '1px', backgroundColor: '#e5e7eb' }}></div>
          <div 
            onClick={() => { setModalType('following'); setShowFollowModal(true); }}
            style={{ cursor: 'pointer', textAlign: 'center', transition: 'color 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.color = '#16a34a'}
            onMouseOut={(e) => e.currentTarget.style.color = 'inherit'}
          >
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>{following.length}</div>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>{t('farmer.community.following')}</div>
          </div>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Farmer Updates */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', marginBottom: '16px' }}>{t('farmer.services.farmerUpdates')}</h3>
          <form onSubmit={handleCreateUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input required type="text" placeholder={t('farmer.services.updateTitle')} value={newUpdateTitle} onChange={e => setNewUpdateTitle(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
            <textarea required placeholder={t('farmer.services.updateDescription')} rows="3" value={newUpdateDesc} onChange={e => setNewUpdateDesc(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}></textarea>
            <input type="file" id="communityUpdateImageInput" accept="image/*" onChange={e => setUpdateImage(e.target.files[0])} style={{ display: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button type="button" onClick={() => document.getElementById("communityUpdateImageInput").click()} style={{ padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: '#f9fafb', cursor: 'pointer', fontSize: '12px', color: '#374151' }}>
                {t("farmer.settings.chooseFile") || 'Choose File'}
              </button>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                {updateImage ? updateImage.name : (t("farmer.settings.noFileChosen") || 'No file chosen')}
              </span>
            </div>
            <button type="submit" style={{ padding: '8px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>{t('farmer.services.postUpdate')}</button>
          </form>
        </div>

        {/* Available Experts & Service Providers */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', marginBottom: '16px' }}>{t('farmer.services.availableExperts')}</h3>
          {experts.length === 0 ? <p style={{ color: '#6b7280' }}>{t('farmer.services.noExperts')}</p> : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '300px', overflowY: 'auto' }}>
              {experts.map(expert => (
                <li key={expert.id} style={{ padding: '12px 0', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: 600, color: '#111827', margin: 0 }}>{expert.fullName || expert.name || expert.email || 'Expert'}</p>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>
                      {expert.roles?.includes('service-provider') ? t('farmer.common.notAvailable') : t('farmer.services.expertConsultation')}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {following.some(f => f.followingId === expert.id) ? (
                      <button onClick={() => handleUnfollow(expert.id)} style={{ padding: '6px 12px', borderRadius: '6px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>{t('farmer.community.unfollow')}</button>
                    ) : (
                      <button onClick={() => handleFollow(expert.id, expert.fullName || expert.name || expert.email || 'Expert')} style={{ padding: '6px 12px', borderRadius: '6px', backgroundColor: 'white', color: '#111827', border: '1px solid #d1d5db', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>{t('farmer.community.follow')}</button>
                    )}
                    <button onClick={() => handleConsult(expert.id)} style={{ padding: '6px 12px', borderRadius: '6px', backgroundColor: expert.roles?.includes('service-provider') ? '#e0e7ff' : '#dcfce7', color: expert.roles?.includes('service-provider') ? '#4f46e5' : '#16a34a', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                      {expert.roles?.includes('service-provider') ? t('farmer.services.sendRequest') : t('farmer.services.expertConsultation')}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Community Posts */}
      <div style={{ marginTop: '24px', backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', marginBottom: '16px' }}>{t('farmer.community.title')}</h3>
        
        <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #e5e7eb' }}>
          <input required type="text" placeholder={t('farmer.community.postTitle')} value={newPostTitle} onChange={e => setNewPostTitle(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
          <textarea required placeholder={t('farmer.community.postDescription')} rows="3" value={newPostDesc} onChange={e => setNewPostDesc(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}></textarea>
          <button type="submit" style={{ padding: '8px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', width: 'fit-content' }}>{t('farmer.community.createPost')}</button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {posts.length === 0 ? <p style={{ color: '#6b7280' }}>{t('farmer.community.noPosts')}</p> : posts.map(post => (
            <div key={post.id} style={{ padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h4 style={{ margin: 0, fontSize: '16px', color: '#111827' }}>{post.title}</h4>
                {post.farmerId !== auth.currentUser?.uid && (
                  following.some(f => f.followingId === post.farmerId) ? (
                    <button onClick={() => handleUnfollow(post.farmerId)} style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', cursor: 'pointer', fontSize: '12px' }}>{t('farmer.community.unfollow')}</button>
                  ) : (
                    <button onClick={() => handleFollow(post.farmerId, post.authorName || 'User')} style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: 'white', color: '#111827', border: '1px solid #d1d5db', cursor: 'pointer', fontSize: '12px' }}>{t('farmer.community.follow')}</button>
                  )
                )}
              </div>
              <p style={{ margin: '0 0 16px 0', color: '#4b5563', fontSize: '14px' }}>{post.description}</p>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <button onClick={() => handleLikePost(post.id)} style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #d1d5db', backgroundColor: 'white', cursor: 'pointer', fontSize: '12px' }}>👍 {t('farmer.community.like')} ({post.likesCount || 0})</button>
                <span style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center' }}>💬 {post.commentsCount || 0} {t('farmer.community.comment')}</span>
              </div>
              
              <div style={{ paddingLeft: '16px', borderLeft: '2px solid #e5e7eb' }}>
                {(post.comments || []).map(c => (
                  <p key={c.id} style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#374151' }}>{c.text}</p>
                ))}
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <input type="text" placeholder={t('farmer.community.comment')} value={commentText[post.id] || ''} onChange={e => setCommentText({...commentText, [post.id]: e.target.value})} style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '12px' }} />
                  <button onClick={() => handleAddComment(post.id)} style={{ padding: '6px 12px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>{t('farmer.community.comment')}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    {/* Follow/Following Modal */}
      {showFollowModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '350px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', margin: 0 }}>
                {modalType === 'followers' ? t('farmer.community.followers') : t('farmer.community.following')}
              </h3>
              <button onClick={() => setShowFollowModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6b7280' }}>&times;</button>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '300px', overflowY: 'auto' }}>
              {modalType === 'followers' ? (
                followers.length === 0 ? <p style={{ color: '#6b7280', fontSize: '14px', textAlign: 'center' }}>{t('farmer.community.noPosts')}</p> :
                followers.map(f => (
                  <li key={f.id} style={{ padding: '12px 0', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 500, color: '#111827' }}>{f.followerName}</span>
                  </li>
                ))
              ) : (
                following.length === 0 ? <p style={{ color: '#6b7280', fontSize: '14px', textAlign: 'center' }}>{t('farmer.community.noPosts')}</p> :
                following.map(f => (
                  <li key={f.id} style={{ padding: '12px 0', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 500, color: '#111827' }}>{f.followingName}</span>
                    <button onClick={() => handleUnfollow(f.followingId)} style={{ padding: '4px 10px', borderRadius: '6px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', cursor: 'pointer', fontSize: '12px', fontWeight: 500 }}>{t('farmer.community.unfollow')}</button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}

    </div>
  );
}
