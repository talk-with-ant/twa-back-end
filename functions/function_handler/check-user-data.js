const db = require("../database/database");
const { Payload } = require("dialogflow-fulfillment");
const linePayload = require("../helper/payload");

module.exports = async (agent) => {
  try {
    const session = agent.session;
    const userId = session.split("/")[4];
    const courseName = agent.parameters.courseName;
    let courseId;
    let orderId;

    const courseRef = db.collection("Training Courses");

    const snapshot = await courseRef.where("courseName", "==", courseName).get();
    snapshot.forEach((doc) => {
      courseId = doc.id;
    });

    const userRef = await courseRef
      .doc(`${courseId}`)
      .collection("users")
      .where("userId", "==", userId)
      .get();
    userRef.forEach((doc) => {
      orderId = doc.id;
    });

    if (orderId) {
      agent.add("คุณสมัครคอร์สนี้ไปแล้วน้า ลองดูคอร์สอื่นนะ");
    } else {
      const userColleRef = await db.collection("Users").doc(`${userId}`).get();
      let payloadJson;
      if (userColleRef.data() === undefined) {
        payloadJson = linePayload.formButton(courseName, courseId);
        let payload = new Payload(`LINE`, payloadJson, { sendAsMessage: true });
        agent.add(payload);
      } else {
        const name = userColleRef.data().name;
        const tel = userColleRef.data().tel;
        const email = userColleRef.data().email;
        payloadJson = linePayload.userInfo(name, tel, email);
        let payload = new Payload(`LINE`, payloadJson, { sendAsMessage: true });
        agent.add(payload);
      }
    }
  } catch (error) {
    console.log(error);
  }
};