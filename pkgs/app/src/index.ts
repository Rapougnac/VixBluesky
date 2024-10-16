import { Hono } from 'hono';
import { XRPC, CredentialManager, AtpSessionData } from '@atcute/client';
import '@atcute/bluesky/lexicons';
import { getPost } from './routes/getPost';
import { getPostData } from './routes/getPostData';
import { getOEmbed } from './routes/getOEmbed';
import { getProfileData } from './routes/getProfileData';
import { getProfile } from './routes/getProfile';
import { HTTPException } from 'hono/http-exception';

const app = new Hono<Env>();

app.use('*', async (c, next) => {
  const creds = new CredentialManager({
    service: c.env.BSKY_SERVICE_URL,
    onRefresh(session) {
      return c.env.bskyx.put('session', JSON.stringify(session));
    },
    onExpired(session) {
      return c.env.bskyx.delete('session');
    },
    onSessionUpdate(session) {
      return c.env.bskyx.put('session', JSON.stringify(session));
    },
  });
  const agent = new XRPC({ handler: creds });
  try {
    const rawSession = await c.env.bskyx.get('session');
    if (rawSession) {
      const session = JSON.parse(rawSession) as AtpSessionData;
      await creds.resume(session);
    } else {
      await creds.login({
        identifier: c.env.BSKY_AUTH_USERNAME,
        password: c.env.BSKY_AUTH_PASSWORD,
      });
    }
    c.set('Agent', agent);
  } catch (error) {
    const err = new Error('Failed to login to Bluesky!', {
      cause: error,
    });
    throw new HTTPException(500, {
      message: `${err.message} \n\n ${err.cause} \n\n ${err.stack}`,
    });
  }
  return next();
});

app.get('/', async (c) => {
  return c.redirect('https://github.com/Rapougnac/VixBluesky');
});

app.get('/profile/:user/post/:post', getPost);
app.get('/https://bsky.app/profile/:user/post/:post', getPost);

app.get('/profile/:user/post/:post/json', getPostData);
app.get('/https://bsky.app/profile/:user/post/:post/json', getPostData);

app.get('/profile/:user', getProfile);
app.get('/https://bsky.app/profile/:user', getProfile);

app.get('/profile/:user/json', getProfileData);
app.get('/https://bsky.app/profile/:user/json', getProfileData);

app.get('/oembed', getOEmbed);

export default app;
