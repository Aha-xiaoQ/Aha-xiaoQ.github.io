import { createGuestbookClient } from './client.mjs?v=sites-20261001';
let client;
export async function getCloudClient(){return client??=createGuestbookClient({baseUrl:'https://xiaoq-guestbook.hfutqdm.chatgpt.site'});}
export async function loadCloudPage(own,before){const api=await getCloudClient();return own?api.mine(before):api.wall(before);}
