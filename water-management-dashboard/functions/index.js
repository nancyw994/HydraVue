const functions = require("firebase-functions");
const admin = require("firebase-admin");

// 初始化 Firebase Admin SDK 以连接 Firestore
admin.initializeApp();
const db = admin.firestore();

exports.getIrrigationAdvice = functions.https.onRequest(async (req, res) => {
  try {
    // 解析前端传来的数据
    const {farmName, cropType, area, address, latitude, longitude} = req.body;

    // 将农场数据存储到 Firestore
    const farmRef = db.collection("farms").doc();
    await farmRef.set({
      farmName,
      cropType,
      area,
      address,
      latitude,
      longitude,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 模拟 AI 生成的灌溉建议（实际可替换为 AI API 调用）
    const irrigationAdvice = `建议在 ${farmName} (作物: ${cropType}) 上每亩灌溉 500 升水`;

    // 返回建议
    res.json({advice: irrigationAdvice});
  } catch (error) {
    console.error("存储到 Firestore 失败：", error);
    res.status(500).json({error: "数据库存储失败"});
  }
});
