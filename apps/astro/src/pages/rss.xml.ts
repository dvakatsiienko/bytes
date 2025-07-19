import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context: any) {
    const postList = await getCollection('blog');

    return rss({
        title: 'ripeluokte | Blog',
        description: 'My journey learning Astro',
        site: context.site,
        items: postList.map((post: any) => ({
            title: post.data.title,
            pubDate: post.data.pubDate,
            description: post.data.description,
            link: `/posts/${post.id}/`,
        })),
        customData: `<language>en-us</language>`,
    });
}
