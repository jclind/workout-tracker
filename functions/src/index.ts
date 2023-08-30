import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
// import * as cors from 'cors'
admin.initializeApp()
// const firestore = admin.firestore()
// const db = admin.firestore()
// // Start writing functions
// // https://firebase.google.com/docs/functions/typescript
//

// const corsHandler = cors({ origin: true })

// export const sendFriendRequestEmail = functions.https.onRequest(
//   async (req, res) => {
//     corsHandler(req, res, async () => {
//       try {
//         // Verify the Firebase ID token in the request headers
//         const idToken = req.headers.authorization
//         if (!idToken) throw new Error('Token not valid')
//         const decodedToken = await admin.auth().verifyIdToken(idToken)
//         const uid = decodedToken.uid

//         if (!uid) throw new Error('Not authenticated')

//         const friendUID = req.body.friendUID

//         // Get the user's email from Firebase Authentication using the friendUID
//         const friendUser = await admin.auth().getUser(friendUID)
//         const friendEmail = friendUser.email

//         // Pre-written email data
//         const mailData = {
//           to: friendEmail,
//           subject: 'Friend Request',
//           text: 'You have received a friend request.',
//           html: '<p>You have received a friend request.</p>',
//         }

//         // Add the mail data to the 'mail' collection
//         await firestore.collection('mail').add(mailData)

//         res
//           .status(200)
//           .json({ message: 'Friend request email sent successfully.' })
//       } catch (error) {
//         console.error('Error sending friend request email:', error)
//         res
//           .status(500)
//           .json({ error: 'An error occurred while sending the email.' })
//       }
//     })
//   }
// )
export const sendFriendMail = functions.https.onCall(async (data, context) => {
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
})
