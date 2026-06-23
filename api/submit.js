// Vercel Serverless Function - 提交到飞书多维表格
const https = require('https');

const FEISHU_API_HOST = 'open.feishu.cn';

async function getTenantAccessToken(appId, appSecret) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: FEISHU_API_HOST,
      path: '/open-apis/auth/v3/tenant_access_token/internal',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.code === 0) {
            resolve(result.tenant_access_token);
          } else {
            reject(new Error(`获取 Token 失败: ${result.msg}`));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify({ app_id: appId, app_secret: appSecret }));
    req.end();
  });
}

async function createRecord(token, appToken, tableId, fields) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ fields });

    const options = {
      hostname: FEISHU_API_HOST,
      path: `/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

module.exports = async function handler(req, res) {
  // CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只支持 POST 请求' });
  }

  try {
    const { name, phone, wechat, diagnosis } = req.body;

    // 验证必填字段
    if (!name || !phone) {
      return res.status(400).json({ error: '姓名和电话为必填项' });
    }

    // 手机号格式验证
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ error: '手机号格式不正确' });
    }

    // 获取环境变量
    const appId = process.env.FEISHU_APP_ID;
    const appSecret = process.env.FEISHU_APP_SECRET;
    const appToken = process.env.FEISHU_APP_TOKEN;
    const tableId = process.env.FEISHU_TABLE_ID;

    if (!appId || !appSecret || !appToken || !tableId) {
      console.error('缺少飞书环境变量配置');
      return res.status(500).json({ error: '服务器配置错误，请联系管理员' });
    }

    // 获取 Token
    const token = await getTenantAccessToken(appId, appSecret);

    // 构建字段（字段名必须与飞书多维表格列名完全匹配）
    const fields = {
      '姓名': name,
      '电话': phone,
      '微信': wechat || '',
      '提交时间': new Date().toISOString(),
      '诊断类型': diagnosis?.type || '',
      '画像标签': diagnosis?.tag || '',
      '产能底气': diagnosis?.dimensions?.capacity || 0,
      '市场嗅觉': diagnosis?.dimensions?.market || 0,
      '行动惯性': diagnosis?.dimensions?.action || 0,
      '决策算账': diagnosis?.dimensions?.decision || 0,
    };

    // 写入飞书
    const result = await createRecord(token, appToken, tableId, fields);

    if (result.code === 0) {
      return res.status(200).json({ success: true, recordId: result.data?.record?.record_id });
    } else {
      console.error('飞书 API 错误:', result);
      return res.status(500).json({ error: result.msg || '提交失败' });
    }
  } catch (error) {
    console.error('提交错误:', error);
    return res.status(500).json({ error: '服务器错误，请稍后重试' });
  }
};
