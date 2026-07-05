
import { Redis } from '@upstash/redis';
import crypto from 'crypto';

const LOG_ENABLED = false;

function log(...args) {
  if (LOG_ENABLED) {
    console.log(...args);
  }
}

function errorLog(...args) {
  if (LOG_ENABLED) {
    console.error(...args);
  }
}

if (!process.env.REDIS_URL || !process.env.TOKEN) {
  console.error("Redis configuration missing!");
}

const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.TOKEN
});

function getFingerprintFromHeaders(headers, body) {
  let sessionId = null;
  try {
    sessionId = body?.userId || body?.sessionId;
  } catch (e) {}
  
  if (sessionId) {
    return sessionId;
  }
  
  const ip = headers["x-forwarded-for"] || 
             headers["client-ip"] || 
             headers["x-real-ip"] || 
             "unknown";
  const userAgent = headers["user-agent"] || "unknown";
  
  const cleanUserAgent = userAgent
    .replace(/Chrome\/\d+/g, 'Chrome')
    .replace(/Firefox\/\d+/g, 'Firefox')
    .replace(/Safari\/\d+/g, 'Safari')
    .replace(/Version\/\d+/g, 'Version')
    .replace(/Edge\/\d+/g, 'Edge')
    .replace(/\d+\.\d+\.\d+\.\d+/g, '')
    .substring(0, 100);
  
  return crypto.createHash('md5').update(`${ip}:${cleanUserAgent}`).digest('hex');
}

async function recordPageView(pageName, userData = {}) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const currentHour = new Date().getHours();
    const fingerprint = userData.fingerprint;
    
    const dailyKey = `stats:daily:${today}:${pageName}`;
    const totalKey = `stats:total:${pageName}`;
    
    await redis.incr(dailyKey);
    await redis.expire(dailyKey, 86400 * 30);
    await redis.incr(totalKey);
    
    const hourlyKey = `stats:hourly:${today}:${currentHour}:${pageName}`;
    await redis.incr(hourlyKey);
    await redis.expire(hourlyKey, 86400 * 7);
    
    if (fingerprint && fingerprint !== 'unknown') {
      const uniqueUserKey = `stats:unique:user:${today}:${fingerprint}`;
      const isNewUserToday = await redis.setnx(uniqueUserKey, pageName);
      
      if (isNewUserToday) {
        await redis.expire(uniqueUserKey, 86400);
        await redis.incr(`stats:unique:${today}:total`);
        
        const totalUniqueKey = `stats:unique:total:${fingerprint}`;
        const isTotallyNew = await redis.setnx(totalUniqueKey, pageName);
        if (isTotallyNew) {
          await redis.expire(totalUniqueKey, 86400 * 365);
          await redis.incr(`stats:unique:all:total`);
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Failed to record page view:`, error.message);
    return false;
  }
}

async function recordAction(actionType, userId = null) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const key = `stats:actions:${today}:${actionType}`;
    
    await redis.incr(key);
    await redis.expire(key, 86400 * 30);
    
    if (userId) {
      const userKey = `stats:user:${userId}:actions`;
      await redis.hincrby(userKey, actionType, 1);
      await redis.expire(userKey, 86400 * 90);
    }
    
    return true;
  } catch (error) {
    console.error(`Failed to record action:`, error.message);
    return false;
  }
}

async function getStats(days = 30) {
  try {
    const stats = {
      pages: {},
      dailyViews: {},
      totalViews: 0,
      uniqueVisitors: 0,
      uniqueVisitorsAllTime: 0,
      actions: {},
      popularPages: []
    };
    
    const allPageKeys = await redis.keys('stats:total:*');
    if (allPageKeys.length > 0) {
      const counts = await redis.mget(...allPageKeys);
      allPageKeys.forEach((key, index) => {
        const pageName = key.replace('stats:total:', '');
        const count = counts[index];
        if (count && pageName && pageName !== 'undefined') {
          stats.pages[pageName] = parseInt(count) || 0;
          stats.totalViews += parseInt(count) || 0;
        }
      });
    }
    
    const allTimeUnique = await redis.get(`stats:unique:all:total`);
    stats.uniqueVisitorsAllTime = parseInt(allTimeUnique) || 0;
    
    const daysLimit = Math.min(days, 60);
    const uniqueKeysToFetch = [];
    const datesArray = [];
    
    for (let i = 0; i < daysLimit; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().slice(0, 10);
      datesArray.push(dateStr);
      uniqueKeysToFetch.push(`stats:unique:${dateStr}:total`);
    }
    
    let uniqueSum = 0;
    if (uniqueKeysToFetch.length > 0) {
      const uniqueCounts = await redis.mget(...uniqueKeysToFetch);
      uniqueCounts.forEach(count => {
        if (count) uniqueSum += parseInt(count);
      });
    }
    stats.uniqueVisitors = uniqueSum;
    
    const allDailyKeys = await redis.keys('stats:daily:*');
    const dailyDataMap = {};
    
    if (allDailyKeys.length > 0) {
      const dailyCounts = await redis.mget(...allDailyKeys);
      allDailyKeys.forEach((key, index) => {
        const parts = key.split(':');
        const dateStr = parts[2];
        const count = parseInt(dailyCounts[index]) || 0;
        
        if (dateStr) {
          dailyDataMap[dateStr] = (dailyDataMap[dateStr] || 0) + count;
        }
      });
    }
    
    if (uniqueKeysToFetch.length > 0) {
      const uniqueCounts = await redis.mget(...uniqueKeysToFetch);
      datesArray.forEach((dateStr, index) => {
        stats.dailyViews[dateStr] = {
          total: dailyDataMap[dateStr] || 0,
          unique: parseInt(uniqueCounts[index]) || 0
        };
      });
    }
    
    const actionKeys = await redis.keys('stats:actions:*');
    if (actionKeys.length > 0) {
      const actionCounts = await redis.mget(...actionKeys);
      actionKeys.forEach((key, index) => {
        const parts = key.split(':');
        const actionType = parts[3];
        const count = parseInt(actionCounts[index]) || 0;
        if (actionType) {
          stats.actions[actionType] = (stats.actions[actionType] || 0) + count;
        }
      });
    }
    
    stats.popularPages = Object.entries(stats.pages)
      .filter(([name]) => name && name !== 'undefined')
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
      
    return stats;
  } catch (error) {
    console.error('Error getting stats:', error.message);
    return {
      pages: {},
      dailyViews: {},
      totalViews: 0,
      uniqueVisitors: 0,
      uniqueVisitorsAllTime: 0,
      actions: {},
      popularPages: []
    };
  }
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  let action = 'get';
  try {
    action = req.query.action || 'get';
  } catch (e) {}
  
  if (req.method === 'POST' && action === 'track') {
    try {
      const body = req.body || {};
      const { page, userId } = body;
      
      if (!page) {
        return res.status(400).json({ error: 'Page name is required' });
      }
      
      const fingerprint = getFingerprintFromHeaders(req.headers, body);
      const finalFingerprint = userId || fingerprint;
      
      await recordPageView(page, { fingerprint: finalFingerprint, userId });
      
      return res.status(200).json({ success: true, message: `Tracked: ${page}` });
    } catch (error) {
      console.error('Track error:', error.message);
      return res.status(500).json({ error: error.message });
    }
  }
  
  if (req.method === 'POST' && action === 'action') {
    try {
      const body = req.body || {};
      const { actionType, userId } = body;
      
      if (!actionType) {
        return res.status(400).json({ error: 'Action type is required' });
      }
      
      await recordAction(actionType, userId);
      
      return res.status(200).json({ success: true, message: `Tracked: ${actionType}` });
    } catch (error) {
      console.error('Action error:', error.message);
      return res.status(500).json({ error: error.message });
    }
  }
  
  if (req.method === 'GET' && action === 'get') {
    try {
      let days = 30;
      try {
        days = parseInt(req.query.days) || 30;
      } catch (e) {}
      
      const stats = await getStats(Math.min(days, 90));
      
      return res.status(200).json({
        ...stats,
        timestamp: new Date().toISOString(),
        daysRequested: days
      });
    } catch (error) {
      console.error('Get stats error:', error.message);
      return res.status(500).json({ error: error.message });
    }
  }
  
  return res.status(404).json({ error: 'Not found', action });
};