import axios from 'axios';
import SocialAccount from '../models/SocialAccount.js';

// Utility to build query strings
const toQueryString = obj => Object.entries(obj).map(([k,v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');

// Kick off OAuth flow
export const connectPlatform = async (req, res, next) => {
  try {
    const { platform } = req.params;
    let authUrl = '';
    const state = Math.random().toString(36).substr(2); // you may store in session or DB for CSRF protection

    if (platform === 'facebook') {
      const params = {
        client_id: process.env.FACEBOOK_CLIENT_ID,
        redirect_uri: process.env.FACEBOOK_REDIRECT_URI,
        state,
        scope: 'pages_show_list,instagram_basic,instagram_content_publish,pages_read_engagement',
        response_type: 'code'
      };
      authUrl = `https://www.facebook.com/v17.0/dialog/oauth?${toQueryString(params)}`;

    } else if (platform === 'instagram') {
      // Instagram uses Facebook Graph API for Business accounts
      const params = {
        client_id: process.env.INSTAGRAM_CLIENT_ID,
        redirect_uri: process.env.INSTAGRAM_REDIRECT_URI,
        scope: 'instagram_basic,instagram_content_publish',
        response_type: 'code',
        state
      };
      authUrl = `https://api.instagram.com/oauth/authorize?${toQueryString(params)}`;

    } else if (platform === 'linkedin') {
      const params = {
        response_type: 'code',
        client_id: process.env.LINKEDIN_CLIENT_ID,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
        state,
        scope: 'r_liteprofile r_emailaddress w_member_social'
      };
      authUrl = `https://www.linkedin.com/oauth/v2/authorization?${toQueryString(params)}`;

    } else if (platform === 'twitter') {
      // Note: Twitter uses OAuth 2.0 authorization code with PKCE or OAuth1.0a
      const params = {
        response_type: 'code',
        client_id: process.env.TWITTER_CLIENT_ID,
        redirect_uri: process.env.TWITTER_REDIRECT_URI,
        scope: 'tweet.write users.read offline.access',
        state,
        code_challenge: 'challenge',  // you need to generate code_challenge for PKCE
        code_challenge_method: 'plain'
      };
      authUrl = `https://twitter.com/i/oauth2/authorize?${toQueryString(params)}`;
    } else {
      return res.status(400).json({ message: 'Unsupported platform' });
    }

    // Optionally store state + userId in DB or session for CSRF check
    res.redirect(authUrl);

  } catch (err) {
    next(err);
  }
};

// Callback handler
export const callbackPlatform = async (req, res, next) => {
  try {
    const { platform } = req.params;
    const { code, state } = req.query;
    const userId = req.user._id; // user must already be authenticated

    if (!code) {
      return res.status(400).json({ message: 'Authorization code missing' });
    }

    let tokenResponse;
    let accountId;
    let accessToken;
    let refreshToken = null;
    let expiresAt = null;
    let scopes = [];

    if (platform === 'facebook' || platform === 'instagram') {
      // Exchange code for token
      const tokenUrl = 'https://graph.facebook.com/v17.0/oauth/access_token';
      const params = {
        client_id: process.env.FACEBOOK_CLIENT_ID,
        client_secret: process.env.FACEBOOK_CLIENT_SECRET,
        redirect_uri: process.env.FACEBOOK_REDIRECT_URI,
        code
      };
      tokenResponse = await axios.get(`${tokenUrl}?${toQueryString(params)}`);
      accessToken = tokenResponse.data.access_token;
      expiresAt = new Date(Date.now() + tokenResponse.data.expires_in * 1000);
      scopes = tokenResponse.data.scope?.split(',') || [];

      // For Instagram Business account id
      if (platform === 'instagram') {
        const igUrl = `https://graph.facebook.com/v17.0/me/accounts?access_token=${accessToken}`;
        const igRes = await axios.get(igUrl);
        const page = igRes.data.data[0];
        accountId = page.id;
      } else {
        // Facebook user or page
        const meUrl = `https://graph.facebook.com/me?fields=id&access_token=${accessToken}`;
        const meRes = await axios.get(meUrl);
        accountId = meRes.data.id;
      }

    } else if (platform === 'linkedin') {
      // Exchange code for token
      const tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
      const params = {
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET
      };
      tokenResponse = await axios.post(tokenUrl, toQueryString(params), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      accessToken = tokenResponse.data.access_token;
      expiresAt = new Date(Date.now() + tokenResponse.data.expires_in * 1000);
      scopes = []; // LinkedIn returns scope maybe via another endpoint

      // Fetch profile for accountId
      const profileRes = await axios.get('https://api.linkedin.com/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      accountId = profileRes.data.id;

    } else if (platform === 'twitter') {
      // Exchange code for token (OAuth2.0 PKCE)
      const tokenUrl = 'https://api.twitter.com/2/oauth2/token';
      const params = {
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.TWITTER_REDIRECT_URI,
        client_id: process.env.TWITTER_CLIENT_ID,
        code_verifier: 'verifier' // must match the challenge
      };
      tokenResponse = await axios.post(tokenUrl, toQueryString(params), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      accessToken = tokenResponse.data.access_token;
      refreshToken = tokenResponse.data.refresh_token;
      expiresAt = new Date(Date.now() + tokenResponse.data.expires_in * 1000);
      scopes = tokenResponse.data.scope?.split(' ') || [];

      // Get user ID
      const userRes = await axios.get('https://api.twitter.com/2/users/me', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      accountId = userRes.data.data.id;
    }

    // Save to DB
    const record = await SocialAccount.create({
      userId,
      platform,
      accountId,
      accessToken,
      refreshToken,
      expiresAt,
      scopes,
      connectedAt: new Date(),
      status: 'connected'
    });

    res.json({ message: `${platform} connected successfully`, record });

  } catch (err) {
    next(err);
  }
};
