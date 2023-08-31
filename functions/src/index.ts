import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

type FriendsData = {
  friendUID: string
  friendUsername: string
  dateFriended: number
}
type FriendsStatusType = 'friends' | 'pending' | 'requested' | 'not_friends'

type PendingFriendData = {
  friendUID: string
  pendingUsername: string
  datePending: number
}
type RequestedFriendData = {
  friendUID: string
  requestedUsername: string
  dateRequested: number
}
export type UserProfileDataType = {
  createdAt: number
  displayName: string
  photoUrl: string
  username: string
  totalWorkouts: number
  totalExercises: number
  lastActive?: number
}
export type CombinedRequestedFriendDataType = RequestedFriendData &
  UserProfileDataType

admin.initializeApp()
const firestore = admin.firestore()

// Friend cloud functions

export const sendFriendRequestEmail = functions.https.onCall(
  async (data, context) => {
    // try {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'only authenticated users can request'
      )
    }
    if (!data.currUID || !data.friendUID || context.auth.uid !== data.currUID) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'uid data not provided / invalid'
      )
    }

    const friendData = await admin.auth().getUser(data.friendUID)
    const currUserData = await admin.auth().getUser(data.currUID)
    const currName = currUserData.displayName
    const currProfilePicture = currUserData.photoURL
    const friendEmail = friendData.email
    const friendName = friendData.displayName

    const to = [friendEmail]
    const message = {
      html: `<body style="background-color: #09090b; margin: 0; padding: 0; font-family: Arial, sans-serif; color: #ffffff;">

    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto;">
        <tr>
            <td align="center" bgcolor="#17171b" style="padding: 40px;">
                <img src="https://firebasestorage.googleapis.com/v0/b/workout-tracker-69161.appspot.com/o/PumpTrack-logos_white.png?alt=media&token=7e25e8e4-b95c-4713-ba52-2a1b98f6b956" alt="PumpTrack Logo" width="150" style="display: block; margin: 0 auto;">
                <h2 style="color: #855ae1; margin-top: 30px;">Friend Request</h2>
                <p style="margin-top: 20px;">Hello ${friendName},</p>
                <p style="color: #8e8e8e;">You have received a friend request from ${currName} on PumpTrack.</p>

                <!-- Friend Card -->
                <div style="border: 1px solid #555; padding: 20px; margin-top: 30px; text-align: center;">
                    <img src="${currProfilePicture}" alt="Friend's Profile Picture" width="80" style="border-radius: 50%;">
                    <h3 style="color: #855ae1; margin-top: 10px;">${currName}</h3>
                    <p style="color: #8e8e8e;">@${data.currUsername}</p>
                    <a href="https://pumptrack.netlify.app/user/${data.currUsername}" style="display: inline-block; background-color: #855ae1; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Accept Request</a>
                </div>
                <!-- End of Friend Card -->

                <p style="color: #8e8e8e; margin-top: 20px;">If you have any questions or need assistance, feel free to contact our support team.</p>
                <p style="color: #8e8e8e;">Best regards,</p>
                <p style="color: #8e8e8e;">The PumpTrack Team</p>
            </td>
        </tr>
        <tr>
            <td align="center" bgcolor="#3b3b3f" style="padding: 30px; font-size: 12px; color: rgb(119, 119, 119);">
                <p style="margin: 0;">This email was sent from an automated system. Please do not reply to this email.</p>
                <p style="margin: 10px 0 0;">You are receiving this email because you have a registered account on PumpTrack. If you believe you received this email in error, please disregard it.</p>
            </td>
        </tr>
    </table>

</body>`,
      subject: 'New Friend Request',
      text: `Friend Request

Hello ${friendName},

You have received a friend request from ${currName} on PumpTrack.

Friend's Details:
${currName}
@${data.currUsername}

To accept the request, click the link below:
Accept Request

If you have any questions or need assistance, feel free to contact our support team.

Best regards,
The PumpTrack Team

This email was sent from an automated system. Please do not reply to this email.

You are receiving this email because you have a registered account on PumpTrack. If you believe you received this email in error, please disregard it.`,
    }
    const mailCollection = admin.firestore().collection('mail')
    return mailCollection.add({ to, message }).then(res => {
      return 'test'
    })

    // } catch (error) {
    //   throw new functions.https.HttpsError(
    //     'cancelled',
    //     'something went wrong in the try block'
    //   )
    // }
  }
)
export const sendFriendAcceptedEmail = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'only authenticated users can request'
      )
    }
    if (!data.currUID || !data.friendUID || context.auth.uid !== data.currUID) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'uid data not provided / invalid'
      )
    }

    const friendData = await admin.auth().getUser(data.friendUID)
    const currUserData = await admin.auth().getUser(data.currUID)
    const currName = currUserData.displayName
    const currProfilePicture = currUserData.photoURL
    const friendEmail = friendData.email
    const friendName = friendData.displayName

    const to = [friendEmail]
    const message = {
      html: `<body style="background-color: #09090b; margin: 0; padding: 0; font-family: Arial, sans-serif; color: #ffffff;">

              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto;">
                  <tr>
                      <td align="center" bgcolor="#17171b" style="padding: 40px;">
                          <img src="https://firebasestorage.googleapis.com/v0/b/workout-tracker-69161.appspot.com/o/PumpTrack-logos_white.png?alt=media&token=7e25e8e4-b95c-4713-ba52-2a1b98f6b956" alt="PumpTrack Logo" width="150" style="display: block; margin: 0 auto;">
                          <h2 style="color: #855ae1; margin-top: 30px;">Friend Request</h2>
                          <p style="margin-top: 20px;">Hello ${friendName},</p>
                          <p style="color: #8e8e8e;">You have received a friend request from ${currName} on PumpTrack.</p>

                          <!-- Friend Card -->
                          <div style="border: 1px solid #555; padding: 20px; margin-top: 30px; text-align: center;">
                              <img src="${currProfilePicture}" alt="Friend's Profile Picture" width="80" style="border-radius: 50%;">
                              <h3 style="color: #855ae1; margin-top: 10px;">${currName}</h3>
                              <p style="color: #8e8e8e;">@${data.currUsername}</p>
                              <a href="https://pumptrack.netlify.app/user/${data.currUsername}" style="display: inline-block; background-color: #855ae1; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Accept Request</a>
                          </div>
                          <!-- End of Friend Card -->

                          <p style="color: #8e8e8e; margin-top: 20px;">If you have any questions or need assistance, feel free to contact our support team.</p>
                          <p style="color: #8e8e8e;">Best regards,</p>
                          <p style="color: #8e8e8e;">The PumpTrack Team</p>
                      </td>
                  </tr>
                  <tr>
                      <td align="center" bgcolor="#3b3b3f" style="padding: 30px; font-size: 12px; color: rgb(119, 119, 119);">
                          <p style="margin: 0;">This email was sent from an automated system. Please do not reply to this email.</p>
                          <p style="margin: 10px 0 0;">You are receiving this email because you have a registered account on PumpTrack. If you believe you received this email in error, please disregard it.</p>
                      </td>
                  </tr>
              </table>

          </body>`,
      subject: 'New Friend Request',
      text: `Friend Request

        Hello ${friendName},

        You have received a friend request from ${currName} on PumpTrack.

        Friend's Details:
        ${currName}
        @${data.currUsername}

        To accept the request, click the link below:
        Accept Request

        If you have any questions or need assistance, feel free to contact our support team.

        Best regards,
        The PumpTrack Team

        This email was sent from an automated system. Please do not reply to this email.

        You are receiving this email because you have a registered account on PumpTrack. If you believe you received this email in error, please disregard it.`,
    }

    const mailCollection = admin.firestore().collection('mail')
    return mailCollection.add({ to, message }).then(res => {
      return 'test'
    })
  }
)
export const getNumberOfFriends = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'only authenticated users can request'
      )
    }

    let numFriends = 0
    await firestore
      .doc(`userProfileData/${data.uid}`)
      .get()
      .then(res => {
        const resData = res.data()
        numFriends = resData?.numFriends || 0
      })

    return numFriends

    // const numFriends = await firestore
    //   .collection(`userProfileData/${data.uid}/friends`).

    // return { numFriends }
  }
)
const checkIfDocExistsInUserCollection = async (
  collection: FriendsStatusType,
  currUID: string,
  friendUID: string
) => {
  const docRef = firestore.doc(
    `userProfileData/${currUID}/${collection}/${friendUID}`
  )
  const docSnapshot = await docRef.get()

  if (docSnapshot.exists) {
    return true
  }

  return false
}
export const checkIfFriends = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'only authenticated users can request'
    )
  }
  if (!data.currUID || !data.friendUID) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'currUID and friendUID must be provided'
    )
  }

  return await checkIfDocExistsInUserCollection(
    'friends',
    data.currUID,
    data.friendUID
  )
})
export const getFriendshipStatusFunc = async (
  currUID: string,
  friendUID: string
) => {
  const isFriends = await checkIfDocExistsInUserCollection(
    'friends',
    currUID,
    friendUID
  )
  if (isFriends) return 'friends'

  const isPending = await checkIfDocExistsInUserCollection(
    'pending',
    currUID,
    friendUID
  )
  if (isPending) return 'pending'

  const isRequested = await checkIfDocExistsInUserCollection(
    'requested',
    currUID,
    friendUID
  )
  if (isRequested) return 'requested'

  return 'not_friends'
}
export const getFriendshipStatus = functions.https.onCall(
  async (data, context): Promise<FriendsStatusType | undefined> => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'only authenticated users can request'
      )
    }
    const currUID = data.currUID
    const friendUID = data.friendUID
    if (!currUID || !friendUID) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'currUID and friendUID must be provided'
      )
    }

    return await getFriendshipStatusFunc(currUID, friendUID)
  }
)
export const addFriend = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'only authenticated users can request'
    )
  }

  const currUID = data.currUID
  const friendUID = data.friendUID
  const currUsername = data.currUsername
  const friendUsername = data.friendUsername

  if (!friendUID || !friendUsername || !currUID || !friendUsername) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'friendUID, friendUsername, friendUsername and currUID must all be provided'
    )
  }

  const isFriends = await checkIfDocExistsInUserCollection(
    'friends',
    currUID,
    friendUID
  )
  if (isFriends) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'users are already friends'
    )
  }

  const isPending = await checkIfDocExistsInUserCollection(
    'pending',
    currUID,
    friendUID
  )
  if (isPending) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'friendship already pending, please refresh'
    )
  }

  const isRequested = await checkIfDocExistsInUserCollection(
    'requested',
    currUID,
    friendUID
  )
  if (isRequested) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'friendship already requested, please refresh'
    )
  }

  const date = new Date().getTime()

  const pendingData: PendingFriendData = {
    datePending: date,
    friendUID,
    pendingUsername: friendUsername,
  }

  const requestedData: RequestedFriendData = {
    dateRequested: date,
    friendUID: currUID,
    requestedUsername: currUsername,
  }

  await firestore
    .doc(`userProfileData/${currUID}/pending/${friendUID}`)
    .set({ ...pendingData })
  await firestore
    .doc(`userProfileData/${friendUID}/requested/${currUID}`)
    .set({ ...requestedData })
})
export const acceptFriendRequest = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'only authenticated users can request'
      )
    }

    const currUID = data.currUID
    const friendUID = data.friendUID
    const friendUsername = data.friendUsername

    if (!friendUID || !friendUsername || !currUID) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'friendUID, friendUsername and currUID must all be provided'
      )
    }

    const isFriends = await checkIfDocExistsInUserCollection(
      'friends',
      currUID,
      friendUID
    )
    if (isFriends) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'users are already friends'
      )
    }
    const isRequested = await checkIfDocExistsInUserCollection(
      'requested',
      currUID,
      friendUID
    )
    if (!isRequested) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'must have requested friend in order to accept'
      )
    }

    const date = new Date().getTime()

    const currUserFriendData: FriendsData = {
      friendUID: data.friendUID,
      friendUsername: data.friendUsername,
      dateFriended: date,
    }

    await firestore
      .doc(`userProfileData/${currUID}/friends/${friendUID}`)
      .set({ ...currUserFriendData })

    const currUserDocRef = firestore.doc(`userProfileData/${currUID}`)

    await currUserDocRef.set(
      {
        numFriends: admin.firestore.FieldValue.increment(1),
      },
      { merge: true }
    )

    return 'test'
  }
)
export const getPendingFriendRequests = functions.https.onCall(
  async (data, context) => {
    if (!data.uid) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'uid must be passed through data object'
      )
    }
    if (!context.auth || context.auth.uid !== data.uid) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'only authenticated users can request'
      )
    }

    const limit = data.limit || 4

    const pendingRequestsQuery = firestore
      .collection(`userProfileData/${data.uid}/requested`)
      .orderBy('dateRequested')
      .limit(limit)
    const pendingRequestsSnapshot = await pendingRequestsQuery.get()

    const pendingRequestsData: CombinedRequestedFriendDataType[] = []
    for (const doc of pendingRequestsSnapshot.docs) {
      const requestData = doc.data() as RequestedFriendData
      const requestUID = requestData.friendUID

      const userDoc = await firestore.doc(`userProfileData/${requestUID}`).get()
      const userData = userDoc.data() as UserProfileDataType

      const combined: CombinedRequestedFriendDataType = {
        ...requestData,
        ...userData,
      }
      pendingRequestsData.push(combined)
    }

    return pendingRequestsData
  }
)
export const getSuggestedFriends = functions.https.onCall(
  async (data, context) => {
    const uid = data.uid
    if (!uid) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'uid must be passed through data object'
      )
    }
    if (!context.auth || context.auth.uid !== uid) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'only authenticated users can request'
      )
    }

    const profilesCollection = firestore.collection('userProfileData')

    const friendsList = []

    let lastDoc
    while (friendsList.length < 6) {
      const currLimit: number = 6 - friendsList.length
      let friendsQ = profilesCollection
        .where('lastActive', '>', 0)
        .orderBy('lastActive', 'desc')
        .limit(currLimit)

      if (lastDoc) {
        friendsQ = friendsQ.startAfter(lastDoc)
      }

      const querySnapshot = await friendsQ.get()

      if (querySnapshot.empty) {
        break
      }

      for (const userDoc of querySnapshot.docs) {
        const friendUID = userDoc.id

        if (friendUID === uid) {
          continue
        }

        const friendStatus = await getFriendshipStatusFunc(uid, friendUID)
        if (friendStatus === 'not_friends') {
          const userData = userDoc.data()
          friendsList.push(userData)
        }
      }

      const docsLength = querySnapshot.docs.length
      if (docsLength < currLimit) {
        break
      }

      lastDoc = querySnapshot.docs[docsLength - 1]
    }

    return friendsList
  }
)
export const removePendingRequest = functions.https.onCall(
  async (data, context) => {
    const currUID = data.currUID
    const friendUID = data.friendUID
    console.log(currUID, friendUID, data)
    if (!currUID || !friendUID) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'currUID and friendUID must be passed through data object'
      )
    }
    if (!context.auth || context.auth.uid !== currUID) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'only authenticated users can request'
      )
    }

    firestore.doc(`userProfileData/${currUID}/pending/${friendUID}`).delete()
    firestore
      .doc(`userProfileData/${friendUID}/requested/${currUID}`)
      .delete()
      .then(() => {
        return 'test'
      })
  }
)

// User cloud functions
export const updateActivity = functions.https.onCall((data, context) => {
  const uid = data.uid
  if (!context.auth || context.auth.uid !== uid) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'only authenticated users can request'
    )
  }

  firestore.doc(`userProfileData/${uid}`).update({
    lastActive: new Date().getTime(),
  })
})
